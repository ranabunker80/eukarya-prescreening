import type { PrescreeningStatus } from './supabase'

export interface ProtocolField {
    name: string
    label: string
    type: 'text' | 'date' | 'tel' | 'email' | 'select' | 'boolean' | 'textarea'
    required: boolean
    options?: { value: string; label: string }[]
    conditionalOn?: string
    conditionalValue?: unknown
    section: 'basic' | 'clinical' | 'treatments' | 'exclusions'
    hint?: string
}

export interface ProtocolConfig {
    slug: string
    name: string
    sponsor: string
    piName: string
    indication: string
    description: string
    inclusionCriteria: string[]
    exclusionCriteria: string[]
    fields: ProtocolField[]
    evaluate: (data: Record<string, unknown>) => PrescreeningStatus
}

// Calculate age from birth date
export function calculateAge(birthDate: string): number {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

// Sanofi EFC18419 Protocol Configuration
export const sanofiEFC18419: ProtocolConfig = {
    slug: 'sanofi-efc18419',
    name: 'Estudio CEREN-2',
    sponsor: 'Sanofi',
    piName: 'Dr. Lino Guevara',
    indication: 'Rinosinusitis crónica con pólipos nasales (CRSwNP)',
    description: 'Estudio de investigación para evaluar un tratamiento en pacientes con rinosinusitis crónica con pólipos nasales que no han respondido adecuadamente al tratamiento estándar.',
    inclusionCriteria: [
        'Adultos mayores de 18 años',
        'Diagnóstico confirmado de pólipos nasales',
        'Síntomas persistentes por más de 12 semanas',
        'Falla a tratamiento estándar (corticosteroides nasales/orales)'
    ],
    exclusionCriteria: [
        'Infección activa significativa',
        'Uso actual de otro medicamento biológico',
        'Embarazo o lactancia',
        'Inmunoterapia activa'
    ],
    fields: [
        // Basic info
        { name: 'full_name', label: 'Nombre completo', type: 'text', required: true, section: 'basic' },
        { name: 'birth_date', label: 'Fecha de nacimiento', type: 'date', required: true, section: 'basic' },
        {
            name: 'sex', label: 'Sexo', type: 'select', required: true, section: 'basic', options: [
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Femenino' }
            ]
        },
        { name: 'city', label: 'Ciudad / Zona', type: 'text', required: true, section: 'basic' },
        { name: 'phone', label: 'Teléfono de contacto', type: 'tel', required: true, section: 'basic' },
        { name: 'email', label: 'Correo electrónico', type: 'email', required: false, section: 'basic', hint: 'Opcional, para envío de información' },

        // Clinical criteria
        { name: 'nasal_polyps', label: '¿Tiene pólipos nasales diagnosticados?', type: 'boolean', required: true, section: 'clinical' },
        { name: 'symptoms_over_12_weeks', label: '¿Sus síntomas han persistido por más de 12 semanas (3 meses)?', type: 'boolean', required: true, section: 'clinical' },
        { name: 'treatment_failure', label: '¿Ha usado corticosteroides nasales u orales sin mejoría suficiente?', type: 'boolean', required: true, section: 'clinical' },

        // Treatments
        { name: 'previous_biologic', label: '¿Ha usado algún medicamento biológico previamente?', type: 'boolean', required: true, section: 'treatments' },
        {
            name: 'which_biologic', label: '¿Cuál biológico?', type: 'select', required: false, section: 'treatments', conditionalOn: 'previous_biologic', conditionalValue: true, options: [
                { value: 'dupixent', label: 'Dupixent (dupilumab)' },
                { value: 'xolair', label: 'Xolair (omalizumab)' },
                { value: 'nucala', label: 'Nucala (mepolizumab)' },
                { value: 'fasenra', label: 'Fasenra (benralizumab)' },
                { value: 'other', label: 'Otro' }
            ]
        },
        {
            name: 'last_biologic_dose', label: '¿Hace cuánto fue su última dosis?', type: 'select', required: false, section: 'treatments', conditionalOn: 'previous_biologic', conditionalValue: true, options: [
                { value: 'less_than_3_months', label: 'Menos de 3 meses' },
                { value: '3_to_6_months', label: '3 a 6 meses' },
                { value: 'more_than_6_months', label: 'Más de 6 meses' }
            ]
        },
        { name: 'immunotherapy', label: '¿Recibe o ha recibido inmunoterapia con alérgenos?', type: 'boolean', required: true, section: 'treatments' },
        {
            name: 'immunotherapy_status', label: '¿La inmunoterapia está activa o suspendida?', type: 'select', required: false, section: 'treatments', conditionalOn: 'immunotherapy', conditionalValue: true, options: [
                { value: 'active', label: 'Activa (la sigo recibiendo)' },
                { value: 'suspended', label: 'Suspendida' }
            ]
        },

        // Exclusions
        { name: 'active_infection', label: '¿Tiene alguna infección activa importante actualmente?', type: 'boolean', required: true, section: 'exclusions' },
        { name: 'concurrent_biologic', label: '¿Está usando actualmente otro medicamento biológico?', type: 'boolean', required: true, section: 'exclusions' },
        { name: 'pregnant_or_lactating', label: '¿Está embarazada o en período de lactancia?', type: 'boolean', required: true, section: 'exclusions' }
    ],
    evaluate: (data) => {
        // Absolute exclusions
        if (data.active_infection === true) return 'NEGATIVE'
        if (data.concurrent_biologic === true) return 'NEGATIVE'
        if (data.pregnant_or_lactating === true) return 'NEGATIVE'
        if (data.immunotherapy === true && data.immunotherapy_status === 'active') return 'NEGATIVE'

        // Age check (must be 18+)
        if (data.birth_date) {
            const age = calculateAge(data.birth_date as string)
            if (age < 18) return 'NEGATIVE'
        }

        // Inclusion criteria
        const hasPolyps = data.nasal_polyps === true
        const symptomsDuration = data.symptoms_over_12_weeks === true
        const treatmentFailure = data.treatment_failure === true

        if (!hasPolyps || !symptomsDuration) return 'NEGATIVE'

        // Previous biologic without adequate washout -> needs review
        if (data.previous_biologic === true && data.last_biologic_dose === 'less_than_3_months') {
            return 'REVIEW'
        }

        if (hasPolyps && symptomsDuration && treatmentFailure) {
            return 'POSITIVE'
        }

        return 'REVIEW'
    }
}

// Lilly KGBS Protocol Configuration
export const lillyKGBS: ProtocolConfig = {
    slug: 'lilly-kgbs',
    name: 'Estudio ARIA-PAR',
    sponsor: 'Eli Lilly',
    piName: 'Dra. Dora Valdes',
    indication: 'Rinitis alérgica perenne',
    description: 'Estudio de investigación para evaluar un nuevo tratamiento en pacientes con rinitis alérgica perenne que no han logrado control adecuado con tratamientos convencionales.',
    inclusionCriteria: [
        'Personas de 12 años o más',
        'Diagnóstico de rinitis alérgica perenne',
        'Síntomas persistentes durante todo el año',
        'Falla o respuesta inadecuada a antihistamínicos y/o corticosteroides nasales'
    ],
    exclusionCriteria: [
        'Infección respiratoria activa',
        'Embarazo o lactancia',
        'Inmunoterapia con alérgenos activa',
        'Uso de biológico en los últimos 6 meses'
    ],
    fields: [
        // Basic info
        { name: 'full_name', label: 'Nombre completo', type: 'text', required: true, section: 'basic' },
        { name: 'birth_date', label: 'Fecha de nacimiento', type: 'date', required: true, section: 'basic' },
        {
            name: 'sex', label: 'Sexo', type: 'select', required: true, section: 'basic', options: [
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Femenino' }
            ]
        },
        { name: 'city', label: 'Ciudad / Zona', type: 'text', required: true, section: 'basic' },
        { name: 'phone', label: 'Teléfono de contacto', type: 'tel', required: true, section: 'basic' },
        { name: 'email', label: 'Correo electrónico', type: 'email', required: false, section: 'basic', hint: 'Opcional' },

        // Clinical criteria
        { name: 'perennial_rhinitis', label: '¿Tiene diagnóstico de rinitis alérgica perenne?', type: 'boolean', required: true, section: 'clinical' },
        { name: 'persistent_symptoms', label: '¿Sus síntomas están presentes durante todo el año?', type: 'boolean', required: true, section: 'clinical' },
        { name: 'treatment_failure', label: '¿Ha probado antihistamínicos o corticosteroides nasales sin control adecuado?', type: 'boolean', required: true, section: 'clinical' },

        // Treatments
        { name: 'previous_biologic', label: '¿Ha usado algún medicamento biológico previamente?', type: 'boolean', required: true, section: 'treatments' },
        {
            name: 'last_biologic_date', label: '¿Hace cuánto fue su última dosis?', type: 'select', required: false, section: 'treatments', conditionalOn: 'previous_biologic', conditionalValue: true, options: [
                { value: 'less_than_6_months', label: 'Menos de 6 meses' },
                { value: 'more_than_6_months', label: 'Más de 6 meses' }
            ]
        },
        { name: 'immunotherapy', label: '¿Recibe inmunoterapia con alérgenos?', type: 'boolean', required: true, section: 'treatments' },
        {
            name: 'immunotherapy_status', label: '¿La inmunoterapia está activa o suspendida?', type: 'select', required: false, section: 'treatments', conditionalOn: 'immunotherapy', conditionalValue: true, options: [
                { value: 'active', label: 'Activa' },
                { value: 'suspended', label: 'Suspendida' }
            ]
        },

        // Exclusions
        { name: 'active_infection', label: '¿Tiene alguna infección respiratoria activa?', type: 'boolean', required: true, section: 'exclusions' },
        { name: 'pregnant_or_lactating', label: '¿Está embarazada o en período de lactancia?', type: 'boolean', required: true, section: 'exclusions' }
    ],
    evaluate: (data) => {
        // Age check (must be 12+)
        if (data.birth_date) {
            const age = calculateAge(data.birth_date as string)
            if (age < 12) return 'NEGATIVE'
        }

        // Absolute exclusions
        if (data.active_infection === true) return 'NEGATIVE'
        if (data.pregnant_or_lactating === true) return 'NEGATIVE'
        if (data.immunotherapy === true && data.immunotherapy_status === 'active') return 'NEGATIVE'

        // Recent biologic use
        if (data.previous_biologic === true && data.last_biologic_date === 'less_than_6_months') {
            return 'NEGATIVE'
        }

        // Inclusion criteria
        const hasRhinitis = data.perennial_rhinitis === true
        const persistentSymptoms = data.persistent_symptoms === true
        const treatmentFailure = data.treatment_failure === true

        if (!hasRhinitis) return 'NEGATIVE'

        if (hasRhinitis && persistentSymptoms && treatmentFailure) {
            return 'POSITIVE'
        }

        return 'REVIEW'
    }
}

// Protocol registry
export const protocols: Record<string, ProtocolConfig> = {
    'sanofi-efc18419': sanofiEFC18419,
    'lilly-kgbs': lillyKGBS
}

export function getProtocol(slug: string): ProtocolConfig | undefined {
    return protocols[slug]
}

export function getProtocolSlugs(): string[] {
    return Object.keys(protocols)
}
