import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient()
        const { searchParams } = new URL(request.url)

        // Get filters
        const protocol = searchParams.get('protocol')
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Build query
        let query = supabase
            .from('patients')
            .select(`
        *,
        protocol:protocols(id, slug, name, sponsor)
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

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

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Patients query error:', error)
            return NextResponse.json(
                { error: 'Error al obtener pacientes' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            patients: data,
            total: count,
            limit,
            offset
        })

    } catch (error) {
        console.error('Patients API error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
