'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useInstituicoes } from '@/hooks'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Loader2, Trash2, CheckCircle2, Clock, Calendar, Moon, Pencil, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SHIFT_TYPES = [
  { value: 'matutino', label: 'Matutino', desc: '6h–12h' },
  { value: 'vespertino', label: 'Vespertino', desc: '12h–18h' },
  { value: 'noturno', label: 'Noturno', desc: '18h–0h' },
  { value: '12h', label: '12 Horas', desc: 'MT / SN' },
  { value: '24h', label: '24 Horas', desc: 'Sobreaviso' },
]

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
}

const emptyForm: FormState = {
  institution_id: '',
  institution_name: '',
  shift_date: new Date().toISOString().slice(0, 10),
  shift_type: 'matutino',
  value: '',
  is_paid: false,
  notes: '',
}

export default function PlantoesPage() {
  const supabase = createClient()
  const { instituicoes } = useInstituicoes()

  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', user.id)
      .order('shift_date', { ascending: false })
    setShifts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && shifts.length > 0) {
      const shift = shifts.find(s => s.id === editId)
      if (shift) startEdit(shift)
    }
  }, [searchParams, shifts, instituicoes])

  function handleInstituicaoChange(id: string) {
    const inst = instituicoes.find(i => i.id === id)
    setForm(p => ({ ...p, institution_id: id, institution_name: inst?.name ?? '' }))
  }

  function startEdit(s: Shift) {
    setEditingId(s.id)
    setShowForm(false)
    setForm({
      institution_id: s.institution_id ?? '',
      institution_name: s.institution_name ?? '',
      shift_date: s.shift_date,
      shift_type: s.shift_type,
      value: String(s.value ?? ''),
      is_paid: s.is_paid,
      notes: s.notes ?? '',
    })
    // Scroll suave para o formulário
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      institution_id: form.institution_id || null,
      institution_name: form.institution_name || null,
      shift_date: form.shift_date,
      shift_type: form.shift_type,
      value: parseFloat(form.value) || 0,
      is_paid: form.is_paid,
      notes: form.notes || null,
    }

    if (editingId) {
      await supabase.from('shifts').update(payload).eq('id', editingId)
    } else {
      await supabase.from('shifts').insert({ ...payload, user_id: user.id })
    }

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

  const totalValue = shifts.reduce((s, p) => s + (p.value ?? 0), 0)
  const totalPago = shifts.filter(p => p.is_paid).reduce((s, p) => s + (p.value ?? 0), 0)
  const totalPendente = shifts.filter(p => !p.is_paid).reduce((s, p) => s + (p.value ?? 0), 0)

  function shiftTypeLabel(type: string) {
    return SHIFT_TYPES.find(t => t.value === type)?.label ?? type
  }

  const isEditing = !!editingId
  const showingForm = showForm || isEditing

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Plantões</h1>
          <p className="text-sm text-slate-500">{shifts.length} plantão{shifts.length !== 1 ? 'ões' : ''} registrado{shifts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(!showForm) }}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Novo Plantão
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Total Previsto</p>
          <p className="text-base font-bold font-mono text-slate-900">{formatCurrency(totalValue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Recebido</p>
          <p className="text-base font-bold font-mono text-emerald-700">{formatCurrency(totalPago)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 mb-1">Pendente</p>
          <p className="text-base font-bold font-mono text-amber-700">{formatCurrency(totalPendente)}</p>
        </div>
      </div>

      {/* Formulário — novo ou edição */}
      {showingForm && (
        <div className={`card p-5 mb-5 animate-fade-in border-2 ${isEditing ? 'border-primary-300 bg-primary-50/30' : 'border-slate-200'}`}>
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            {isEditing
              ? <><Pencil className="w-4 h-4 text-primary-600" /> Editar Plantão</>
              : <><Plus className="w-4 h-4" /> Novo Plantão</>
            }
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Instituição</label>
                <select className="form-select"
                  value={form.institution_id}
                  onChange={e => handleInstituicaoChange(e.target.value)}>
                  <option value="">Selecione ou digite abaixo...</option>
                  {instituicoes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                {!form.institution_id && (
                  <input type="text" className="form-input mt-2" placeholder="Ou digite o nome da instituição"
                    value={form.institution_name}
                    onChange={e => setForm(p => ({ ...p, institution_name: e.target.value }))} />
                )}
              </div>
              <div>
                <label className="form-label">Data *</label>
                <input type="date" className="form-input" required
                  value={form.shift_date}
                  onChange={e => setForm(p => ({ ...p, shift_date: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="form-label">Tipo de Plantão *</label>
              <div className="flex flex-wrap gap-2">
                {SHIFT_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setForm(p => ({ ...p, shift_type: t.value }))}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      form.shift_type === t.value
                        ? 'bg-primary-700 text-white border-primary-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}>
                    {t.label}
                    <span className="block text-xs opacity-70">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Valor (R$)</label>
                <input type="number" className="form-input font-mono" placeholder="0,00" step="0.01" min="0"
                  value={form.value}
                  onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Observações</label>
                <input type="text" className="form-input" placeholder="Opcional"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>

            <div>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, is_paid: !p.is_paid }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  form.is_paid
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}>
                <span className={`w-3 h-3 rounded-full border ${form.is_paid ? 'bg-white border-white' : 'border-slate-400'}`} />
                {form.is_paid ? 'Pago' : 'Pendente'}
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Salvar Plantão'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-secondary text-sm flex items-center gap-1">
                <X className="w-3 h-3" /> Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="card p-8 text-center text-slate-400">Carregando...</div>
      ) : shifts.length === 0 ? (
        <div className="card p-10 text-center">
          <Moon className="w-8 h-8 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400 text-sm mb-3">Nenhum plantão registrado</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Adicionar primeiro plantão</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-50">
            {shifts.map(s => (
              <div key={s.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 group transition-colors ${
                  editingId === s.id ? 'bg-primary-50 border-l-4 border-primary-400' : ''
                }`}>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Moon className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-slate-900 text-sm">{s.institution_name ?? '—'}</p>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                      {shiftTypeLabel(s.shift_type)}
                    </span>
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
                  <button
                    onClick={() => editingId === s.id ? cancelForm() : startEdit(s)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-opacity"
                    title={editingId === s.id ? 'Cancelar edição' : 'Editar'}>
                    {editingId === s.id
                      ? <X className="w-3.5 h-3.5 text-primary-600" />
                      : <Pencil className="w-3.5 h-3.5" />
                    }
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-opacity"
                    title="Excluir">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
