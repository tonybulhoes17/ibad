'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { User, Upload, Save, Loader2, CheckCircle2 } from 'lucide-react'

export default function PerfilPage() {
  const { profile, loading, update } = useProfile()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    crm: '',
    rqe: '',
    residency_institution: '',
  })

  // Sincronizar quando carregar
  if (profile && !form.full_name && !loading) {
    setForm({
      full_name: profile.full_name,
      phone: profile.phone ?? '',
      crm: profile.crm,
      rqe: profile.rqe ?? '',
      residency_institution: profile.residency_institution ?? '',
    })
  }

  async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setSignaturePreview(URL.createObjectURL(file))
    const path = `${profile.id}/signature.${file.name.split('.').pop()}`
    await supabase.storage.from('signatures').upload(path, file, { upsert: true })
    const { data } = supabase.storage.from('signatures').getPublicUrl(path)
    await update({ signature_url: data.publicUrl })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await update({
      full_name: form.full_name,
      phone: form.phone || null,
      crm: form.crm,
      rqe: form.rqe || null,
      residency_institution: form.residency_institution || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando...</div>

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Perfil</h1>
        <p className="text-sm text-slate-500">Seus dados aparecem na ficha impressa</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Assinatura */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Assinatura Digital</h2>
          <div className="flex items-center gap-5">
            <div className="w-40 h-20 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
              {(signaturePreview || profile?.signature_url) ? (
                <img src={signaturePreview ?? profile!.signature_url!} alt="Assinatura"
                  className="max-h-full max-w-full object-contain" />
              ) : (
                <p className="text-xs text-slate-400 text-center px-3">Sem assinatura</p>
              )}
            </div>
            <div>
              <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2 w-fit">
                <Upload className="w-4 h-4" />
                Upload da assinatura
                <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
              </label>
              <p className="text-xs text-slate-400 mt-2">PNG ou JPG, fundo branco, até 2MB</p>
              <p className="text-xs text-slate-400">Aparece no rodapé da ficha impressa</p>
            </div>
          </div>
        </div>

        {/* Dados pessoais */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Dados Pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Nome Completo *</label>
              <input type="text" className="form-input"
                value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">CRM *</label>
              <input type="text" className="form-input font-mono" placeholder="SP-12345"
                value={form.crm} onChange={e => setForm(p => ({ ...p, crm: e.target.value }))} required />
            </div>
            <div>
              <label className="form-label">RQE</label>
              <input type="text" className="form-input font-mono" placeholder="Opcional"
                value={form.rqe} onChange={e => setForm(p => ({ ...p, rqe: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Celular</label>
              <input type="tel" className="form-input"
                value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Instituição de Residência</label>
              <input type="text" className="form-input"
                value={form.residency_institution}
                onChange={e => setForm(p => ({ ...p, residency_institution: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Preview do rodapé */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Preview do Rodapé da Ficha</h2>
          <div className="border-t border-slate-300 pt-3 text-center">
            {profile?.signature_url && (
              <img src={profile.signature_url} alt="Assinatura"
                className="max-h-12 mx-auto mb-1 object-contain" />
            )}
            <div className="border-t border-slate-900 pt-2 mt-1 inline-block min-w-[160px]">
              <p className="text-sm font-bold">{form.full_name || 'Nome Completo'}</p>
              <p className="text-xs text-slate-500">Anestesiologista</p>
              <p className="text-xs font-mono text-slate-500">CRM: {form.crm || '—'}</p>
              {form.rqe && <p className="text-xs font-mono text-slate-500">RQE: {form.rqe}</p>}
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className={`btn-primary w-full flex items-center justify-center gap-2 py-2.5 ${saved ? '!bg-emerald-600' : ''}`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Salvo com sucesso!' : saving ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </div>
  )
}
