'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Patient, PrescreeningStatus } from '@/lib/supabase'

const STATUS_CONFIG: Record<PrescreeningStatus, { label: string; class: string }> = {
    POSITIVE: { label: 'Positivo', class: 'badge-positive' },
    NEGATIVE: { label: 'Negativo', class: 'badge-negative' },
    REVIEW: { label: 'En Revisión', class: 'badge-review' },
    CONTACTED: { label: 'Contactado', class: 'badge-contacted' },
    SCHEDULED: { label: 'Agendado', class: 'badge-scheduled' },
    SCREENED: { label: 'Evaluado', class: 'badge-enrolled' },
    ENROLLED: { label: 'Enrolado', class: 'badge-enrolled' },
    EXCLUDED: { label: 'Excluido', class: 'badge-excluded' }
}

export default function DashboardPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    // Filters
    const [protocolFilter, setProtocolFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [searchFilter, setSearchFilter] = useState('')

    const fetchPatients = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (protocolFilter) params.set('protocol', protocolFilter)
            if (statusFilter) params.set('status', statusFilter)
            if (searchFilter) params.set('search', searchFilter)

            const response = await fetch(`/api/patients?${params}`)
            const data = await response.json()

            if (response.ok) {
                setPatients(data.patients || [])
                setTotal(data.total || 0)
            }
        } catch (error) {
            console.error('Fetch patients error:', error)
        } finally {
            setLoading(false)
        }
    }, [protocolFilter, statusFilter, searchFilter])

    useEffect(() => {
        fetchPatients()
    }, [fetchPatients])

    const handleExport = () => {
        const params = new URLSearchParams()
        if (protocolFilter) params.set('protocol', protocolFilter)
        if (statusFilter) params.set('status', statusFilter)
        window.open(`/api/export?${params}`, '_blank')
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div>
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="text-2xl font-semibold">Pacientes</h1>
                    <p className="text-muted">{total} registros encontrados</p>
                </div>
                <button onClick={handleExport} className="btn btn-secondary">
                    📥 Exportar CSV
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label className="filter-label">Protocolo</label>
                    <select
                        className="filter-input"
                        value={protocolFilter}
                        onChange={e => setProtocolFilter(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="sanofi-efc18419">Sanofi EFC18419</option>
                        <option value="lilly-kgbs">Lilly KGBS</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Estado</label>
                    <select
                        className="filter-input"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="POSITIVE">Positivo</option>
                        <option value="NEGATIVE">Negativo</option>
                        <option value="REVIEW">En Revisión</option>
                        <option value="CONTACTED">Contactado</option>
                        <option value="SCHEDULED">Agendado</option>
                        <option value="ENROLLED">Enrolado</option>
                        <option value="EXCLUDED">Excluido</option>
                    </select>
                </div>

                <div className="filter-group" style={{ flex: 1 }}>
                    <label className="filter-label">Buscar</label>
                    <input
                        type="text"
                        className="filter-input"
                        style={{ width: '100%' }}
                        placeholder="Nombre, ciudad o teléfono..."
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : patients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <p>No se encontraron pacientes</p>
                        <p className="text-sm text-muted mt-2">
                            Ajuste los filtros o espere nuevos registros
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Protocolo</th>
                                    <th>Estado</th>
                                    <th>Ciudad</th>
                                    <th>Fecha</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map(patient => {
                                    const statusConfig = STATUS_CONFIG[patient.status]
                                    return (
                                        <tr key={patient.id}>
                                            <td>
                                                <div className="font-medium">{patient.full_name}</div>
                                                <div className="text-sm text-muted">{patient.phone}</div>
                                            </td>
                                            <td>
                                                <span className="text-sm">
                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                    {(patient.protocol as any)?.name || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${statusConfig.class}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td>{patient.city}</td>
                                            <td className="text-muted">{formatDate(patient.created_at)}</td>
                                            <td>
                                                <Link
                                                    href={`/dashboard/pacientes/${patient.id}`}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    Ver →
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
