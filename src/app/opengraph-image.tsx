import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Eukarya Investigación Clínica'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        fontSize: 60,
                        fontWeight: 'bold',
                        marginBottom: 20,
                        letterSpacing: '-0.025em',
                    }}
                >
                    🧬 EUKARYA
                </div>
                <div
                    style={{
                        fontSize: 30,
                        opacity: 0.9,
                    }}
                >
                    Investigación Clínica
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
