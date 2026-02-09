-- ============================================
-- EUKARYA PRESCREENING DATABASE SCHEMA
-- Run this script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE prescreening_status AS ENUM (
    'POSITIVE',
    'NEGATIVE',
    'REVIEW',
    'CONTACTED',
    'SCHEDULED',
    'SCREENED',
    'ENROLLED',
    'EXCLUDED'
);

CREATE TYPE user_role AS ENUM ('ADMIN', 'COORDINATOR', 'DOCTOR');

-- ============================================
-- TABLES
-- ============================================

-- Protocols table
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sponsor TEXT NOT NULL,
    pi_name TEXT NOT NULL,
    indication TEXT NOT NULL,
    description TEXT,
    inclusion_criteria JSONB DEFAULT '[]'::jsonb,
    exclusion_criteria JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_id UUID REFERENCES protocols(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    sex TEXT NOT NULL CHECK (sex IN ('M', 'F')),
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    clinical_data JSONB DEFAULT '{}'::jsonb,
    treatments JSONB DEFAULT '{}'::jsonb,
    exclusion_answers JSONB DEFAULT '{}'::jsonb,
    status prescreening_status DEFAULT 'REVIEW',
    internal_notes TEXT,
    contact_authorized BOOLEAN DEFAULT false,
    privacy_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (internal staff)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'COORDINATOR',
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_patients_protocol ON patients(protocol_id);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_created ON patients(created_at DESC);
CREATE INDEX idx_protocols_slug ON protocols(slug);
CREATE INDEX idx_audit_patient ON audit_log(patient_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Protocols: Public read for active protocols
CREATE POLICY "Public can read active protocols"
    ON protocols FOR SELECT
    USING (active = true);

-- Protocols: Authenticated users can read all
CREATE POLICY "Authenticated can read all protocols"
    ON protocols FOR SELECT
    TO authenticated
    USING (true);

-- Patients: Allow public insert (form submission)
CREATE POLICY "Public can submit prescreening"
    ON patients FOR INSERT
    WITH CHECK (true);

-- Patients: Authenticated can read all
CREATE POLICY "Authenticated can read patients"
    ON patients FOR SELECT
    TO authenticated
    USING (true);

-- Patients: Authenticated can update
CREATE POLICY "Authenticated can update patients"
    ON patients FOR UPDATE
    TO authenticated
    USING (true);

-- Users: Only authenticated
CREATE POLICY "Authenticated can read users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

-- Audit: Only authenticated
CREATE POLICY "Authenticated can read audit"
    ON audit_log FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated can insert audit"
    ON audit_log FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================
-- INITIAL DATA: PROTOCOLS
-- ============================================

-- Sanofi EFC18419 (CRSwNP)
INSERT INTO protocols (slug, name, sponsor, pi_name, indication, description, inclusion_criteria, exclusion_criteria) VALUES (
    'sanofi-efc18419',
    'Programa de atención clínica para Pólipos Nasales',
    '',
    'Dr. Lino Guevara',
    'Rinosinusitis crónica con pólipos nasales (CRSwNP)',
    'Programa de atención clínica para evaluar un tratamiento en pacientes con rinosinusitis crónica con pólipos nasales que no han respondido adecuadamente al tratamiento estándar.',
    '["Adultos mayores de 18 años", "Diagnóstico confirmado de pólipos nasales", "Síntomas persistentes por más de 12 semanas", "Falla a tratamiento estándar (corticosteroides nasales/orales)"]'::jsonb,
    '["Infección activa significativa", "Uso actual de otro biológico", "Embarazo o lactancia", "Inmunoterapia activa"]'::jsonb
);

-- Lilly KGBS (Perennial Allergic Rhinitis)
INSERT INTO protocols (slug, name, sponsor, pi_name, indication, description, inclusion_criteria, exclusion_criteria) VALUES (
    'lilly-kgbs',
    'Programa de atención clínica para Rinitis Alérgica',
    '',
    'Dra. Dora Valdes',
    'Rinitis alérgica perenne',
    'Programa de atención clínica para evaluar un nuevo tratamiento en pacientes con rinitis alérgica perenne que no han logrado control adecuado con tratamientos convencionales.',
    '["Personas de 12 años o más", "Diagnóstico de rinitis alérgica perenne", "Síntomas persistentes durante todo el año", "Falla o respuesta inadecuada a antihistamínicos y/o corticosteroides nasales"]'::jsonb,
    '["Infección respiratoria activa", "Embarazo o lactancia", "Inmunoterapia con alérgenos activa", "Uso de biológico en los últimos 6 meses"]'::jsonb
);

-- ============================================
-- DONE!
-- ============================================
-- After running this script:
-- 1. Copy your Supabase URL and anon key to .env.local
-- 2. Copy your service role key for server-side operations
