'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Pacientes', icon: '👥' },
    { href: '/dashboard/protocolos', label: 'Protocolos', icon: '📋' },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState('')

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUserEmail(session.user.email || '')
            setLoading(false)
        }
        checkAuth()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">
                    🧬 EUKARYA
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <div className="text-sm text-muted mb-2">{userEmail}</div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                        ← Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="dashboard-main">
                {children}
            </main>
        </div>
    )
}
