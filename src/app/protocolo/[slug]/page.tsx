import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getProtocol, getProtocolSlugs } from '@/lib/protocols'

interface ProtocolPageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return getProtocolSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProtocolPageProps): Promise<Metadata> {
    const { slug } = await params
    const protocol = getProtocol(slug)

    if (!protocol) {
        return {
            title: 'Protocolo no encontrado',
        }
    }

    return {
        title: `Estudio para ${protocol.indication}`,
        description: `¿Padeces ${protocol.indication}? Verifica si calificas para este estudio clínico de ${protocol.sponsor}. Tratamiento y atención médica sin costo.`,
        openGraph: {
            title: `Estudio Clínico: ${protocol.indication}`,
            description: `Participa en la investigación de nuevos tratamientos para ${protocol.indication}. Revisa los criterios de elegibilidad aquí.`,
            images: [
                {
                    url: `/protocolo/${slug}/opengraph-image`,
                    width: 1200,
                    height: 630,
                    alt: protocol.name,
                },
            ],
        },
    }
}

export default async function ProtocolLandingPage({ params }: ProtocolPageProps) {
    const { slug } = await params
    const protocol = getProtocol(slug)

    if (!protocol) {
        notFound()
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="landing-hero">
                <div className="container">
                    <p className="text-lg mb-2" style={{ opacity: 0.9 }}>🧬 EUKARYA Investigación Clínica</p>
                    <h1>{protocol.name}</h1>
                    <p>{protocol.indication}</p>
                </div>
            </div>

            {/* Content */}
            <div className="landing-content">
                {/* Study Info */}
                <section className="landing-section animate-fadeIn">
                    <div className="card">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                            <div className="info-item">
                                <div className="info-label">Patrocinador</div>
                                <div className="info-value">{protocol.sponsor}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Investigador Principal</div>
                                <div className="info-value">{protocol.piName}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Description */}
                <section className="landing-section animate-fadeIn">
                    <h2>📋 ¿De qué trata este estudio?</h2>
                    <p className="text-lg">{protocol.description}</p>
                </section>

                {/* Inclusion Criteria */}
                <section className="landing-section animate-fadeIn">
                    <h2>👤 ¿Quién puede participar?</h2>
                    <ul className="criteria-list">
                        {protocol.inclusionCriteria.map((criteria, index) => (
                            <li key={index}>{criteria}</li>
                        ))}
                    </ul>
                </section>

                {/* Important Notice */}
                <section className="landing-section animate-fadeIn">
                    <div className="alert alert-info">
                        <strong>Importante:</strong> Este es solo un cuestionario preliminar. La elegibilidad
                        final será determinada por nuestro equipo médico durante una evaluación presencial.
                    </div>
                </section>

                {/* CTA */}
                <section className="landing-cta animate-fadeIn">
                    <h3 className="mb-2">¿Le gustaría saber si podría participar?</h3>
                    <p className="text-secondary mb-6">
                        Complete nuestro breve cuestionario de pre-evaluación (3-5 minutos)
                    </p>
                    <Link href={`/protocolo/${slug}/formulario`} className="btn btn-primary btn-lg">
                        Verificar si califico →
                    </Link>
                </section>

                {/* Footer */}
                <footer className="text-center mt-8 text-muted text-sm">
                    <p>
                        Sus datos serán tratados de forma confidencial según nuestro{' '}
                        <a href="#" className="text-primary">aviso de privacidad</a>.
                    </p>
                </footer>
            </div>
        </div>
    )
}
