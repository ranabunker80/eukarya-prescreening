'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Patient, PrescreeningStatus } from '@/lib/supabase'

interface PatientDetailPageProps {
    params: Promise<{ id: string }>
}

const STATUS_OPTIONS: { value: PrescreeningStatus; label: string }[] = [
    { value: 'POSITIVE', label: 'Positivo' },
    { value: 'NEGATIVE', label: 'Negativo' },
    { value: 'REVIEW', label: 'En Revisión' },
    { value: 'CONTACTED', label: 'Contactado' },
    { value: 'SCHEDULED', label: 'Agendado' },
    { value: 'SCREENED', label: 'Evaluado' },
    { value: 'ENROLLED', label: 'Enrolado' },
    { value: 'EXCLUDED', label: 'Excluido' }
]

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

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
    const router = useRouter()
    const [patientId, setPatientId] = useState<string>('')
    const [patient, setPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [notes, setNotes] = useState('')
    const [newStatus, setNewStatus] = useState<PrescreeningStatus | ''>('')
    const [showStatusModal, setShowStatusModal] = useState(false)

    useEffect(() => {
        params.then(p => setPatientId(p.id))
    }, [params])

    useEffect(() => {
        if (!patientId) return

        const fetchPatient = async () => {
            try {
                const response = await fetch(`/api/patients/${patientId}`)
                if (response.ok) {
                    const data = await response.json()
                    setPatient(data)
                    setNotes(data.internal_notes || '')
                } else {
                    router.push('/dashboard')
                }
            } catch (error) {
                console.error('Fetch patient error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPatient()
    }, [patientId, router])

    const handleSaveNotes = async () => {
        if (!patient) return
        setSaving(true)
        try {
            const response = await fetch(`/api/patients/${patient.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ internal_notes: notes })
            })
            if (response.ok) {
                const updated = await response.json()
                setPatient(updated)
            }
        } catch (error) {
            console.error('Save notes error:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleStatusChange = async () => {
        if (!patient || !newStatus) return
        setSaving(true)
        try {
            const response = await fetch(`/api/patients/${patient.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (response.ok) {
                const updated = await response.json()
                setPatient(updated)
                setShowStatusModal(false)
                setNewStatus('')
            }
        } catch (error) {
            console.error('Status change error:', error)
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const calculateAge = (birthDate: string) => {
        const birth = new Date(birthDate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="text-center py-16">
                <p className="text-muted">Paciente no encontrado</p>
            </div>
        )
    }

    const statusConfig = STATUS_CONFIG[patient.status]

    return (
        <div>
            {/* Back button */}
            <div className="mb-4">
                <Link href="/dashboard" className="btn btn-ghost btn-sm">
                    ← Volver a lista
                </Link>
            </div>

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="text-2xl font-semibold">{patient.full_name}</h1>
                    <p className="text-muted">
                        Registrado el {formatDate(patient.created_at)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className={`badge ${statusConfig.class}`} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                        {statusConfig.label}
                    </span>
                    <button
                        onClick={() => setShowStatusModal(true)}
                        className="btn btn-secondary btn-sm"
                    >
                        Cambiar estado
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="patient-detail">
                {/* Left Column - Patient Info */}
                <div>
                    {/* Basic Info */}
                    <div className="card mb-4">
                        <h3 className="mb-4">Información básica</h3>
                        <div className="patient-info-grid">
                            <div className="info-item">
                                <div className="info-label">Fecha de nacimiento</div>
                                <div className="info-value">
                                    {formatDate(patient.birth_date)} ({calculateAge(patient.birth_date)} años)
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Sexo</div>
                                <div className="info-value">{patient.sex === 'M' ? 'Masculino' : 'Femenino'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Ciudad</div>
                                <div className="info-value">{patient.city}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Teléfono</div>
                                <div className="info-value">
                                    <a href={`tel:${patient.phone}`} className="text-primary">{patient.phone}</a>
                                </div>
                            </div>
                            {patient.email && (
                                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                    <div className="info-label">Email</div>
                                    <div className="info-value">
                                        <a href={`mailto:${patient.email}`} className="text-primary">{patient.email}</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clinical Data */}
                    <div className="card mb-4">
                        <h3 className="mb-4">Datos clínicos</h3>
                        <div className="flex flex-col gap-3">
                            {Object.entries(patient.clinical_data || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <span className="text-secondary">{key.replace(/_/g, ' ')}</span>
                                    <span className="font-medium">{value === true ? 'Sí' : value === false ? 'No' : String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Treatments */}
                    <div className="card mb-4">
                        <h3 className="mb-4">Tratamientos previos</h3>
                        <div className="flex flex-col gap-3">
                            {Object.entries(patient.treatments || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <span className="text-secondary">{key.replace(/_/g, ' ')}</span>
                                    <span className="font-medium">{value === true ? 'Sí' : value === false ? 'No' : String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exclusions */}
                    <div className="card">
                        <h3 className="mb-4">Criterios de exclusión</h3>
                        <div className="flex flex-col gap-3">
                            {Object.entries(patient.exclusion_answers || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <span className="text-secondary">{key.replace(/_/g, ' ')}</span>
                                    <span className={`font-medium ${value === true ? 'text-red-500' : ''}`}>
                                        {value === true ? '⚠️ Sí' : value === false ? 'No' : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Notes & Protocol */}
                <div>
                    {/* Protocol */}
                    <div className="card mb-4">
                        <h3 className="mb-4">Protocolo</h3>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <div className="info-value">{(patient.protocol as any)?.name || '-'}</div>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <div className="text-muted text-sm">{(patient.protocol as any)?.sponsor}</div>
                    </div>

                    {/* Internal Notes */}
                    <div className="card">
                        <h3 className="mb-4">Notas internas</h3>
                        <textarea
                            className="form-textarea"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Escriba notas sobre este paciente..."
                            rows={6}
                        />
                        <button
                            onClick={handleSaveNotes}
                            className="btn btn-primary mt-3"
                            disabled={saving || notes === (patient.internal_notes || '')}
                        >
                            {saving ? 'Guardando...' : 'Guardar notas'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Change Modal */}
            {showStatusModal && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Cambiar estado</h3>
                            <button onClick={() => setShowStatusModal(false)} className="btn btn-ghost btn-sm">✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Nuevo estado</label>
                                <select
                                    className="form-select"
                                    value={newStatus}
                                    onChange={e => setNewStatus(e.target.value as PrescreeningStatus)}
                                >
                                    <option value="">Seleccione un estado</option>
                                    {STATUS_OPTIONS.filter(opt => opt.value !== patient.status).map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowStatusModal(false)} className="btn btn-secondary">
                                Cancelar
                            </button>
                            <button onClick={handleStatusChange} className="btn btn-primary" disabled={!newStatus || saving}>
                                {saving ? 'Guardando...' : 'Guardar cambio'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
