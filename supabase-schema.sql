-- ============================================================
-- IBAD — SQL Completo para Supabase
-- Cole este conteúdo no SQL Editor do Supabase e execute
-- ============================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  email                 TEXT NOT NULL UNIQUE,
  phone                 TEXT,
  crm                   TEXT NOT NULL DEFAULT 'PENDENTE',
  rqe                   TEXT,
  residency_institution TEXT,
  signature_url         TEXT,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institutions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  city       TEXT,
  logo_url   TEXT,
  notes      TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  notes      TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anesthesia_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anesthesia_type TEXT NOT NULL,
  template_text   TEXT NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, anesthesia_type)
);

CREATE TABLE IF NOT EXISTS anesthesia_records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  procedure_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  institution_id     UUID REFERENCES institutions(id) ON DELETE SET NULL,
  anesthesia_code    TEXT,
  patient_name       TEXT NOT NULL,
  patient_cpf        TEXT,
  patient_age        INTEGER CHECK (patient_age >= 0 AND patient_age <= 150),
  patient_sex        CHAR(1) CHECK (patient_sex IN ('M', 'F')),
  surgeon            TEXT,
  surgery_name       TEXT NOT NULL,
  anesthesia_type    TEXT NOT NULL,
  modality           TEXT CHECK (modality IN ('eletiva', 'urgencia')),
  start_time         TIME,
  end_time           TIME,
  total_fluids_ml    INTEGER CHECK (total_fluids_ml >= 0),
  destination        TEXT CHECK (destination IN ('CRPA', 'Enfermaria', 'UTI')),
  description        TEXT,
  timeline_data      JSONB,
  insurance_plan_id  UUID REFERENCES insurance_plans(id) ON DELETE SET NULL,
  surgery_value      NUMERIC(10, 2) CHECK (surgery_value >= 0),
  is_paid            BOOLEAN NOT NULL DEFAULT FALSE,
  has_glosa          BOOLEAN NOT NULL DEFAULT FALSE,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_records_user_id     ON anesthesia_records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_user_date   ON anesthesia_records(user_id, procedure_date DESC);
CREATE INDEX IF NOT EXISTS idx_records_institution ON anesthesia_records(institution_id);
CREATE INDEX IF NOT EXISTS idx_records_insurance   ON anesthesia_records(insurance_plan_id);
CREATE INDEX IF NOT EXISTS idx_records_patient_cpf ON anesthesia_records(patient_cpf);
CREATE INDEX IF NOT EXISTS idx_records_is_paid     ON anesthesia_records(user_id, is_paid);
CREATE INDEX IF NOT EXISTS idx_records_has_glosa   ON anesthesia_records(user_id, has_glosa);
CREATE INDEX IF NOT EXISTS idx_institutions_user   ON institutions(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user          ON insurance_plans(user_id);

-- ============================================================
-- 4. TRIGGERS: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_records_updated ON anesthesia_records;
CREATE TRIGGER trg_records_updated
  BEFORE UPDATE ON anesthesia_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. TRIGGER: auto-criar perfil no cadastro
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, crm)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'crm', 'PENDENTE')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 6. RLS — Row Level Security
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE anesthesia_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE anesthesia_records   ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Institutions
DROP POLICY IF EXISTS "institutions_all" ON institutions;
CREATE POLICY "institutions_all" ON institutions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insurance Plans
DROP POLICY IF EXISTS "plans_all" ON insurance_plans;
CREATE POLICY "plans_all" ON insurance_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Templates
DROP POLICY IF EXISTS "templates_all" ON anesthesia_templates;
CREATE POLICY "templates_all" ON anesthesia_templates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Records
DROP POLICY IF EXISTS "records_all" ON anesthesia_records;
CREATE POLICY "records_all" ON anesthesia_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 7. STORAGE BUCKETS
-- Cole separado se necessário (Supabase Dashboard > Storage)
-- ============================================================

-- Criar via Dashboard > Storage > New Bucket:
-- Nome: "signatures" | Private: true
-- Nome: "logos"      | Private: false (para exibição na ficha)

-- Políticas de Storage (cole no SQL Editor)
CREATE POLICY "signatures_own_folder"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'signatures'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "logos_own_folder"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
