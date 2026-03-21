'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useGrupoInstituicoes } from '@/hooks/grupo'
import { Building2, Plus, Pencil, Trash2, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FormState {
  name: string
  city: string
  notes: string
}

export default function GrupoInstituicoesPage() {
  const params = useParams()
  const grupoId = params.id as string
  const { instituicoes, loading, create, update, remove } = useGrupoInstituicoes(grupoId)
  const supabase = createClient()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({ name: '', city: '', notes: '' })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  function reset() {
    setForm({ name: '', city: '', notes: '' })
    setLogoFile(null)
    setLogoPreview(null)
    setEditing(null)
    setShowForm(false)
  }

  function startEdit(inst: any) {
    setForm({ name: inst.name, city: inst.city ?? '', notes: inst.notes ?? '' })
    setLogoPreview(inst.logo_url)
    setEditing(inst.id)
    setShowForm(true)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function uploadLogo(institutionId: string): Promise<string | null> {
    if (!logoFile) return null
    const { data: { user } } = await supabase.auth.getUser()
    const path = `${user!.id}/${institutionId}.${logoFile.name.split('.').pop()}`
    const { error } = await supabase.storage.from('logos').upload(path, logoFile, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('logos').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      let logo_url: string | undefined
      if (logoFile) logo_url = (await uploadLogo(editing)) ?? undefined
      await update(editing, { name: form.name, city: form.city || null, notes: form.notes || null, ...(logo_url ? { logo_url } : {}) })
    } else {
      const err = await create({ name: form.name, city: form.city || null, notes: form.notes || null, logo_url: null })
      if (!err && logoFile) {
        const inst = instituicoes.find(i => i.name === form.name)
        if (inst) await uploadLogo(inst.id)
      }
    }
    setSaving(false)
    reset()
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Instituições do Grupo</h1>
          <p className="text-sm text-slate-500">Hospitais e clínicas do grupo</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nova
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-5 animate-fade-in">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            {editing ? 'Editar Instituição' : 'Nova Instituição'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label">Nome *</label>
                <input type="text" className="form-input" placeholder="Hospital / Clínica"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Cidade</label>
                <input type="text" className="form-input" placeholder="Cidade"
                  value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Logo (para ficha impressa)</label>
                <div className="flex items-center gap-3">
                  {logoPreview && (
                    <img src={logoPreview} alt="logo" className="h-8 object-contain rounded border border-slate-200" />
                  )}
                  <label className="btn-secondary text-xs cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                </div>
              </div>
              <div className="col-span-2">
                <label className="form-label">Observações</label>
                <input type="text" className="form-input" placeholder="Notas opcionais"
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
              </button>
              <button type="button" onClick={reset} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-slate-400">Carregando...</div>
      ) : instituicoes.length === 0 ? (
        <div className="card p-10 text-center">
          <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400 text-sm mb-3">Nenhuma instituição cadastrada</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Adicionar primeira</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-50">
            {instituicoes.map(inst => (
              <div key={inst.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 group">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {inst.logo_url
                    ? <img src={inst.logo_url} alt={inst.name} className="w-full h-full object-contain" />
                    : <Building2 className="w-5 h-5 text-primary-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{inst.name}</p>
                  {inst.city && <p className="text-xs text-slate-400">{inst.city}</p>}
                  {inst.notes && <p className="text-xs text-slate-400 truncate">{inst.notes}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(inst)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(inst.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
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
