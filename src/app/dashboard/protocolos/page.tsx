import { protocols } from '@/lib/protocols'

export default function ProtocolosPage() {
    const protocolList = Object.values(protocols)

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1 className="text-2xl font-semibold">Protocolos</h1>
                    <p className="text-muted">{protocolList.length} protocolos activos</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {protocolList.map(protocol => (
                    <div key={protocol.slug} className="card">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">{protocol.name}</h3>
                                <p className="text-secondary">{protocol.indication}</p>
                            </div>
                            <span className="badge badge-positive">Activo</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div className="info-item">
                                <div className="info-label">Investigador Principal</div>
                                <div className="info-value">{protocol.piName}</div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-medium mb-2">Criterios de inclusión</h4>
                            <ul className="criteria-list">
                                {protocol.inclusionCriteria.map((criteria, index) => (
                                    <li key={index}>{criteria}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Criterios de exclusión</h4>
                            <ul className="criteria-list" style={{
                                // Override to show X instead of check
                            }}>
                                {protocol.exclusionCriteria.map((criteria, index) => (
                                    <li key={index} style={{ color: 'var(--status-negative)' }}>
                                        {criteria}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                            <div className="flex gap-4 text-sm text-muted">
                                <span>Link público:</span>
                                <a
                                    href={`/protocolo/${protocol.slug}`}
                                    target="_blank"
                                    className="text-primary"
                                >
                                    /protocolo/{protocol.slug}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
