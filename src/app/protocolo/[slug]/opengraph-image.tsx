import { ImageResponse } from 'next/og'
import { getProtocol } from '@/lib/protocols'

export const runtime = 'edge'

export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

interface Props {
    params: { slug: string }
}

export default async function Image({ params }: Props) {
    const protocol = getProtocol(params.slug)

    if (!protocol) {
        return new ImageResponse(
            (
                <div
                    style={{
                        background: '#f3f4f6',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 40,
                        color: '#374151',
                    }}
                >
                    Protocolo no encontrado
                </div>
            ),
            { ...size }
        )
    }

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
            >
                {/* Background Accent */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '20px',
                        background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                    }}
                />

                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '80px',
                    }}
                >
                    {/* Tag */}
                    <div
                        style={{
                            display: 'flex',
                            background: '#eff6ff',
                            color: '#2563eb',
                            padding: '8px 20px',
                            borderRadius: '50px',
                            fontSize: 24,
                            fontWeight: 600,
                            width: 'fit-content',
                            marginBottom: 30,
                        }}
                    >
                        Estudio Clínico Activo
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 800,
                            color: '#111827',
                            lineHeight: 1.1,
                            marginBottom: 20,
                            letterSpacing: '-0.03em',
                        }}
                    >
                        {protocol.indication}
                    </div>

                    {/* Subtitle */}
                    <div
                        style={{
                            fontSize: 36,
                            color: '#4b5563',
                            marginBottom: 60,
                            maxWidth: '900px',
                        }}
                    >
                        ¿Padeces esta condición? Verifica si calificas para recibir tratamiento sin costo.
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            borderTop: '2px solid #e5e7eb',
                            paddingTop: 40,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ fontSize: 32, marginRight: 15 }}>🧬</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>EUKARYA</div>
                        </div>

                        <div style={{ fontSize: 24, color: '#6b7280' }}>
                            Patrocinado por {protocol.sponsor}
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
