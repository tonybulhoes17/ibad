'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useInstituicoes, usePlanos } from '@/hooks'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Search, Plus, Printer, Eye, Edit2, Trash2,
  Filter, X, Calendar, CheckCircle2, Clock, AlertTriangle, Stethoscope, ClipboardList
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type RecordType = 'anesthesia' | 'consultation'
type Papel = 'admin' | 'anestesista' | 'secretaria'

interface UnifiedRecord {
  id: string
  type: RecordType
  patient_name: string
  patient_cpf: string | null
  procedure_date: string
  surgery_name: string | null
  institution_name: string | null
  plan_name: string | null
  surgery_value: number | null
  is_paid: boolean
  has_glosa: boolean
  user_id: string
  view_href: string
  edit_href: string
  print_href: string
}

export default function GrupoFichasPage() {
  const params = useParams()
  const grupoId = params.id as string
  const supabase = createClient()
  const { instituicoes } = useInstituicoes()
  const { planos } = usePlanos()

  const [records, setRecords] = useState<UnifiedRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<{ id: string; type: RecordType; value: string } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [papel, setPapel] = useState<Papel>('anestesista')

  // Filtros
  const [filterType, setFilterType] = useState<'all' | 'anesthesia' | 'consultation'>('all')
  const [filterInstitution, setFilterInstitution] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [filterPaid, setFilterPaid] = useState('')
  const [filterGlosa, setFilterGlosa] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterMembro, setFilterMembro] = useState('')
  const [membros, setMembros] = useState<{ user_id: string; nome: string }[]>([])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const papelLocal = localStorage.getItem('grupo_papel') as Papel ?? 'anestesista'
    setPapel(papelLocal)

    // Busca membros para filtro (admin e permissao_consolidado)
    const { data: membrosData } = await supabase
      .from('group_members')
      .select('user_id, profiles(full_name)')
      .eq('group_id', grupoId)

    setMembros((membrosData ?? []).map((m: any) => ({
      user_id: m.user_id,
      nome: m.profiles?.full_name ?? m.user_id,
    })))

    // Busca fichas do grupo
    const [{ data: anesthesia }, { data: consultations }] = await Promise.all([
      supabase
        .from('anesthesia_records')
        .select('*, institutions(name), insurance_plans(name)')
        .eq('group_id', grupoId)
        .order('procedure_date', { ascending: false }),
      supabase
        .from('consultation_records')
        .select('*, institutions(name), insurance_plans(name)')
        .eq('group_id', grupoId)
        .order('procedure_date', { ascending: false }),
    ])

    const aList: UnifiedRecord[] = (anesthesia ?? []).map((r: any) => ({
      id: r.id,
      type: 'anesthesia',
      patient_name: r.patient_name,
      patient_cpf: r.patient_cpf,
      procedure_date: r.procedure_date,
      surgery_name: r.surgery_name,
      institution_name: r.institutions?.name ?? null,
      plan_name: r.insurance_plans?.name ?? null,
      surgery_value: r.surgery_value,
      is_paid: r.is_paid,
      has_glosa: r.has_glosa,
      user_id: r.user_id,
      view_href: `/app/fichas/${r.id}`,
      edit_href: `/app/fichas/${r.id}/editar`,
      print_href: `/print/${r.id}`,
    }))

    const cList: UnifiedRecord[] = (consultations ?? []).map((r: any) => ({
      id: r.id,
      type: 'consultation',
      patient_name: r.patient_name,
      patient_cpf: r.patient_cpf,
      procedure_date: r.consultation_date,
      surgery_name: r.surgery_name,
      institution_name: r.institutions?.name ?? null,
      plan_name: r.insurance_plans?.name ?? null,
      surgery_value: r.surgery_value,
      is_paid: r.is_paid,
      has_glosa: r.has_glosa,
      user_id: r.user_id,
      view_href: `/app/consultas/${r.id}`,
      edit_href: `/app/consultas/${r.id}/editar`,
      print_href: `/print-consulta/${r.id}`,
    }))

    let all = [...aList, ...cList].sort((a, b) =>
      new Date(b.procedure_date).getTime() - new Date(a.procedure_date).getTime()
    )

    // Anestesista comum só vê as próprias fichas (exceto pré-consultas)
    if (papelLocal === 'anestesista') {
      all = all.filter(r => r.user_id === user.id || r.type === 'consultation')
    }

    setRecords(all)
    setLoading(false)
  }, [grupoId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const podeEditarFinanceiro = papel === 'admin' || papel === 'secretaria' || true
  const podeEditarClinico = (r: UnifiedRecord) => r.user_id === currentUserId
  const podeExcluir = (r: UnifiedRecord) => papel === 'admin' || r.user_id === currentUserId

  const filtered = records.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false
    if (search && !r.patient_name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterInstitution && r.institution_name !== instituicoes.find(i => i.id === filterInstitution)?.name) return false
    if (filterPlan && r.plan_name !== planos.find(p => p.id === filterPlan)?.name) return false
    if (filterPaid === 'paid' && !r.is_paid) return false
    if (filterPaid === 'unpaid' && r.is_paid) return false
    if (filterGlosa === 'yes' && !r.has_glosa) return false
    if (filterGlosa === 'no' && r.has_glosa) return false
    if (filterDateFrom && r.procedure_date < filterDateFrom) return false
    if (filterDateTo && r.procedure_date > filterDateTo) return false
    if (filterMembro && r.user_id !== filterMembro) return false
    return true
  })

  const activeFiltersCount = [filterType !== 'all', filterInstitution, filterPlan, filterPaid, filterGlosa, filterDateFrom, filterDateTo, filterMembro].filter(Boolean).length

  async function togglePagamento(r: UnifiedRecord) {
    setUpdatingId(r.id)
    const table = r.type === 'anesthesia' ? 'anesthesia_records' : 'consultation_records'
    await (supabase.from(table) as any)
      .update({ is_paid: !r.is_paid, has_glosa: false })
      .eq('id', r.id)
    await fetchAll()
    setUpdatingId(null)
  }

  async function saveValue(r: UnifiedRecord) {
    if (!editingValue) return
    const numVal = parseFloat(editingValue.value.replace(',', '.'))
    if (!isNaN(numVal)) {
      const table = r.type === 'anesthesia' ? 'anesthesia_records' : 'consultation_records'
      await (supabase.from(table) as any)
        .update({ surgery_value: numVal })
        .eq('id', r.id)
      await fetchAll()
    }
    setEditingValue(null)
  }

  async function handleDelete(r: UnifiedRecord) {
    if (!confirm('Excluir esta ficha? Esta ação não pode ser desfeita.')) return
    const table = r.type === 'anesthesia' ? 'anesthesia_records' : 'consultation_records'
    await (supabase.from(table) as any).delete().eq('id', r.id)
    await fetchAll()
  }

  function handlePrintList() {
    const win = window.open('', '_blank')
    if (!win) return
    const totalValue = filtered.reduce((s, r) => s + (r.surgery_value ?? 0), 0)
    const rows = filtered.map((r, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#F8FAFC'}">
        <td>${r.type === 'anesthesia' ? 'Anest.' : 'Pré-Anest.'}</td>
        <td>${formatDate(r.procedure_date)}</td>
        <td><strong>${r.patient_name}</strong>${r.patient_cpf ? `<br/><small>${r.patient_cpf}</small>` : ''}</td>
        <td>${r.surgery_name ?? '—'}</td>
        <td>${r.institution_name ?? '—'}</td>
        <td>${r.plan_name ?? '—'}</td>
        <td style="text-align:right">${formatCurrency(r.surgery_value)}</td>
        <td style="text-align:center">
          <span style="padding:2px 7px;border-radius:20px;font-size:9px;font-weight:bold;
            background:${r.is_paid ? '#ECFDF5' : r.has_glosa ? '#FEF2F2' : '#FFFBEB'};
            color:${r.is_paid ? '#065F46' : r.has_glosa ? '#991B1B' : '#92400E'}">
            ${r.is_paid ? 'Pago' : r.has_glosa ? 'Glosa' : 'Pendente'}
          </span>
        </td>
      </tr>`).join('')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Fichas do Grupo — IBAD</title>
      <style>* {box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:10px;color:#1E293B;padding:12mm}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1A56A0;padding-bottom:8px;margin-bottom:10px}h1{font-size:16px;color:#1A56A0;margin-bottom:2px}.sub{font-size:9px;color:#64748B}.ibad{font-size:9px;color:#94A3B8;text-align:right}table{width:100%;border-collapse:collapse;margin-bottom:10px}th{background:#1A56A0;color:white;text-align:left;padding:5px 7px;font-size:8.5px;text-transform:uppercase}td{padding:5px 7px;border-bottom:1px solid #F1F5F9;vertical-align:middle;font-size:9.5px}small{color:#94A3B8;font-size:8px}.footer{display:flex;justify-content:space-between;font-size:8.5px;color:#94A3B8;margin-top:8px;border-top:1px solid #E2E8F0;padding-top:6px}@media print{@page{size:A4 landscape;margin:10mm}}</style>
      </head><body>
      <div class="header"><div><h1>Fichas do Grupo — IBAD</h1><div class="sub">${filtered.length} registro${filtered.length !== 1 ? 's' : ''}</div></div>
      <div class="ibad">IBAD — Sistema de Ficha Anestésica<br/>Gerado em ${new Date().toLocaleDateString('pt-BR')}</div></div>
      <table><thead><tr><th>Tipo</th><th>Data</th><th>Paciente</th><th>Cirurgia</th><th>Instituição</th><th>Plano</th><th style="text-align:right">Valor</th><th style="text-align:center">Status</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <div class="footer"><span>Total: <strong>${filtered.length}</strong></span><span style="font-weight:bold;color:#1E293B">Valor total: ${formatCurrency(totalValue)}</span></div>
      <script>window.onload=()=>{window.print()}<\/script></body></html>`)
    win.document.close()
  }

  const isAdmin = papel === 'admin'
  const isSecretaria = papel === 'secretaria'

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fichas do Grupo</h1>
          <p className="text-sm text-slate-500">{filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrintList} className="btn-secondary flex items-center gap-2 text-sm" title="Imprimir lista">
            <Printer className="w-4 h-4" /> Imprimir Lista
          </button>
          {!isSecretaria && (
            <Link href={`/grupo/${grupoId}/nova-ficha`} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Nova Ficha
            </Link>
          )}
        </div>
      </div>

      {/* Tipo rápido */}
      <div className="flex gap-2 mb-4">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'anesthesia', label: '🫁 Anestésicas' },
          { value: 'consultation', label: '🩺 Pré-Anestésicas' },
        ].map(opt => (
          <button key={opt.value}
            onClick={() => setFilterType(opt.value as any)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              filterType === opt.value
                ? 'bg-primary-700 text-white border-primary-700'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" className="form-input pl-9" placeholder="Buscar por nome do paciente..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 text-sm relative ${showFilters ? 'border-primary-400' : ''}`}>
          <Filter className="w-4 h-4" /> Filtros
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-700 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-4 mb-4 grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
          <div>
            <label className="form-label">Instituição</label>
            <select className="form-select text-sm" value={filterInstitution} onChange={e => setFilterInstitution(e.target.value)}>
              <option value="">Todas</option>
              {instituicoes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Plano</label>
            <select className="form-select text-sm" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
              <option value="">Todos</option>
              {planos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Pagamento</label>
            <select className="form-select text-sm" value={filterPaid} onChange={e => setFilterPaid(e.target.value)}>
              <option value="">Todos</option>
              <option value="paid">Pago</option>
              <option value="unpaid">Pendente</option>
            </select>
          </div>
          <div>
            <label className="form-label">Glosa</label>
            <select className="form-select text-sm" value={filterGlosa} onChange={e => setFilterGlosa(e.target.value)}>
              <option value="">Todas</option>
              <option value="yes">Com glosa</option>
              <option value="no">Sem glosa</option>
            </select>
          </div>
          <div>
            <label className="form-label">Data Inicial</label>
            <input type="date" className="form-input text-sm" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Data Final</label>
            <input type="date" className="form-input text-sm" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          </div>
          {/* Filtro por membro — só admin e permissao_consolidado */}
          {(isAdmin || localStorage.getItem('grupo_permissao_consolidado') === 'true') && (
            <div>
              <label className="form-label">Anestesista</label>
              <select className="form-select text-sm" value={filterMembro} onChange={e => setFilterMembro(e.target.value)}>
                <option value="">Todos</option>
                {membros.map(m => <option key={m.user_id} value={m.user_id}>{m.nome}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-end col-span-2 lg:col-span-1">
            <button onClick={() => { setFilterType('all'); setFilterInstitution(''); setFilterPlan(''); setFilterPaid(''); setFilterGlosa(''); setFilterDateFrom(''); setFilterDateTo(''); setFilterMembro(''); setShowFilters(false) }}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-1">
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400">Carregando fichas...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 mb-4">Nenhuma ficha encontrada</p>
          {!isSecretaria && (
            <Link href={`/grupo/${grupoId}/nova-ficha`} className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Criar primeira ficha
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Tipo', 'Data', 'Paciente', 'Cirurgia', 'Instituição', 'Plano', 'Valor', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(r => {
                  const isUpdating = updatingId === r.id
                  const isEditingVal = editingValue?.id === r.id
                  const podeClinical = podeEditarClinico(r)
                  const podeExc = podeExcluir(r)
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-3 py-3">
                        {r.type === 'anesthesia' ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            <ClipboardList className="w-3 h-3" /> Anest.
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            <Stethoscope className="w-3 h-3" /> Pré-Anest.
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                        {formatDate(r.procedure_date)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900">{r.patient_name}</div>
                        {r.patient_cpf && <div className="text-xs text-slate-400 font-mono">{r.patient_cpf}</div>}
                      </td>
                      <td className="px-3 py-3 text-slate-600 max-w-[140px] truncate text-xs">{r.surgery_name ?? '—'}</td>
                      <td className="px-3 py-3 text-slate-500 text-xs">{r.institution_name ?? '—'}</td>
                      <td className="px-3 py-3 text-slate-500 text-xs">{r.plan_name ?? '—'}</td>

                      {/* VALOR — editável por todos exceto anestesista de outro médico */}
                      <td className="px-3 py-3">
                        {isEditingVal ? (
                          <input type="text"
                            className="w-24 text-xs font-mono border border-primary-400 rounded px-1.5 py-0.5 outline-none"
                            value={editingValue.value}
                            onChange={e => setEditingValue({ id: r.id, type: r.type, value: e.target.value })}
                            onBlur={() => saveValue(r)}
                            onKeyDown={e => { if (e.key === 'Enter') saveValue(r); if (e.key === 'Escape') setEditingValue(null) }}
                            autoFocus />
                        ) : (
                          <span
                            className={`font-mono text-xs text-slate-700 ${podeEditarFinanceiro ? 'cursor-pointer hover:text-primary-600 hover:underline' : ''}`}
                            title={podeEditarFinanceiro ? 'Clique para editar' : ''}
                            onClick={() => podeEditarFinanceiro && setEditingValue({ id: r.id, type: r.type, value: String(r.surgery_value ?? '') })}>
                            {formatCurrency(r.surgery_value)}
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-3 py-3">
                        <button onClick={() => togglePagamento(r)} disabled={isUpdating || (!podeEditarFinanceiro)}
                          title={r.is_paid ? 'Clique para Pendente' : 'Clique para Pago'}>
                          {isUpdating ? (
                            <span className="text-xs text-slate-400 animate-pulse">...</span>
                          ) : r.is_paid ? (
                            <span className="badge-success flex items-center gap-1 cursor-pointer">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : r.has_glosa ? (
                            <span className="badge-danger flex items-center gap-1 cursor-pointer">
                              <AlertTriangle className="w-3 h-3" /> Glosa
                            </span>
                          ) : (
                            <span className="badge-warning flex items-center gap-1 cursor-pointer">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={r.view_href} className="p-1.5 rounded hover:bg-primary-50 text-slate-400 hover:text-primary-600" title="Ver">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {podeClinical && (
                            <Link href={r.edit_href} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700" title="Editar">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link href={r.print_href} target="_blank" className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700" title="Imprimir">
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                          {podeExc && (
                            <button onClick={() => handleDelete(r)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" title="Excluir">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {r.type === 'anesthesia' ? (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Anestésica</span>
                      ) : (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Pré-Anestésica</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900">{r.patient_name}</p>
                    <p className="text-xs text-slate-500">{r.surgery_name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{r.plan_name ?? ''}</p>
                  </div>
                  <button onClick={() => togglePagamento(r)} disabled={updatingId === r.id || !podeEditarFinanceiro} className="flex-shrink-0">
                    {updatingId === r.id ? (
                      <span className="text-xs text-slate-400">...</span>
                    ) : r.is_paid ? (
                      <span className="badge-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pago</span>
                    ) : r.has_glosa ? (
                      <span className="badge-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Glosa</span>
                    ) : (
                      <span className="badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(r.procedure_date)}</span>
                  <span className="font-mono font-medium text-slate-600">{formatCurrency(r.surgery_value)}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={r.view_href} className="flex-1 btn-secondary text-xs text-center py-1.5">Ver</Link>
                  {podeEditarClinico(r) && (
                    <Link href={r.edit_href} className="flex-1 btn-secondary text-xs text-center py-1.5">Editar</Link>
                  )}
                  <Link href={r.print_href} target="_blank" className="flex-1 btn-secondary text-xs text-center py-1.5">Imprimir</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
