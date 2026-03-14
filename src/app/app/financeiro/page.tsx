'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useInstituicoes, usePlanos } from '@/hooks'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, TrendingUp, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

export default function FinanceiroPage() {
  const supabase = createClient()
  const { instituicoes } = useInstituicoes()
  const { planos } = usePlanos()

  const [allRecords, setAllRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [institutionId, setInstitutionId] = useState('')
  const [planId, setPlanId] = useState('')
  const [recordType, setRecordType] = useState<'all' | 'anesthesia' | 'consultation'>('all')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: anesthesia }, { data: consultations }] = await Promise.all([
      supabase
        .from('anesthesia_records')
        .select('*, institutions(name), insurance_plans(name)')
        .eq('user_id', user.id)
        .order('procedure_date', { ascending: false }),
      supabase
        .from('consultation_records')
        .select('*, institutions(name), insurance_plans(name)')
        .eq('user_id', user.id)
        .order('procedure_date', { ascending: false }),
    ])

    const aList = (anesthesia ?? []).map((r: any) => ({ ...r, _type: 'anesthesia', _date: r.procedure_date }))
    const cList = (consultations ?? []).map((r: any) => ({ ...r, _type: 'consultation', _date: r.consultation_date }))
    setAllRecords([...aList, ...cList])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const fichas = useMemo(() => {
    return allRecords.filter(r => {
      if (recordType !== 'all' && r._type !== recordType) return false
      if (institutionId && r.institution_id !== institutionId) return false
      if (planId && r.insurance_plan_id !== planId) return false
      if (dateFrom && r._date < dateFrom) return false
      if (dateTo && r._date > dateTo) return false
      return true
    })
  }, [allRecords, recordType, institutionId, planId, dateFrom, dateTo])

  const stats = useMemo(() => {
    const total = fichas.reduce((s, f) => s + (f.surgery_value ?? 0), 0)
    const paid = fichas.filter(f => f.is_paid).reduce((s, f) => s + (f.surgery_value ?? 0), 0)
    const glosa = fichas.filter(f => f.has_glosa).reduce((s, f) => s + (f.surgery_value ?? 0), 0)
    const pending = fichas.filter(f => !f.is_paid && !f.has_glosa).reduce((s, f) => s + (f.surgery_value ?? 0), 0)
    const countTotal = fichas.length
    const countPaid = fichas.filter(f => f.is_paid).length
    const countGlosa = fichas.filter(f => f.has_glosa).length
    return { total, paid, glosa, pending, countTotal, countPaid, countGlosa }
  }, [fichas])

  const byInstitution = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>()
    fichas.forEach(f => {
      const name = f.institutions?.name ?? 'Sem instituição'
      const cur = map.get(name) ?? { count: 0, value: 0 }
      map.set(name, { count: cur.count + 1, value: cur.value + (f.surgery_value ?? 0) })
    })
    return Array.from(map.entries())
      .map(([name, d]) => ({ name: name.slice(0, 18), ...d }))
      .sort((a, b) => b.value - a.value)
  }, [fichas])

  const byMonth = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i)
      const interval = { start: startOfMonth(d), end: endOfMonth(d) }
      const month = fichas.filter(f => {
        try { return isWithinInterval(parseISO(f._date), interval) } catch { return false }
      })
      return {
        mes: format(d, 'MMM/yy', { locale: ptBR }),
        Previsto: month.reduce((s, f) => s + (f.surgery_value ?? 0), 0),
        Recebido: month.filter(f => f.is_paid).reduce((s, f) => s + (f.surgery_value ?? 0), 0),
      }
    })
  }, [fichas])

  const pieData = [
    { name: 'Pago', value: stats.paid, color: '#0F766E' },
    { name: 'Pendente', value: stats.pending, color: '#B45309' },
    { name: 'Glosa', value: stats.glosa, color: '#DC2626' },
  ].filter(d => d.value > 0)

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Dashboard Financeiro</h1>
        <p className="text-sm text-slate-500">Controle de valores e pagamentos</p>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="form-label">Tipo de Ficha</label>
          <select className="form-select text-sm" value={recordType} onChange={e => setRecordType(e.target.value as any)}>
            <option value="all">Todas</option>
            <option value="anesthesia">Ficha Anestésica</option>
            <option value="consultation">Consulta Pré-Anestésica</option>
          </select>
        </div>
        <div>
          <label className="form-label">Data Inicial</label>
          <input type="date" className="form-input text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Data Final</label>
          <input type="date" className="form-input text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Instituição</label>
          <select className="form-select text-sm" value={institutionId} onChange={e => setInstitutionId(e.target.value)}>
            <option value="">Todas</option>
            {instituicoes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Plano</label>
          <select className="form-select text-sm" value={planId} onChange={e => setPlanId(e.target.value)}>
            <option value="">Todos</option>
            {planos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: DollarSign, label: 'Total Previsto', value: formatCurrency(stats.total), sub: `${stats.countTotal} registro${stats.countTotal !== 1 ? 's' : ''}`, color: 'blue' },
          { icon: CheckCircle2, label: 'Recebido', value: formatCurrency(stats.paid), sub: `${stats.countPaid} pagos`, color: 'green' },
          { icon: AlertCircle, label: 'Pendente', value: formatCurrency(stats.pending), sub: `${stats.countTotal - stats.countPaid - stats.countGlosa} pendentes`, color: 'amber' },
          { icon: XCircle, label: 'Glosado', value: formatCurrency(stats.glosa), sub: `${stats.countGlosa} glosas`, color: 'red' },
        ].map(({ icon: Icon, label, value, sub, color }) => {
          const colors = { blue: 'bg-primary-50 text-primary-700', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-red-700' }
          return (
            <div key={label} className="card p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors[color as keyof typeof colors]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          )
        })}
      </div>

      {/* Taxas */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Taxa de Recebimento', value: stats.total ? `${((stats.paid / stats.total) * 100).toFixed(1)}%` : '—', color: 'text-emerald-600' },
          { label: 'Taxa de Inadimplência', value: stats.total ? `${((stats.pending / stats.total) * 100).toFixed(1)}%` : '—', color: 'text-amber-600' },
          { label: 'Taxa de Glosa', value: stats.total ? `${((stats.glosa / stats.total) * 100).toFixed(1)}%` : '—', color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Previsto vs Recebido por Mês</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="Previsto" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Recebido" fill="#0F766E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Distribuição por Status</h3>
          {pieData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">Sem dados no período</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false} fontSize={10}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Por Instituição */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Por Instituição</h3>
        </div>
        {byInstitution.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Sem dados</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['Instituição', 'Qtd', 'Total Previsto'].map(h => (
                  <th key={h} className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {byInstitution.map(row => (
                <tr key={row.name} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-5 py-3 text-slate-500">{row.count}</td>
                  <td className="px-5 py-3 font-mono text-slate-700">{formatCurrency(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
