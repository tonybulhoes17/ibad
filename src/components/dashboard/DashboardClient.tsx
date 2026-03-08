'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, TrendingUp, DollarSign, AlertCircle, CheckCircle2, XCircle, Plus, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { AnesthesiaRecord } from '@/types/database.types'
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'

interface Props {
  records: (AnesthesiaRecord & { institutions: { name: string } | null })[]
  profile: { full_name: string; crm: string } | null
}

export function DashboardClient({ records, profile }: Props) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  const stats = useMemo(() => {
    const now = new Date()
    let filtered = records

    if (period === 'month') {
      const start = startOfMonth(now)
      const end = endOfMonth(now)
      filtered = records.filter(r => {
        const d = parseISO(r.procedure_date)
        return isWithinInterval(d, { start, end })
      })
    } else if (period === 'year') {
      filtered = records.filter(r => parseISO(r.procedure_date).getFullYear() === now.getFullYear())
    }

    const total = filtered.length
    const totalValue = filtered.reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const paid = filtered.filter(r => r.is_paid).reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const pending = filtered.filter(r => !r.is_paid && !r.has_glosa).reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const glosa = filtered.filter(r => r.has_glosa).reduce((s, r) => s + (r.surgery_value ?? 0), 0)

    return { total, totalValue, paid, pending, glosa, filtered }
  }, [records, period])

  // Chart: últimos 6 meses
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)
      const count = records.filter(r => {
        const pd = parseISO(r.procedure_date)
        return isWithinInterval(pd, { start, end })
      }).length
      return { mes: format(d, 'MMM', { locale: ptBR }), cirurgias: count }
    })
  }, [records])

  // Chart: por instituição
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

  const recentFichas = records.slice(0, 5)

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
        <Link href="/app/fichas/nova"
          className="btn-primary flex items-center gap-2 text-sm hidden sm:flex">
          <Plus className="w-4 h-4" /> Nova Ficha
        </Link>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 mb-5">
        {(['week', 'month', 'year'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              period === p ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
            }`}>
            {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<FileText className="w-4 h-4" />} label="Cirurgias"
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
              <Bar dataKey="cirurgias" fill="#1A56A0" radius={[4, 4, 0, 0]} />
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

      {/* Recent Fichas */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Fichas Recentes</h3>
          <Link href="/app/fichas" className="text-xs text-primary-700 hover:underline">Ver todas</Link>
        </div>
        {recentFichas.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhuma ficha cadastrada ainda</p>
            <Link href="/app/fichas/nova" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Plus className="w-4 h-4" /> Criar primeira ficha
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentFichas.map(ficha => (
              <Link key={ficha.id} href={`/app/fichas/${ficha.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{ficha.patient_name}</p>
                  <p className="text-xs text-slate-400 truncate">{ficha.surgery_name}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ficha.procedure_date)}
                    </p>
                    <p className="text-xs font-mono text-slate-600">{formatCurrency(ficha.surgery_value)}</p>
                  </div>
                  {ficha.is_paid
                    ? <span className="badge-success">Pago</span>
                    : ficha.has_glosa
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
