'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, DollarSign, AlertCircle, CheckCircle2, Plus, Calendar, Stethoscope, ClipboardList, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Record {
  id: string
  _type: 'anesthesia' | 'consultation'
  patient_name: string
  surgery_name: string | null
  procedure_date: string
  surgery_value: number | null
  is_paid: boolean
  has_glosa: boolean
  institutions: { name: string } | null
}

export function DashboardClient() {
  const supabase = createClient()
  const [records, setRecords] = useState<Record[]>([])
  const [profile, setProfile] = useState<{ full_name: string; crm: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [typeFilter, setTypeFilter] = useState<'all' | 'anesthesia' | 'consultation'>('all')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: anesthesia }, { data: consultations }, { data: prof }] = await Promise.all([
      supabase
        .from('anesthesia_records')
        .select('*, institutions(name)')
        .eq('user_id', user.id)
        .order('procedure_date', { ascending: false }),
      supabase
        .from('consultation_records')
        .select('*, institutions(name)')
        .eq('user_id', user.id)
        .order('procedure_date', { ascending: false }),
      supabase.from('profiles').select('full_name, crm').eq('id', user.id).single(),
    ])

    const aList: Record[] = (anesthesia ?? []).map((r: any) => ({
      id: r.id,
      _type: 'anesthesia',
      patient_name: r.patient_name,
      surgery_name: r.surgery_name,
      procedure_date: r.procedure_date,
      surgery_value: r.surgery_value,
      is_paid: r.is_paid,
      has_glosa: r.has_glosa,
      institutions: r.institutions,
    }))

    const cList: Record[] = (consultations ?? []).map((r: any) => ({
      id: r.id,
      _type: 'consultation',
      patient_name: r.patient_name,
      surgery_name: r.surgery_name,
      procedure_date: r.procedure_date ?? r.consultation_date,
      surgery_value: r.surgery_value,
      is_paid: r.is_paid,
      has_glosa: r.has_glosa,
      institutions: r.institutions,
    }))

    const all = [...aList, ...cList].sort((a, b) =>
      new Date(b.procedure_date).getTime() - new Date(a.procedure_date).getTime()
    )

    setRecords(all)
    setProfile(prof as any)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filteredByType = useMemo(() => {
    if (typeFilter === 'all') return records
    return records.filter(r => r._type === typeFilter)
  }, [records, typeFilter])

  const stats = useMemo(() => {
    const now = new Date()
    let filtered = filteredByType

    if (period === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = filteredByType.filter(r => {
        try { return parseISO(r.procedure_date) >= weekAgo } catch { return false }
      })
    } else if (period === 'month') {
      const start = startOfMonth(now)
      const end = endOfMonth(now)
      filtered = filteredByType.filter(r => {
        try { return isWithinInterval(parseISO(r.procedure_date), { start, end }) } catch { return false }
      })
    } else if (period === 'year') {
      filtered = filteredByType.filter(r => {
        try { return parseISO(r.procedure_date).getFullYear() === now.getFullYear() } catch { return false }
      })
    }

    const total = filtered.length
    const totalValue = filtered.reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const paid = filtered.filter(r => r.is_paid).reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const pending = filtered.filter(r => !r.is_paid && !r.has_glosa).reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const glosa = filtered.filter(r => r.has_glosa).reduce((s, r) => s + (r.surgery_value ?? 0), 0)

    return { total, totalValue, paid, pending, glosa, filtered }
  }, [filteredByType, period])

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)
      const count = filteredByType.filter(r => {
        try { return isWithinInterval(parseISO(r.procedure_date), { start, end }) } catch { return false }
      }).length
      return { mes: format(d, 'MMM', { locale: ptBR }), registros: count }
    })
  }, [filteredByType])

  const byInstitution = useMemo(() => {
    const map = new Map<string, number>()
    stats.filtered.forEach(r => {
      const name = r.institutions?.name ?? 'Sem instituição'
      map.set(name, (map.get(name) ?? 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name: name.slice(0, 15), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [stats.filtered])

  const recentRecords = filteredByType.slice(0, 5)

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="card p-12 text-center text-slate-400">Carregando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Olá, Dr. {profile?.full_name.split(' ')[1] ?? profile?.full_name} 👋
          </h1>
          <p className="text-sm text-slate-500">Resumo da sua produção</p>
        </div>
        <Link href="/app/nova-ficha"
          className="btn-primary flex items-center gap-2 text-sm hidden sm:flex">
          <Plus className="w-4 h-4" /> Nova Ficha
        </Link>
      </div>

      {/* Filtros: Período + Tipo */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['week', 'month', 'year'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              period === p ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
            }`}>
            {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
          </button>
        ))}

        <div className="w-px bg-slate-200 mx-1" />

        {[
          { value: 'all', label: 'Todas' },
          { value: 'anesthesia', label: 'Anestésicas', icon: <ClipboardList className="w-3 h-3" /> },
          { value: 'consultation', label: 'Pré-Anestésicas', icon: <Stethoscope className="w-3 h-3" /> },
        ].map(opt => (
          <button key={opt.value} onClick={() => setTypeFilter(opt.value as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${
              typeFilter === opt.value
                ? opt.value === 'consultation'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-primary-700 text-white border-primary-700'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
            }`}>
            {(opt as any).icon}{opt.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<FileText className="w-4 h-4" />}
          label={typeFilter === 'consultation' ? 'Consultas' : typeFilter === 'anesthesia' ? 'Cirurgias' : 'Registros'}
          value={stats.total.toString()} color="blue" />
        <StatCard icon={<DollarSign className="w-4 h-4" />} label="Total Previsto"
          value={formatCurrency(stats.totalValue)} color="blue" />
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Recebido"
          value={formatCurrency(stats.paid)} color="green" />
        <StatCard icon={<AlertCircle className="w-4 h-4" />} label="Pendente"
          value={formatCurrency(stats.pending)} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-600" /> Produção — Últimos 6 meses
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="registros" fill="#1A56A0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" /> Por Instituição
          </h3>
          {byInstitution.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">
              Nenhuma ficha no período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byInstitution} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="count" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fichas Recentes */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Fichas Recentes</h3>
          <Link href="/app/fichas" className="text-xs text-primary-700 hover:underline">Ver todas</Link>
        </div>
        {recentRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhuma ficha no período</p>
            <Link href="/app/nova-ficha" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Plus className="w-4 h-4" /> Criar primeira ficha
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentRecords.map(r => (
              <Link key={r.id}
                href={r._type === 'anesthesia' ? `/app/fichas/${r.id}` : `/app/consultas/${r.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-slate-900 truncate">{r.patient_name}</p>
                    {r._type === 'consultation'
                      ? <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Pré-Anest.</span>
                      : <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Anest.</span>
                    }
                  </div>
                  <p className="text-xs text-slate-400 truncate">{r.surgery_name ?? '—'}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />{formatDate(r.procedure_date)}
                    </p>
                    <p className="text-xs font-mono text-slate-600">{formatCurrency(r.surgery_value)}</p>
                  </div>
                  {r.is_paid
                    ? <span className="badge-success">Pago</span>
                    : r.has_glosa
                      ? <span className="badge-danger">Glosa</span>
                      : <span className="badge-warning">Pendente</span>
                  }
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: 'blue' | 'green' | 'amber' | 'red'
}) {
  const colors = {
    blue: 'bg-primary-50 text-primary-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className="card p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-base font-bold text-slate-900 font-mono truncate">{value}</p>
    </div>
  )
}
