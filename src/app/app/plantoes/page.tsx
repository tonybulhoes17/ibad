'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInstituicoes } from '@/hooks'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Plus, Loader2, Trash2, CheckCircle2, Clock,
  Calendar, Moon, Pencil, X, List, CalendarDays,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, addWeeks, addMonths, getDate, setDate, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SHIFT_TYPES = [
  { value: 'matutino',   label: 'Matutino',   desc: '6h–12h' },
  { value: 'vespertino', label: 'Vespertino', desc: '12h–18h' },
  { value: 'noturno',    label: 'Noturno',    desc: '18h–0h' },
  { value: '12h',        label: '12 Horas',   desc: 'MT / SN' },
  { value: '24h',        label: '24 Horas',   desc: 'Sobreaviso' },
]

const DIAS_SEMANA = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const DIAS_SEMANA_CURTO = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

interface Shift {
  id: string
  institution_id: string | null
  institution_name: string | null
  shift_date: string
  shift_type: string
  value: number
  is_paid: boolean
  notes: string | null
}

interface FormState {
  institution_id: string
  institution_name: string
  shift_date: string
  shift_type: string
  value: string
  is_paid: boolean
  notes: string
  // recorrência
  recorrente: boolean
  recorrencia_tipo: 'semanal' | 'quinzenal' | 'mensal'
  recorrencia_dia_semana: number   // 0=Dom...6=Sáb (semanal/quinzenal)
  recorrencia_dia_mes: number      // 1-31 (mensal)
}

const emptyForm: FormState = {
  institution_id: '', institution_name: '',
  shift_date: new Date().toISOString().slice(0, 10),
  shift_type: 'matutino', value: '', is_paid: false, notes: '',
  recorrente: false, recorrencia_tipo: 'semanal',
  recorrencia_dia_semana: 1, recorrencia_dia_mes: 1,
}

// Gera datas recorrentes até 31/12 do ano corrente
function gerarDatas(form: FormState, existentes: string[]): { novas: string[], conflitos: string[] } {
  const ano = new Date().getFullYear()
  const fim = new Date(ano, 11, 31)
  const novas: string[] = []
  const conflitos: string[] = []

  if (form.recorrencia_tipo === 'semanal' || form.recorrencia_tipo === 'quinzenal') {
    // Acha o primeiro dia da semana escolhido a partir de hoje
    let atual = new Date()
    const alvo = form.recorrencia_dia_semana
    while (getDay(atual) !== alvo) {
      atual = new Date(atual.getTime() + 86400000)
    }
    const intervalo = form.recorrencia_tipo === 'semanal' ? 1 : 2
    while (atual <= fim) {
      const str = atual.toISOString().slice(0, 10)
      if (existentes.includes(str)) conflitos.push(str)
      else novas.push(str)
      atual = addWeeks(atual, intervalo)
    }
  } else if (form.recorrencia_tipo === 'mensal') {
    let mes = new Date().getMonth()
    while (mes <= 11) {
      try {
        const d = setDate(new Date(ano, mes, 1), form.recorrencia_dia_mes)
        if (isValid(d) && d.getMonth() === mes) {
          const str = d.toISOString().slice(0, 10)
          if (existentes.includes(str)) conflitos.push(str)
          else novas.push(str)
        }
      } catch {}
      mes++
    }
  }
  return { novas, conflitos }
}

