'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Stethoscope, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    crm: '',
    phone: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          crm: form.crm,
          phone: form.phone,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-700 rounded-2xl mb-4 shadow-lg">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">IBAD</h1>
          <p className="text-slate-500 text-sm mt-1">Ficha Anestésica Digital</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Criar conta</h2>
          <p className="text-sm text-slate-500 mb-6">Cadastro rápido — complete os detalhes depois</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="form-label">Nome completo *</label>
              <input type="text" className="form-input" placeholder="Dr. João da Silva"
                value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
            </div>

            <div>
              <label className="form-label">CRM *</label>
              <input type="text" className="form-input font-mono" placeholder="SP-12345"
                value={form.crm} onChange={e => set('crm', e.target.value)} required />
            </div>

            <div>
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" placeholder="seu@email.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div>
              <label className="form-label">Celular</label>
              <input type="tel" className="form-input" placeholder="(11) 99999-9999"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Senha *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="form-input pr-10"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary-700 font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
