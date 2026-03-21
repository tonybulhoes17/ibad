'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useGrupoPlanos } from '@/hooks/grupo'
import { Shield, Plus, Trash2, Loader2 } from 'lucide-react'

export default function GrupoPlanosPage() {
  const params = useParams()
  const grupoId = params.id as string
  const { planos, loading, create, remove } = useGrupoPlanos(grupoId)

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', notes: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await create({ name: form.name, notes: form.notes || null })
    setSaving(false)
    setForm({ name: '', notes: '' })
    setShowForm(false)
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Planos de Saúde do Grupo</h1>
          <p className="text-sm text-slate-500">Convênios aceitos pelo grupo</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-5 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="form-label">Nome do Plano *</label>
              <input type="text" className="form-input" placeholder="Ex: Unimed, SulAmérica..."
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">Observações</label>
              <input type="text" className="form-input" placeholder="Opcional"
                value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {saving ? 'Salvando...' : 'Criar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-slate-400">Carregando...</div>
      ) : planos.length === 0 ? (
        <div className="card p-10 text-center">
          <Shield className="w-8 h-8 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400 text-sm">Nenhum plano cadastrado</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {planos.map(plano => (
            <div key={plano.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{plano.name}</p>
                {plano.notes && <p className="text-xs text-slate-400">{plano.notes}</p>}
              </div>
              <button onClick={() => remove(plano.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
