import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Eukarya Investigación Clínica',
    default: 'Eukarya Investigación Clínica',
  },
  description: 'Participa en estudios clínicos innovadores y recibe atención médica especializada sin costo. Contribuimos al avance de la medicina.',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://eukarya-prescreening.vercel.app',
    siteName: 'Eukarya Investigación Clínica',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Eukarya Investigación Clínica',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@eukarya_mx',
    creator: '@eukarya_mx',
  },
  metadataBase: new URL('https://eukarya-prescreening.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
