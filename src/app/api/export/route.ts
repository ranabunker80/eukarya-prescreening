import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient()
        const { searchParams } = new URL(request.url)

        // Get filters
        const protocol = searchParams.get('protocol')
        const status = searchParams.get('status')

        // Build query
        let query = supabase
            .from('patients')
            .select(`
        id,
        full_name,
        birth_date,
        sex,
        city,
        phone,
        email,
        status,
        created_at,
        protocol:protocols(slug, name, sponsor)
      `)
            .order('created_at', { ascending: false })

        // Apply filters
        if (protocol) {
            const { data: protocolData } = await supabase
                .from('protocols')
                .select('id')
                .eq('slug', protocol)
                .single()

            if (protocolData) {
                query = query.eq('protocol_id', protocolData.id)
            }
        }

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            console.error('Export query error:', error)
            return NextResponse.json(
                { error: 'Error al exportar datos' },
                { status: 500 }
            )
        }

        // Generate CSV
        const headers = [
            'Nombre',
            'Fecha Nacimiento',
            'Sexo',
            'Ciudad',
            'Teléfono',
            'Email',
            'Protocolo',
            'Estado',
            'Fecha Registro'
        ]

        const rows = data.map(patient => [
            patient.full_name,
            patient.birth_date,
            patient.sex === 'M' ? 'Masculino' : 'Femenino',
            patient.city,
            patient.phone,
            patient.email || '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (patient.protocol as any)?.name || '',
            patient.status,
            new Date(patient.created_at).toLocaleDateString('es-MX')
        ])

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n')

        // Add BOM for Excel compatibility
        const bom = '\uFEFF'

        return new NextResponse(bom + csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="pacientes-${new Date().toISOString().split('T')[0]}.csv"`
            }
        })

    } catch (error) {
        console.error('Export API error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
