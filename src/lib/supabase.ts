import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client (lazy initialization)
let _supabase: SupabaseClient | null = null

export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_supabase) {
            if (!supabaseUrl || !supabaseAnonKey) {
                throw new Error('Supabase environment variables not configured')
            }
            _supabase = createClient(supabaseUrl, supabaseAnonKey)
        }
        return (_supabase as unknown as Record<string, unknown>)[prop as string]
    }
})

// Server-side client with service role (for API routes)
export function createServerClient(): SupabaseClient {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase environment variables not configured')
    }
    return createClient(supabaseUrl, supabaseServiceKey)
}

// Types
export type PrescreeningStatus =
    | 'POSITIVE'
    | 'NEGATIVE'
    | 'REVIEW'
    | 'CONTACTED'
    | 'SCHEDULED'
    | 'SCREENED'
    | 'ENROLLED'
    | 'EXCLUDED'

export type UserRole = 'ADMIN' | 'COORDINATOR' | 'DOCTOR'

export interface Protocol {
    id: string
    slug: string
    name: string
    sponsor: string
    pi_name: string
    indication: string
    description: string
    inclusion_criteria: string[]
    exclusion_criteria: string[]
    active: boolean
    created_at: string
}

export interface Patient {
    id: string
    protocol_id: string
    protocol?: Protocol
    full_name: string
    birth_date: string
    sex: 'M' | 'F'
    city: string
    phone: string
    email?: string
    clinical_data: Record<string, unknown>
    treatments: Record<string, unknown>
    exclusion_answers: Record<string, unknown>
    status: PrescreeningStatus
    internal_notes?: string
    contact_authorized: boolean
    privacy_accepted: boolean
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    role: UserRole
    name: string
    active: boolean
    created_at: string
}
