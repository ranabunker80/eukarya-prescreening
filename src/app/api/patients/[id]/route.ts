import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, PrescreeningStatus } from '@/lib/supabase'

interface RouteContext {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const supabase = createServerClient()
        const { id } = await context.params

        const { data, error } = await supabase
            .from('patients')
            .select(`
        *,
        protocol:protocols(*)
      `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Patient query error:', error)
            return NextResponse.json(
                { error: 'Paciente no encontrado' },
                { status: 404 }
            )
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error('Patient GET error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const supabase = createServerClient()
        const { id } = await context.params
        const body = await request.json()

        const updateData: Record<string, unknown> = {}

        // Status update
        if (body.status) {
            const validStatuses: PrescreeningStatus[] = [
                'POSITIVE', 'NEGATIVE', 'REVIEW', 'CONTACTED',
                'SCHEDULED', 'SCREENED', 'ENROLLED', 'EXCLUDED'
            ]
            if (!validStatuses.includes(body.status)) {
                return NextResponse.json(
                    { error: 'Estado no válido' },
                    { status: 400 }
                )
            }
            updateData.status = body.status
        }

        // Internal notes update
        if (body.internal_notes !== undefined) {
            updateData.internal_notes = body.internal_notes
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'No hay datos para actualizar' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('patients')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Patient update error:', error)
            return NextResponse.json(
                { error: 'Error al actualizar paciente' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error('Patient PATCH error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
