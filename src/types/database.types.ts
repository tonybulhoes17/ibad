export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          crm: string
          rqe: string | null
          residency_institution: string | null
          signature_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      institutions: {
        Row: {
          id: string
          user_id: string
          name: string
          city: string | null
          logo_url: string | null
          notes: string | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['institutions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['institutions']['Insert']>
      }
      insurance_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          notes: string | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['insurance_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['insurance_plans']['Insert']>
      }
      anesthesia_templates: {
        Row: {
          id: string
          user_id: string
          anesthesia_type: string
          template_text: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['anesthesia_templates']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['anesthesia_templates']['Insert']>
      }
      anesthesia_records: {
        Row: {
          id: string
          user_id: string
          procedure_date: string
          institution_id: string | null
          anesthesia_code: string | null
          patient_name: string
          patient_cpf: string | null
          patient_age: number | null
          patient_sex: 'M' | 'F' | null
          surgeon: string | null
          surgery_name: string
          anesthesia_type: string
          modality: 'eletiva' | 'urgencia' | null
          start_time: string | null
          end_time: string | null
          total_fluids_ml: number | null
          destination: 'CRPA' | 'Enfermaria' | 'UTI' | null
          description: string | null
          timeline_data: TimelineData | null
          insurance_plan_id: string | null
          surgery_value: number | null
          is_paid: boolean
          has_glosa: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['anesthesia_records']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['anesthesia_records']['Insert']>
      }
    }
  }
}

export interface TimelinePoint {
  minute: number
  value: string
}

export interface BPPoint {
  minute: number
  systolic: number
  diastolic: number
}

export interface HRPoint {
  minute: number
  value: number
}

export interface TimelineData {
  duration_minutes: number
  end_marker_at: number
  o2: boolean
  compressed_air: boolean
  inhalational: 'sevoflurane' | 'isoflurane' | 'desflurane' | 'n2o' | null
  saturation: TimelinePoint[]
  ecg: TimelinePoint[]
  etco2: TimelinePoint[]
  temperature: TimelinePoint[]
  fluids: TimelinePoint[]
  bp: BPPoint[]
  hr: HRPoint[]
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Institution = Database['public']['Tables']['institutions']['Row']
export type InsurancePlan = Database['public']['Tables']['insurance_plans']['Row']
export type AnesthesiaTemplate = Database['public']['Tables']['anesthesia_templates']['Row']
export type AnesthesiaRecord = Database['public']['Tables']['anesthesia_records']['Row']

export type AnesthesiaRecordWithRelations = AnesthesiaRecord & {
  institutions: Pick<Institution, 'name' | 'logo_url'> | null
  insurance_plans: Pick<InsurancePlan, 'name'> | null
}
