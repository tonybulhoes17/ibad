import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  AnesthesiaRecord, AnesthesiaRecordWithRelations,
  Institution, InsurancePlan, Profile, AnesthesiaTemplate
} from '@/types/database.types'

// ============================================================
// useProfile
// ============================================================
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const update = async (updates: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
    if (!error) fetchProfile()
    return error
  }

  return { profile, loading, refetch: fetchProfile, update }
}

// ============================================================
// useInstituicoes
// ============================================================
export function useInstituicoes() {
  const [instituicoes, setInstituicoes] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('institutions')
      .select('*')
      .eq('active', true)
      .order('name')
    setInstituicoes(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (data: Omit<Institution, 'id' | 'user_id' | 'created_at' | 'active'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('institutions').insert({ ...data, user_id: user!.id })
    if (!error) fetch()
    return error
  }

  const update = async (id: string, data: Partial<Institution>) => {
    const { error } = await supabase.from('institutions').update(data).eq('id', id)
    if (!error) fetch()
    return error
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('institutions').update({ active: false }).eq('id', id)
    if (!error) fetch()
    return error
  }

  return { instituicoes, loading, create, update, remove, refetch: fetch }
}

// ============================================================
// usePlanos
// ============================================================
export function usePlanos() {
  const [planos, setPlanos] = useState<InsurancePlan[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('insurance_plans')
      .select('*')
      .eq('active', true)
      .order('name')
    setPlanos(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (data: Omit<InsurancePlan, 'id' | 'user_id' | 'created_at' | 'active'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('insurance_plans').insert({ ...data, user_id: user!.id })
    if (!error) fetch()
    return error
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('insurance_plans').update({ active: false }).eq('id', id)
    if (!error) fetch()
    return error
  }

  return { planos, loading, create, remove, refetch: fetch }
}

// ============================================================
// useTemplates
// ============================================================
export function useTemplates() {
  const [templates, setTemplates] = useState<AnesthesiaTemplate[]>([])
  const supabase = createClient()

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('anesthesia_templates').select('*').order('anesthesia_type')
    setTemplates(data ?? [])
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const upsert = async (anesthesia_type: string, template_text: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('anesthesia_templates').upsert(
      { user_id: user!.id, anesthesia_type, template_text },
      { onConflict: 'user_id,anesthesia_type' }
    )
    if (!error) fetch()
    return error
  }

  const getByType = (type: string) => templates.find(t => t.anesthesia_type === type)?.template_text

  return { templates, upsert, getByType, refetch: fetch }
}

// ============================================================
// useFichas
// ============================================================
export interface FichaFilters {
  patient_name?: string
  patient_cpf?: string
  institution_id?: string
  insurance_plan_id?: string
  anesthesia_type?: string
  surgeon?: string
  is_paid?: boolean
  has_glosa?: boolean
  date_from?: string
  date_to?: string
}

export function useFichas(filters: FichaFilters = {}) {
  const [fichas, setFichas] = useState<AnesthesiaRecordWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('anesthesia_records')
      .select('*, institutions(name, logo_url), insurance_plans(name)')
      .order('procedure_date', { ascending: false })

    if (filters.patient_name) q = q.ilike('patient_name', `%${filters.patient_name}%`)
    if (filters.patient_cpf) q = q.eq('patient_cpf', filters.patient_cpf)
    if (filters.institution_id) q = q.eq('institution_id', filters.institution_id)
    if (filters.insurance_plan_id) q = q.eq('insurance_plan_id', filters.insurance_plan_id)
    if (filters.anesthesia_type) q = q.eq('anesthesia_type', filters.anesthesia_type)
    if (filters.surgeon) q = q.ilike('surgeon', `%${filters.surgeon}%`)
    if (filters.is_paid !== undefined) q = q.eq('is_paid', filters.is_paid)
    if (filters.has_glosa !== undefined) q = q.eq('has_glosa', filters.has_glosa)
    if (filters.date_from) q = q.gte('procedure_date', filters.date_from)
    if (filters.date_to) q = q.lte('procedure_date', filters.date_to)

    const { data } = await q
    setFichas((data ?? []) as AnesthesiaRecordWithRelations[])
    setLoading(false)
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  return { fichas, loading, refetch: fetch }
}

// ============================================================
// useFichaById
// ============================================================
export function useFichaById(id: string) {
  const [ficha, setFicha] = useState<AnesthesiaRecordWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('anesthesia_records')
        .select('*, institutions(*), insurance_plans(*)')
        .eq('id', id)
        .single()
      setFicha(data as AnesthesiaRecordWithRelations)
      setLoading(false)
    }
    load()
  }, [id])

  return { ficha, loading }
}

// ============================================================
// useSaveFicha
// ============================================================
export function useSaveFicha() {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const save = async (data: Omit<AnesthesiaRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: record, error } = await supabase
      .from('anesthesia_records')
      .insert({ ...data, user_id: user!.id })
      .select()
      .single()
    setSaving(false)
    return { record, error }
  }

  const update = async (id: string, data: Partial<AnesthesiaRecord>) => {
    setSaving(true)
    const { error } = await supabase.from('anesthesia_records').update(data).eq('id', id)
    setSaving(false)
    return { error }
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('anesthesia_records').delete().eq('id', id)
    return { error }
  }

  return { save, update, remove, saving }
}
