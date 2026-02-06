'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ResultContent() {
    const searchParams = useSearchParams()
    const status = searchParams.get('status') || 'REVIEW'

    const resultConfig = {
        POSITIVE: {
            icon: '✓',
            iconClass: 'positive',
            title: '¡Gracias por su interés!',
            message: 'Según sus respuestas, usted podría ser candidato para participar en este estudio. Nuestro equipo se pondrá en contacto con usted en los próximos días hábiles para agendar una evaluación presencial.',
            submessage: 'Por favor mantenga su teléfono disponible.'
        },
        NEGATIVE: {
            icon: '✕',
            iconClass: 'negative',
            title: 'Gracias por completar el cuestionario',
            message: 'De acuerdo con la información proporcionada, actualmente no cumple con los criterios de elegibilidad para este estudio en particular.',
            submessage: 'Le invitamos a explorar otros estudios que podrían ser adecuados para usted.'
        },
        REVIEW: {
            icon: '⏳',
            iconClass: 'review',
            title: 'Cuestionario recibido',
            message: 'Su información ha sido registrada exitosamente. Nuestro equipo médico revisará su caso detenidamente y se pondrá en contacto con usted.',
            submessage: 'Esto puede tomar de 2 a 5 días hábiles.'
        }
    }

    const config = resultConfig[status as keyof typeof resultConfig] || resultConfig.REVIEW

    return (
        <div className="result-screen">
            <div className="card result-card animate-fadeIn">
                <div className={`result-icon ${config.iconClass}`}>
                    {config.icon}
                </div>

                <h1 className="text-2xl font-semibold mb-4">{config.title}</h1>

                <p className="text-secondary mb-4">{config.message}</p>

                <p className="text-muted text-sm mb-6">{config.submessage}</p>

                <div className="flex flex-col gap-3">
                    <Link href="/" className="btn btn-primary">
                        Volver al inicio
                    </Link>
                </div>

                <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-muted text-sm">
                        ¿Tiene preguntas?<br />
                        Contáctenos en <a href="mailto:investigacion@eukarya.mx" className="text-primary">investigacion@eukarya.mx</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function ResultadoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        }>
            <ResultContent />
        </Suspense>
    )
}
