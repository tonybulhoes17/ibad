'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Stethoscope, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({ crm: '', rqe: '' })
  const [institution, setInstitution] = useState({ name: '', city: '' })
  const [error, setError] = useState<string | null>(null)

  const STEPS = [
    { title: 'Complete seu CRM', desc: 'Obrigatório para a ficha impressa' },
    { title: 'Cadastre uma instituição', desc: 'Você pode adicionar mais depois' },
    { title: 'Tudo pronto!', desc: '' },
  ]

  // Carrega o usuário assim que a página monta
  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        // Pré-preenche CRM se já foi informado no cadastro
        const { data: profile } = await supabase
          .from('profiles')
          .select('crm, rqe')
          .eq('id', session.user.id)
          .single()
        if (profile?.crm && profile.crm !== 'PENDENTE') {
          setForm({ crm: profile.crm, rqe: profile.rqe ?? '' })
        }
      } else {
        router.push('/login')
      }
    }
    loadUser()
  }, [])

  async function handleCRM() {
    if (!form.crm || !userId) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('profiles')
      .update({ crm: form.crm, rqe: form.rqe || null })
      .eq('id', userId)
    if (error) {
      setError('Erro ao salvar CRM. Tente novamente.')
      setSaving(false)
      return
    }
    setSaving(false)
    setStep(1)
  }

  async function handleInstitution() {
    if (!userId) return
    setSaving(true)
    setError(null)
    if (institution.name) {
      const { error } = await supabase
        .from('institutions')
        .insert({ name: institution.name, city: institution.city || null, user_id: userId })
      if (error) {
        setError('Erro ao salvar instituição. Tente novamente.')
        setSaving(false)
        return
      }
    }
    setSaving(false)
    setStep(2)
  }

  async function handleFinish() {
    if (!userId) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId)
    setSaving(false)
    router.push('/app/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-700 rounded-2xl mb-4 shadow-lg">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Configuração inicial</h1>
          <p className="text-sm text-slate-500 mt-1">3 passos rápidos</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-primary-700 text-white' :
                'bg-slate-200 text-slate-400'
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-1">{STEPS[step].title}</h2>
          {STEPS[step].desc && (
            <p className="text-sm text-slate-500 mb-4">{STEPS[step].desc}</p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-3">
              <div>
                <label className="form-label">CRM *</label>
                <input
                  type="text"
                  className="form-input font-mono text-lg"
                  placeholder="SP-12345"
                  value={form.crm}
                  onChange={e => setForm(p => ({ ...p, crm: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="form-label">RQE <span className="text-slate-400">(opcional)</span></label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Número RQE"
                  value={form.rqe}
                  onChange={e => setForm(p => ({ ...p, rqe: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <button
                onClick={handleCRM}
                disabled={!form.crm || saving || !userId}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Continuar
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="form-label">Nome da Instituição *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Hospital São Lucas"
                  value={institution.name}
                  onChange={e => setInstitution(p => ({ ...p, name: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="form-label">Cidade <span className="text-slate-400">(opcional)</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="São Paulo"
                  value={institution.city}
                  onChange={e => setInstitution(p => ({ ...p, city: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleInstitution}
                  disabled={!institution.name || saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  Continuar
                </button>
                <button onClick={() => setStep(2)} className="btn-secondary text-sm">
                  Pular
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <p className="text-slate-600 text-sm mb-5">
                Seu sistema está configurado! Você pode completar seu perfil e adicionar mais instituições depois.
              </p>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Ir para o Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
)
}