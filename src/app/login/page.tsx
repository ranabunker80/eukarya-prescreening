'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            if (isLogin) {
                // LOGIN LOGIC
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })
                if (authError) throw authError
                router.push('/dashboard')

            } else {
                // REGISTRATION LOGIC
                if (!email.endsWith('@eukarya.mx')) {
                    throw new Error('Solo se permiten correos corporativos (@eukarya.mx)')
                }

                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name }
                    }
                })

                if (signUpError) throw signUpError

                setSuccess('Cuenta creada exitosamente. Por favor verifica tu correo para confirmar.')
                setIsLogin(true)
            }
        } catch (err) {
            console.error('Auth error:', err)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).message || 'Error de autenticación')
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

                {/* Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button
                        type="button"
                        className={`flex-1 py-1 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-1 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Registrarse
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group animate-fadeIn">
                            <label className="form-label">Nombre completo</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Juan Pérez"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="nombre@eukarya.mx"
                            required
                        />
                        {!isLogin && (
                            <p className="text-xs text-muted mt-1">Solo correos @eukarya.mx</p>
                        )}
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
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error mb-4 text-sm">{error}</div>
                    )}

                    {success && (
                        <div className="alert alert-info mb-4 text-sm">{success}</div>
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
                                {isLogin ? 'Ingresando...' : 'Registrando...'}
                            </>
                        ) : (
                            isLogin ? 'Ingresar' : 'Crear cuenta'
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
