'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, DollarSign, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default function GrupoDashboardPage() {
  const params = useParams()
  const grupoId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [grupoNome, setGrupoNome] = useState('')
  const [papel, setPapel] = useState('')
  const [stats, setStats] = useState({ total: 0, totalValue: 0, paid: 0, pending: 0 })
  const [membros, setMembros] = useState<{ id: string; user_id: string; papel: string; full_name: string }[]>([])
  const [recentFichas, setRecentFichas] = useState<any[]>([])

  useEffect(() => {
    setGrupoNome(localStorage.getItem('grupo_nome') ?? '')
    setPapel(localStorage.getItem('grupo_papel') ?? '')
    fetchData()
  }, [grupoId])

  async function fetchData() {
    setLoading(true)

    const [{ data: anesthesia }, { data: consultations }, { data: membrosData }] = await Promise.all([
      supabase.from('anesthesia_records')
        .select('surgery_value, is_paid, has_glosa, procedure_date, patient_name, surgery_name')
        .eq('group_id', grupoId)
        .order('procedure_date', { ascending: false }),
      supabase.from('consultation_records')
        .select('surgery_value, is_paid, has_glosa, consultation_date, patient_name, surgery_name')
        .eq('group_id', grupoId)
        .order('consultation_date', { ascending: false }),
      supabase.from('group_members')
        .select('id, user_id, papel')
        .eq('group_id', grupoId),
    ])

    // Busca profiles separadamente
    const userIds = (membrosData ?? []).map((m: any) => m.user_id)
    let profilesMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)
      profilesMap = Object.fromEntries(
        (profilesData ?? []).map((p: any) => [p.id, p.full_name])
      )
    }

    const membrosFormatados = (membrosData ?? []).map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      papel: m.papel,
      full_name: profilesMap[m.user_id] ?? '—',
    }))

    const all = [
      ...(anesthesia ?? []).map((r: any) => ({ ...r, procedure_date: r.procedure_date, _type: 'anesthesia' })),
      ...(consultations ?? []).map((r: any) => ({ ...r, procedure_date: r.consultation_date, _type: 'consultation' })),
    ].sort((a, b) => new Date(b.procedure_date).getTime() - new Date(a.procedure_date).getTime())

    const totalValue = all.reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const paid = all.filter(r => r.is_paid).reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const pending = all.filter(r => !r.is_paid && !r.has_glosa).reduce((s, r) => s + (r.surgery_value ?? 0), 0)

    setStats({ total: all.length, totalValue, paid, pending })
    setRecentFichas(all.slice(0, 5))
    setMembros(membrosFormatados)
    setLoading(false)
  }

  if (loading) return (
    <div className="p-6 text-center text-slate-400">Carregando dashboard do grupo...</div>
  )

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{grupoNome}</h1>
          <p className="text-sm text-slate-500 capitalize">{papel} · Dashboard do Grupo</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 mb-0.5">Total de Fichas</p>
          <p className="text-base font-bold text-slate-900 font-mono">{stats.total}</p>
        </div>
        <div className="card p-4">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center mb-2">
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 mb-0.5">Total Previsto</p>
          <p className="text-base font-bold text-slate-900 font-mono truncate">{formatCurrency(stats.totalValue)}</p>
        </div>
        <div className="card p-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 mb-0.5">Recebido</p>
          <p className="text-base font-bold text-slate-900 font-mono truncate">{formatCurrency(stats.paid)}</p>
        </div>
        <div className="card p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 mb-0.5">Pendente</p>
          <p className="text-base font-bold text-slate-900 font-mono truncate">{formatCurrency(stats.pending)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Fichas Recentes */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Fichas Recentes</h3>
            <Link href={`/grupo/${grupoId}/fichas`} className="text-xs text-primary-700 hover:underline">Ver todas</Link>
          </div>
          {recentFichas.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">Nenhuma ficha ainda</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentFichas.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{r.patient_name}</p>
                    <p className="text-xs text-slate-400 truncate">{r.surgery_name ?? '—'} · {formatDate(r.procedure_date)}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-600">{formatCurrency(r.surgery_value)}</span>
                    {r.is_paid
                      ? <span className="badge-success">Pago</span>
                      : r.has_glosa
                        ? <span className="badge-danger">Glosa</span>
                        : <span className="badge-warning">Pendente</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Membros */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Membros</h3>
            {papel === 'admin' && (
              <Link href={`/grupo/${grupoId}/membros`} className="text-xs text-primary-700 hover:underline">Gerenciar</Link>
            )}
          </div>
          {membros.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">Nenhum membro</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {membros.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary-700">
                      {m.full_name?.charAt(0) ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{m.full_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{m.papel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
