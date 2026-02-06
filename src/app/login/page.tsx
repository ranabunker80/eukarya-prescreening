'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) {
                throw authError
            }

            router.push('/dashboard')
        } catch (err) {
            console.error('Login error:', err)
            setError('Credenciales inválidas. Por favor intente de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold mb-1">🧬 EUKARYA</h1>
                    <p className="text-muted">Panel de Coordinación</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="correo@eukarya.mx"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error mb-4">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Ingresando...
                            </>
                        ) : (
                            'Ingresar'
                        )}
                    </button>
                </form>

                <p className="text-center text-muted text-sm mt-6">
                    ¿Problemas para acceder?<br />
                    Contacta al administrador del sistema
                </p>
            </div>
        </div>
    )
}
