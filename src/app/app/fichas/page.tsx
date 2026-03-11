'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFichas, useSaveFicha, useInstituicoes } from '@/hooks'
import type { FichaFilters } from '@/hooks'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Search, Plus, Printer, Eye, Edit2, Trash2,
  Filter, X, Calendar, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react'
import { ANESTHESIA_TYPES } from '@/constants/anesthesia'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FichasPage() {
  const router = useRouter()
  const supabase = createClient()
  const [filters, setFilters] = useState<FichaFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<{ id: string; value: string } | null>(null)
  const { fichas, loading, refetch } = useFichas({ ...filters, patient_name: search || undefined })
  const { remove } = useSaveFicha()
  const { instituicoes } = useInstituicoes()

  function setFilter(key: keyof FichaFilters, value: unknown) {
    setFilters(prev => ({ ...prev, [key]: value || undefined }))
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta ficha? Esta ação não pode ser desfeita.')) return
    await remove(id)
    refetch()
  }

  async function togglePagamento(id: string, isPaid: boolean) {
    setUpdatingId(id)
    await (supabase.from('anesthesia_records') as any)
      .update({ is_paid: !isPaid, has_glosa: false })
      .eq('id', id)
    await refetch()
    setUpdatingId(null)
  }

  async function saveValue(id: string) {
    if (!editingValue) return
    const numVal = parseFloat(editingValue.value.replace(',', '.'))
    if (!isNaN(numVal)) {
      await (supabase.from('anesthesia_records') as any)
        .update({ surgery_value: numVal })
        .eq('id', id)
      await refetch()
    }
    setEditingValue(null)
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fichas Anestésicas</h1>
          <p className="text-sm text-slate-500">{fichas.length} ficha{fichas.length !== 1 ? 's' : ''} encontrada{fichas.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/app/fichas/nova" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nova Ficha
        </Link>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="form-input pl-9"
            placeholder="Buscar por nome do paciente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 text-sm relative ${showFilters ? 'border-primary-400' : ''}`}
        >
          <Filter className="w-4 h-4" />
          Filtros
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
            <label className="form-label">CPF</label>
            <input type="text" className="form-input text-sm font-mono" placeholder="000.000.000-00"
              onChange={e => setFilter('patient_cpf', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Instituição</label>
            <select className="form-select text-sm" onChange={e => setFilter('institution_id', e.target.value)}>
              <option value="">Todas</option>
              {instituicoes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Tipo de Anestesia</label>
            <select className="form-select text-sm" onChange={e => setFilter('anesthesia_type', e.target.value)}>
              <option value="">Todos</option>
              {ANESTHESIA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Pagamento</label>
            <select className="form-select text-sm"
              onChange={e => {
                const v = e.target.value
                setFilter('is_paid', v === 'paid' ? true : v === 'unpaid' ? false : undefined)
              }}>
              <option value="">Todos</option>
              <option value="paid">Pago</option>
              <option value="unpaid">Pendente</option>
            </select>
          </div>
          <div>
            <label className="form-label">Data Inicial</label>
            <input type="date" className="form-input text-sm" onChange={e => setFilter('date_from', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Data Final</label>
            <input type="date" className="form-input text-sm" onChange={e => setFilter('date_to', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Glosa</label>
            <select className="form-select text-sm"
              onChange={e => {
                const v = e.target.value
                setFilter('has_glosa', v === 'yes' ? true : v === 'no' ? false : undefined)
              }}>
              <option value="">Todas</option>
              <option value="yes">Com glosa</option>
              <option value="no">Sem glosa</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFilters({}); setShowFilters(false) }}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-1">
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400">Carregando fichas...</div>
      ) : fichas.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 mb-4">Nenhuma ficha encontrada</p>
          <Link href="/app/fichas/nova" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Criar primeira ficha
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Data', 'Paciente', 'Cirurgia', 'Instituição', 'Plano', 'Anestesia', 'Valor', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fichas.map(ficha => {
                  const isUpdating = updatingId === ficha.id
                  const isEditingVal = editingValue?.id === ficha.id
                  return (
                    <tr key={ficha.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                        {formatDate(ficha.procedure_date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{ficha.patient_name}</div>
                        {ficha.patient_cpf && <div className="text-xs text-slate-400 font-mono">{ficha.patient_cpf}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{ficha.surgery_name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{(ficha as any).institutions?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{(ficha as any).insurance_plans?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge-neutral">
                          {ANESTHESIA_TYPES.find(t => t.value === ficha.anesthesia_type)?.label ?? ficha.anesthesia_type}
                        </span>
                      </td>

                      {/* VALOR — editável inline */}
                      <td className="px-4 py-3">
                        {isEditingVal ? (
                          <input
                            type="text"
                            className="w-24 text-xs font-mono border border-primary-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary-400"
                            value={editingValue.value}
                            onChange={e => setEditingValue({ id: ficha.id, value: e.target.value })}
                            onBlur={() => saveValue(ficha.id)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveValue(ficha.id)
                              if (e.key === 'Escape') setEditingValue(null)
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="font-mono text-xs text-slate-700 cursor-pointer hover:text-primary-600 hover:underline"
                            title="Clique para editar"
                            onClick={() => setEditingValue({ id: ficha.id, value: String(ficha.surgery_value ?? '') })}
                          >
                            {formatCurrency(ficha.surgery_value)}
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePagamento(ficha.id, ficha.is_paid)}
                          disabled={isUpdating}
                          title={ficha.is_paid ? 'Clique para marcar como Pendente' : 'Clique para marcar como Pago'}
                        >
                          {isUpdating ? (
                            <span className="text-xs text-slate-400 animate-pulse">...</span>
                          ) : ficha.is_paid ? (
                            <span className="badge-success flex items-center gap-1 cursor-pointer hover:bg-emerald-200 transition-colors">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : ficha.has_glosa ? (
                            <span className="badge-danger flex items-center gap-1 cursor-pointer hover:bg-red-200 transition-colors">
                              <AlertTriangle className="w-3 h-3" /> Glosa
                            </span>
                          ) : (
                            <span className="badge-warning flex items-center gap-1 cursor-pointer hover:bg-amber-200 transition-colors">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/app/fichas/${ficha.id}`} className="p-1.5 rounded hover:bg-primary-50 text-slate-400 hover:text-primary-600" title="Ver">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/app/fichas/${ficha.id}/editar`} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700" title="Editar">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/print/${ficha.id}`} target="_blank" className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700" title="Imprimir">
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => handleDelete(ficha.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" title="Excluir">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
            {fichas.map(ficha => (
              <div key={ficha.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{ficha.patient_name}</p>
                    <p className="text-xs text-slate-500">{ficha.surgery_name}</p>
                    <p className="text-xs text-slate-400">{(ficha as any).insurance_plans?.name ?? ''}</p>
                  </div>
                  <button
                    onClick={() => togglePagamento(ficha.id, ficha.is_paid)}
                    disabled={updatingId === ficha.id}
                    className="flex-shrink-0"
                  >
                    {updatingId === ficha.id ? (
                      <span className="text-xs text-slate-400">...</span>
                    ) : ficha.is_paid ? (
                      <span className="badge-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pago</span>
                    ) : ficha.has_glosa ? (
                      <span className="badge-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Glosa</span>
                    ) : (
                      <span className="badge-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(ficha.procedure_date)}</span>
                  <span className="font-mono font-medium text-slate-600">{formatCurrency(ficha.surgery_value)}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/app/fichas/${ficha.id}`} className="flex-1 btn-secondary text-xs text-center py-1.5">Ver</Link>
                  <Link href={`/app/fichas/${ficha.id}/editar`} className="flex-1 btn-secondary text-xs text-center py-1.5">Editar</Link>
                  <Link href={`/print/${ficha.id}`} target="_blank" className="flex-1 btn-secondary text-xs text-center py-1.5">Imprimir</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
