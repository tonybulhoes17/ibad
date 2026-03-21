import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================================
// useGrupoInstituicoes
// ============================================================
export function useGrupoInstituicoes(groupId: string) {
  const [instituicoes, setInstituicoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('institutions')
      .select('*')
      .eq('group_id', groupId)
      .eq('active', true)
      .order('name')
    setInstituicoes(data ?? [])
    setLoading(false)
  }, [groupId])

  useEffect(() => { if (groupId) fetch() }, [fetch, groupId])

  const create = async (data: { name: string; city?: string | null; notes?: string | null; logo_url?: string | null }) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('institutions').insert({
      ...data,
      user_id: user!.id,
      group_id: groupId,
    })
    if (!error) fetch()
    return error
  }

  const update = async (id: string, data: any) => {
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
// useGrupoPlanos
// ============================================================
export function useGrupoPlanos(groupId: string) {
  const [planos, setPlanos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('insurance_plans')
      .select('*')
      .eq('group_id', groupId)
      .eq('active', true)
      .order('name')
    setPlanos(data ?? [])
    setLoading(false)
  }, [groupId])

  useEffect(() => { if (groupId) fetch() }, [fetch, groupId])

  const create = async (data: { name: string; notes?: string | null }) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('insurance_plans').insert({
      ...data,
      user_id: user!.id,
      group_id: groupId,
    })
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
