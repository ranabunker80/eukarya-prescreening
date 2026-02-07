import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getProtocol } from '@/lib/protocols'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { protocol_slug, ...formData } = data

        // Get protocol configuration
        const protocol = getProtocol(protocol_slug)
        if (!protocol) {
            return NextResponse.json(
                { error: 'Protocolo no válido' },
                { status: 400 }
            )
        }

        // Evaluate prescreening
        const status = protocol.evaluate(formData)

        // Prepare patient data
        const supabase = createServerClient()

        // Get protocol ID from database
        const { data: protocolData, error: protocolError } = await supabase
            .from('protocols')
            .select('id')
            .eq('slug', protocol_slug)
            .single()

        if (protocolError || !protocolData) {
            console.error('Protocol lookup error:', protocolError)
            return NextResponse.json(
                { error: 'Error al buscar protocolo' },
                { status: 500 }
            )
        }

        // Separate basic info from clinical data
        const basicFields = ['full_name', 'birth_date', 'sex', 'city', 'phone', 'email', 'privacy_accepted', 'contact_authorized']
        const clinicalData: Record<string, unknown> = {}
        const treatments: Record<string, unknown> = {}
        const exclusionAnswers: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(formData)) {
            if (basicFields.includes(key)) continue

            const field = protocol.fields.find(f => f.name === key)
            if (field) {
                switch (field.section) {
                    case 'clinical':
                        clinicalData[key] = value
                        break
                    case 'treatments':
                        treatments[key] = value
                        break
                    case 'exclusions':
                        exclusionAnswers[key] = value
                        break
                }
            }
        }

        // Insert patient
        const { data: patient, error: insertError } = await supabase
            .from('patients')
            .insert({
                protocol_id: protocolData.id,
                full_name: formData.full_name,
                birth_date: formData.birth_date,
                sex: formData.sex,
                city: formData.city,
                phone: formData.phone,
                email: formData.email || null,
                clinical_data: clinicalData,
                treatments: treatments,
                exclusion_answers: exclusionAnswers,
                status: status,
                privacy_accepted: formData.privacy_accepted || false,
                contact_authorized: formData.contact_authorized || false
            })
            .select()
            .single()

        if (insertError) {
            console.error('Insert error:', insertError)
            return NextResponse.json(
                { error: 'Error al guardar los datos' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            status: status,
            patient_id: patient.id
        })

    } catch (error) {
        console.error('Prescreening API error:', error)
        const message = error instanceof Error ? error.message : 'Error interno del servidor'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
