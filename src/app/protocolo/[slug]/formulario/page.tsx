'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProtocol, type ProtocolField } from '@/lib/protocols'

interface FormularioPageProps {
    params: Promise<{ slug: string }>
}

const SECTIONS = [
    { id: 'privacy', label: 'Aviso de privacidad' },
    { id: 'basic', label: 'Datos básicos' },
    { id: 'clinical', label: 'Criterios clínicos' },
    { id: 'treatments', label: 'Tratamientos' },
    { id: 'exclusions', label: 'Verificación final' }
]

export default function FormularioPage({ params }: FormularioPageProps) {
    const router = useRouter()
    const [slug, setSlug] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<Record<string, unknown>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [privacyAccepted, setPrivacyAccepted] = useState(false)

    useEffect(() => {
        params.then(p => {
            setSlug(p.slug)
            setLoading(false)
        })
    }, [params])

    const protocol = slug ? getProtocol(slug) : undefined

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!protocol) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card text-center">
                    <h2>Protocolo no encontrado</h2>
                    <p className="text-muted">El protocolo solicitado no existe o no está disponible.</p>
                </div>
            </div>
        )
    }

    const currentSection = SECTIONS[currentStep]
    const sectionFields = currentSection.id !== 'privacy'
        ? protocol.fields.filter(f => f.section === currentSection.id)
        : []

    const handleInputChange = (name: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev }
                delete next[name]
                return next
            })
        }
    }

    const validateCurrentStep = (): boolean => {
        if (currentStep === 0) {
            // Privacy step
            if (!privacyAccepted) {
                setErrors({ privacy: 'Debe aceptar el aviso de privacidad para continuar' })
                return false
            }
            return true
        }

        const newErrors: Record<string, string> = {}

        const visibleFields = sectionFields.filter(field => {
            if (!field.conditionalOn) return true
            return formData[field.conditionalOn] === field.conditionalValue
        })

        for (const field of visibleFields) {
            if (field.required) {
                const value = formData[field.name]
                if (value === undefined || value === null || value === '') {
                    newErrors[field.name] = 'Este campo es requerido'
                }
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateCurrentStep()) {
            if (currentStep < SECTIONS.length - 1) {
                setCurrentStep(prev => prev + 1)
                window.scrollTo(0, 0)
            } else {
                handleSubmit()
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
            window.scrollTo(0, 0)
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const response = await fetch('/api/prescreening', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    protocol_slug: slug,
                    ...formData,
                    privacy_accepted: privacyAccepted,
                    contact_authorized: true
                })
            })

            const result = await response.json()

            if (response.ok) {
                // Redirect to result page with status
                router.push(`/protocolo/${slug}/resultado?status=${result.status}`)
            } else {
                throw new Error(result.error || 'Error al enviar el formulario')
            }
        } catch (error) {
            console.error('Submit error:', error)
            setErrors({ submit: error instanceof Error ? error.message : 'Error al enviar el formulario' })
        } finally {
            setSubmitting(false)
        }
    }

    const renderField = (field: ProtocolField) => {
        // Check conditional visibility
        if (field.conditionalOn) {
            if (formData[field.conditionalOn] !== field.conditionalValue) {
                return null
            }
        }

        const value = formData[field.name]
        const error = errors[field.name]

        return (
            <div key={field.name} className="form-group animate-fadeIn">
                <label className={`form-label ${field.required ? 'form-label-required' : ''}`}>
                    {field.label}
                </label>

                {field.type === 'text' && (
                    <input
                        type="text"
                        className="form-input"
                        value={(value as string) || ''}
                        onChange={e => handleInputChange(field.name, e.target.value)}
                        placeholder={field.hint}
                    />
                )}

                {field.type === 'email' && (
                    <input
                        type="email"
                        className="form-input"
                        value={(value as string) || ''}
                        onChange={e => handleInputChange(field.name, e.target.value)}
                        placeholder={field.hint}
                    />
                )}

                {field.type === 'tel' && (
                    <input
                        type="tel"
                        className="form-input"
                        value={(value as string) || ''}
                        onChange={e => handleInputChange(field.name, e.target.value)}
                        placeholder="Ej: 55 1234 5678"
                    />
                )}

                {field.type === 'date' && (
                    <input
                        type="date"
                        className="form-input"
                        value={(value as string) || ''}
                        onChange={e => handleInputChange(field.name, e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                )}

                {field.type === 'select' && field.options && (
                    <select
                        className="form-select"
                        value={(value as string) || ''}
                        onChange={e => handleInputChange(field.name, e.target.value)}
                    >
                        <option value="">Seleccione una opción</option>
                        {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )}

                {field.type === 'boolean' && (
                    <div className="form-checkbox-group">
                        <label className="form-radio">
                            <input
                                type="radio"
                                name={field.name}
                                checked={value === true}
                                onChange={() => handleInputChange(field.name, true)}
                            />
                            <span className="form-checkbox-label">Sí</span>
                        </label>
                        <label className="form-radio">
                            <input
                                type="radio"
                                name={field.name}
                                checked={value === false}
                                onChange={() => handleInputChange(field.name, false)}
                            />
                            <span className="form-checkbox-label">No</span>
                        </label>
                    </div>
                )}

                {field.hint && field.type !== 'text' && field.type !== 'email' && (
                    <p className="form-hint">{field.hint}</p>
                )}
                {error && <p className="form-error">{error}</p>}
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="form-wizard">
                {/* Header */}
                <div className="text-center mb-6">
                    <p className="text-muted text-sm mb-1">🧬 EUKARYA</p>
                    <h1 className="text-2xl font-semibold">{protocol.name}</h1>
                    <p className="text-secondary">{currentSection.label}</p>
                </div>

                {/* Progress */}
                <div className="form-progress">
                    {SECTIONS.map((_, index) => (
                        <div
                            key={index}
                            className={`form-progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                {/* Form Card */}
                <div className="card">
                    {/* Privacy Step */}
                    {currentStep === 0 && (
                        <div className="form-step active">
                            <h3 className="mb-4">Aviso de Privacidad</h3>

                            <div className="alert alert-info mb-4">
                                <p className="mb-3">
                                    La información que proporcione será utilizada exclusivamente para
                                    determinar su posible elegibilidad para participar en este estudio
                                    de investigación clínica.
                                </p>
                                <p className="mb-3">
                                    <strong>Sus datos serán:</strong>
                                </p>
                                <ul className="criteria-list">
                                    <li>Tratados de forma confidencial</li>
                                    <li>Almacenados de forma segura</li>
                                    <li>Utilizados solo por el equipo de investigación</li>
                                    <li>No compartidos con terceros sin su consentimiento</li>
                                </ul>
                            </div>

                            <label className="form-checkbox">
                                <input
                                    type="checkbox"
                                    checked={privacyAccepted}
                                    onChange={e => setPrivacyAccepted(e.target.checked)}
                                />
                                <span className="form-checkbox-label">
                                    He leído y acepto el aviso de privacidad. Autorizo el uso de mis
                                    datos para los fines descritos.
                                </span>
                            </label>

                            {errors.privacy && <p className="form-error mt-2">{errors.privacy}</p>}
                        </div>
                    )}

                    {/* Form Steps */}
                    {currentStep > 0 && (
                        <div className="form-step active">
                            {sectionFields.map(renderField)}
                        </div>
                    )}

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="alert alert-error mt-4">{errors.submit}</div>
                    )}

                    {/* Actions */}
                    <div className="form-actions">
                        {currentStep > 0 ? (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleBack}
                                disabled={submitting}
                            >
                                ← Anterior
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner"></span>
                                    Enviando...
                                </>
                            ) : currentStep === SECTIONS.length - 1 ? (
                                'Enviar cuestionario'
                            ) : (
                                'Siguiente →'
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-muted text-sm mt-6">
                    Paso {currentStep + 1} de {SECTIONS.length}
                </p>
            </div>
        </div>
    )
}