export default function PlantoesPage() {
  const supabase = createClient()
  const router = useRouter()
  const { instituicoes } = useInstituicoes()
  const searchParams = useSearchParams()

  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [autoEditDone, setAutoEditDone] = useState(false)
  const [view, setView] = useState<'lista' | 'calendario'>('calendario')
  const [mesAtual, setMesAtual] = useState(new Date())
  const [confirmRecorrencia, setConfirmRecorrencia] = useState<{ novas: string[], conflitos: string[] } | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('shifts').select('*').eq('user_id', user.id)
      .order('shift_date', { ascending: false })
    setShifts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    if (autoEditDone) return
    const editId = searchParams.get('edit')
    if (editId && shifts.length > 0) {
      const shift = shifts.find(s => s.id === editId)
      if (shift) { startEdit(shift); setAutoEditDone(true) }
    }
  }, [searchParams, shifts, instituicoes, autoEditDone])

  // Filtro por mês
  const shiftsMes = useMemo(() => {
    const ini = format(startOfMonth(mesAtual), 'yyyy-MM-dd')
    const fim = format(endOfMonth(mesAtual), 'yyyy-MM-dd')
    return shifts.filter(s => s.shift_date >= ini && s.shift_date <= fim)
  }, [shifts, mesAtual])

  // Calendário
  const diasDoMes = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(mesAtual), end: endOfMonth(mesAtual) })
  }, [mesAtual])

  const primeiroOffset = getDay(startOfMonth(mesAtual)) // 0=Dom

  function shiftsDia(dia: Date) {
    return shifts.filter(s => isSameDay(parseISO(s.shift_date), dia))
  }

  function handleInstituicaoChange(id: string) {
    const inst = instituicoes.find(i => i.id === id)
    setForm(p => ({ ...p, institution_id: id, institution_name: inst?.name ?? '' }))
  }

  function startEdit(s: Shift) {
    setEditingId(s.id)
    setShowForm(false)
    setForm({
      ...emptyForm,
      institution_id: s.institution_id ?? '',
      institution_name: s.institution_name ?? '',
      shift_date: s.shift_date,
      shift_type: s.shift_type,
      value: String(s.value ?? ''),
      is_paid: s.is_paid,
      notes: s.notes ?? '',
      recorrente: false,
    })
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  function cancelForm() {
    setShowForm(false); setEditingId(null)
    setForm(emptyForm); setConfirmRecorrencia(null)
  }

  async function salvarPlantoes(datas: string[]) {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const rows = datas.map(d => ({
      user_id: user.id,
      institution_id: form.institution_id || null,
      institution_name: form.institution_name || null,
      shift_date: d,
      shift_type: form.shift_type,
      value: parseFloat(form.value) || 0,
      is_paid: form.is_paid,
      notes: form.notes || null,
    }))
    await supabase.from('shifts').insert(rows)
    setSaving(false)
    cancelForm()
    fetchAll()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      setSaving(true)
      await supabase.from('shifts').update({
        institution_id: form.institution_id || null,
        institution_name: form.institution_name || null,
        shift_date: form.shift_date,
        shift_type: form.shift_type,
        value: parseFloat(form.value) || 0,
        is_paid: form.is_paid,
        notes: form.notes || null,
      }).eq('id', editingId)
      setSaving(false)
      cancelForm()
      fetchAll()
      return
    }

    if (form.recorrente) {
      const existentes = shifts.map(s => s.shift_date)
      const { novas, conflitos } = gerarDatas(form, existentes)
      if (conflitos.length > 0) {
        setConfirmRecorrencia({ novas, conflitos })
        return
      }
      await salvarPlantoes(novas)
      return
    }

    // Plantão único
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('shifts').insert({
      user_id: user.id,
      institution_id: form.institution_id || null,
      institution_name: form.institution_name || null,
      shift_date: form.shift_date,
      shift_type: form.shift_type,
      value: parseFloat(form.value) || 0,
      is_paid: form.is_paid,
      notes: form.notes || null,
    })
    setSaving(false)
    cancelForm()
    fetchAll()
  }

  async function togglePagamento(s: Shift) {
    setUpdatingId(s.id)
    await supabase.from('shifts').update({ is_paid: !s.is_paid }).eq('id', s.id)
    await fetchAll()
    setUpdatingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este plantão?')) return
    await supabase.from('shifts').delete().eq('id', id)
    fetchAll()
  }

  const totalMes = shiftsMes.reduce((s, p) => s + (p.value ?? 0), 0)
  const pagoMes = shiftsMes.filter(p => p.is_paid).reduce((s, p) => s + (p.value ?? 0), 0)
  const pendenteMes = shiftsMes.filter(p => !p.is_paid).reduce((s, p) => s + (p.value ?? 0), 0)

  function shiftTypeLabel(type: string) {
    return SHIFT_TYPES.find(t => t.value === type)?.label ?? type
  }

  const isEditing = !!editingId
  const showingForm = showForm || isEditing

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Plantões</h1>
          <p className="text-sm text-slate-500">{shifts.length} plantão{shifts.length !== 1 ? 'ões' : ''} registrado{shifts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle visualização */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
            <button onClick={() => setView('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'lista' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <List className="w-3.5 h-3.5" /> Lista
            </button>
            <button onClick={() => setView('calendario')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'calendario' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <CalendarDays className="w-3.5 h-3.5" /> Calendário
            </button>
          </div>
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(!showForm) }}
            className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Novo Plantão
          </button>
        </div>
      </div>

      {/* Navegação de mês */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMesAtual(m => addMonths(m, -1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-semibold text-slate-800 capitalize">
          {format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <button onClick={() => setMesAtual(m => addMonths(m, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards resumo do mês */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Total no mês</p>
          <p className="text-base font-bold font-mono text-slate-900">{formatCurrency(totalMes)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{shiftsMes.length} plantão{shiftsMes.length !== 1 ? 'ões' : ''}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Recebido</p>
          <p className="text-base font-bold font-mono text-emerald-700">{formatCurrency(pagoMes)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Pendente</p>
          <p className="text-base font-bold font-mono text-amber-700">{formatCurrency(pendenteMes)}</p>
        </div>
      </div>

      {/* Modal de confirmação de recorrência */}
      {confirmRecorrencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 mb-2">⚠️ Conflito de datas</h3>
            <p className="text-sm text-slate-600 mb-3">
              {confirmRecorrencia.conflitos.length} data{confirmRecorrencia.conflitos.length > 1 ? 's' : ''} já possuem plantão cadastrado:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
              {confirmRecorrencia.conflitos.map(d => (
                <p key={d} className="text-xs text-amber-700 font-mono">{formatDate(d)}</p>
              ))}
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Deseja criar <strong>{confirmRecorrencia.novas.length + confirmRecorrencia.conflitos.length}</strong> plantões mesmo assim (incluindo as datas com conflito)?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => salvarPlantoes([...confirmRecorrencia.novas, ...confirmRecorrencia.conflitos])}
                className="flex-1 btn-primary text-sm">
                Criar todos ({confirmRecorrencia.novas.length + confirmRecorrencia.conflitos.length})
              </button>
              <button
                onClick={() => salvarPlantoes(confirmRecorrencia.novas)}
                className="flex-1 btn-secondary text-sm">
                Só os novos ({confirmRecorrencia.novas.length})
              </button>
              <button onClick={() => setConfirmRecorrencia(null)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário */}
      {showingForm && (
        <div className={`card p-5 mb-5 animate-fade-in border-2 ${isEditing ? 'border-primary-300 bg-primary-50/30' : 'border-slate-200'}`}>
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            {isEditing ? <><Pencil className="w-4 h-4 text-primary-600" /> Editar Plantão</> : <><Plus className="w-4 h-4" /> Novo Plantão</>}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Instituição</label>
                <select className="form-select" value={form.institution_id} onChange={e => handleInstituicaoChange(e.target.value)}>
                  <option value="">Selecione ou digite abaixo...</option>
                  {instituicoes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                {!form.institution_id && (
                  <input type="text" className="form-input mt-2" placeholder="Ou digite o nome da instituição"
                    value={form.institution_name} onChange={e => setForm(p => ({ ...p, institution_name: e.target.value }))} />
                )}
              </div>
              {!form.recorrente && (
                <div>
                  <label className="form-label">Data *</label>
                  <input type="date" className="form-input" required value={form.shift_date}
                    onChange={e => setForm(p => ({ ...p, shift_date: e.target.value }))} />
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Tipo de Plantão *</label>
              <div className="flex flex-wrap gap-2">
                {SHIFT_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setForm(p => ({ ...p, shift_type: t.value }))}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${form.shift_type === t.value ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    {t.label}<span className="block text-xs opacity-70">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Valor (R$)</label>
                <input type="number" className="form-input font-mono" placeholder="0,00" step="0.01" min="0"
                  value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Observações</label>
                <input type="text" className="form-input" placeholder="Opcional"
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setForm(p => ({ ...p, is_paid: !p.is_paid }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${form.is_paid ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                <span className={`w-3 h-3 rounded-full border ${form.is_paid ? 'bg-white border-white' : 'border-slate-400'}`} />
                {form.is_paid ? 'Pago' : 'Pendente'}
              </button>
            </div>

            {/* Recorrência — apenas no modo novo */}
            {!isEditing && (
              <div className="border-t pt-4">
                <button type="button"
                  onClick={() => setForm(p => ({ ...p, recorrente: !p.recorrente }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${form.recorrente ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  {form.recorrente ? 'Plantão Recorrente ativo' : 'Tornar Recorrente'}
                </button>

                {form.recorrente && (
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3 animate-fade-in">
                    <p className="text-xs text-indigo-700 font-semibold">
                      Serão gerados plantões até 31/12/{new Date().getFullYear()}
                    </p>
                    <div>
                      <label className="form-label">Tipo de recorrência</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { v: 'semanal', l: 'Semanal' },
                          { v: 'quinzenal', l: 'Quinzenal' },
                          { v: 'mensal', l: 'Mensal' },
                        ].map(opt => (
                          <button key={opt.v} type="button"
                            onClick={() => setForm(p => ({ ...p, recorrencia_tipo: opt.v as any }))}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${form.recorrencia_tipo === opt.v ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200'}`}>
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(form.recorrencia_tipo === 'semanal' || form.recorrencia_tipo === 'quinzenal') && (
                      <div>
                        <label className="form-label">Dia da semana</label>
                        <div className="flex gap-2 flex-wrap">
                          {DIAS_SEMANA.map((d, i) => (
                            <button key={i} type="button"
                              onClick={() => setForm(p => ({ ...p, recorrencia_dia_semana: i }))}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${form.recorrencia_dia_semana === i ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-200'}`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {form.recorrencia_tipo === 'mensal' && (
                      <div>
                        <label className="form-label">Dia do mês</label>
                        <input type="number" min="1" max="28" className="form-input w-24"
                          value={form.recorrencia_dia_mes}
                          onChange={e => setForm(p => ({ ...p, recorrencia_dia_mes: parseInt(e.target.value) || 1 }))} />
                        <p className="text-xs text-slate-400 mt-1">Use até o dia 28 para evitar problemas com meses curtos</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1 flex-wrap">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : form.recorrente ? 'Gerar Plantões' : 'Salvar Plantão'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-secondary text-sm flex items-center gap-1">
                <X className="w-3 h-3" /> Cancelar
              </button>
              {isEditing && (
                <button type="button"
                  onClick={async () => { if (editingId) { await handleDelete(editingId); cancelForm() } }}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir Plantão
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-slate-400">Carregando...</div>
      ) : (
        <>
          {/* ── LISTA ── */}
          {view === 'lista' && (
            shiftsMes.length === 0 ? (
              <div className="card p-10 text-center">
                <Moon className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm mb-3">Nenhum plantão em {format(mesAtual, 'MMMM', { locale: ptBR })}</p>
                <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Adicionar plantão</button>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {shiftsMes.map(s => (
                    <div key={s.id}
                      className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 group transition-colors ${editingId === s.id ? 'bg-primary-50 border-l-4 border-primary-400' : ''}`}>
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Moon className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-slate-900 text-sm">{s.institution_name ?? '—'}</p>
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{shiftTypeLabel(s.shift_type)}</span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(s.shift_date)}
                          {s.notes && <span className="ml-2">· {s.notes}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-medium text-slate-700">{formatCurrency(s.value)}</p>
                        <button onClick={() => togglePagamento(s)} disabled={updatingId === s.id}>
                          {updatingId === s.id
                            ? <span className="text-xs text-slate-400 animate-pulse">...</span>
                            : s.is_paid
                              ? <span className="badge-success flex items-center gap-1 cursor-pointer"><CheckCircle2 className="w-3 h-3" /> Pago</span>
                              : <span className="badge-warning flex items-center gap-1 cursor-pointer"><Clock className="w-3 h-3" /> Pendente</span>
                          }
                        </button>
                        <button onClick={() => editingId === s.id ? cancelForm() : startEdit(s)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-opacity"
                          title={editingId === s.id ? 'Cancelar' : 'Editar'}>
                          {editingId === s.id ? <X className="w-3.5 h-3.5 text-primary-600" /> : <Pencil className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ── CALENDÁRIO ── */}
          {view === 'calendario' && (
            <div className="card overflow-hidden">
              {/* Cabeçalho dias da semana */}
              <div className="grid grid-cols-7 border-b border-slate-200">
                {DIAS_SEMANA_CURTO.map(d => (
                  <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500">{d}</div>
                ))}
              </div>
              {/* Grid de dias */}
              <div className="grid grid-cols-7">
                {/* Offset inicial */}
                {Array.from({ length: primeiroOffset }).map((_, i) => (
                  <div key={`off-${i}`} className="min-h-[90px] border-b border-r border-slate-100 bg-slate-50/50" />
                ))}
                {diasDoMes.map(dia => {
                  const plantoesDia = shiftsDia(dia)
                  const hoje = isSameDay(dia, new Date())
                  return (
                    <div key={dia.toISOString()}
                      className={`min-h-[90px] border-b border-r border-slate-100 p-1.5 ${hoje ? 'bg-primary-50' : 'hover:bg-slate-50'}`}>
                      <p className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${hoje ? 'bg-primary-700 text-white' : 'text-slate-500'}`}>
                        {format(dia, 'd')}
                      </p>
                      <div className="space-y-0.5">
                        {plantoesDia.map(s => (
                          <button key={s.id}
                            onClick={() => {
                              setView('lista')
                              setMesAtual(dia)
                              startEdit(s)
                            }}
                            className={`w-full text-left px-1 py-0.5 rounded text-[10px] font-medium truncate transition-colors ${s.is_paid ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`}
                            title={`${s.institution_name} — ${shiftTypeLabel(s.shift_type)} — ${formatCurrency(s.value)}`}>
                            {s.institution_name?.slice(0, 12) ?? 'Plantão'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
