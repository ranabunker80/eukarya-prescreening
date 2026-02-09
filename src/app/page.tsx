import Link from 'next/link'
import { protocols } from '@/lib/protocols'

export default function HomePage() {
  const protocolList = Object.values(protocols)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="landing-hero">
        <div className="container">
          <h1 style={{ fontSize: '2.75rem' }}>🧬 EUKARYA</h1>
          <p className="text-lg">Investigación Clínica</p>
        </div>
      </div>

      {/* Content */}
      <div className="landing-content">
        <section className="landing-section animate-fadeIn">
          <h2 className="text-center mb-6">Estudios Clínicos Disponibles</h2>

          <div className="flex flex-col gap-4">
            {protocolList.map((protocol) => (
              <Link
                key={protocol.slug}
                href={`/protocolo/${protocol.slug}`}
                className="card"
                style={{ textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="mb-1">{protocol.name}</h3>
                    <p className="text-secondary mb-2">{protocol.indication}</p>
                    <p className="text-sm text-muted">
                      Investigador: {protocol.piName}
                    </p>
                  </div>
                  <span className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                    Ver detalles →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-section animate-fadeIn">
          <div className="alert alert-info">
            <strong>¿Qué es un estudio clínico?</strong>
            <p className="mt-2">
              Los estudios clínicos son investigaciones médicas que ayudan a desarrollar
              nuevos tratamientos. Los participantes reciben atención médica especializada
              y contribuyen al avance de la medicina.
            </p>
          </div>
        </section>

        <footer className="text-center mt-8">
          <p className="text-muted text-sm mb-4">
            © {new Date().getFullYear()} Eukarya Investigación Clínica
          </p>
          <Link href="/login" className="text-sm text-muted">
            Acceso personal interno →
          </Link>
        </footer>
      </div>
    </div>
  )
}
