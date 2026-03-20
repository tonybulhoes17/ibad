'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Stethoscope, Loader2, User, Users } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [modo, setModo] = useState<'individual' | 'grupo'>('individual')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nomeGrupo, setNomeGrupo] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Autentica o usuário normalmente
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ou senha incorretos. Verifique seus dados.')
      setLoading(false)
      return
    }

    // 2. Se modo grupo, valida se o usuário pertence ao grupo informado
    if (modo === 'grupo') {
      if (!nomeGrupo.trim()) {
        setError('Informe o nome do grupo.')
        setLoading(false)
        return
      }

      // Busca o grupo pelo nome
      const { data: grupo, error: grupoError } = await supabase
        .from('groups')
        .select('id, nome')
        .ilike('nome', nomeGrupo.trim())
        .single()

      if (grupoError || !grupo) {
        setError('Grupo não encontrado. Verifique o nome informado.')
        setLoading(false)
        return
      }

      // Verifica se o usuário é membro do grupo
      const { data: membro, error: membroError } = await supabase
        .from('group_members')
        .select('id, papel, permissao_consolidado')
        .eq('group_id', grupo.id)
        .eq('user_id', authData.user.id)
        .single()

      if (membroError || !membro) {
        setError('Você não tem permissão para acessar este grupo.')
        setLoading(false)
        return
      }

      // Salva contexto do grupo no localStorage para uso nas páginas do grupo
      localStorage.setItem('grupo_id', grupo.id)
      localStorage.setItem('grupo_nome', grupo.nome)
      localStorage.setItem('grupo_papel', membro.papel)
      localStorage.setItem('grupo_permissao_consolidado', String(membro.permissao_consolidado))

      router.push(`/grupo/${grupo.id}/dashboard`)
      router.refresh()
      return
    }

    // 3. Modo individual — fluxo atual sem alteração
    router.push('/app/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-700 rounded-2xl mb-4 shadow-lg">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">IBAD</h1>
          <p className="text-slate-500 text-sm mt-1">Ficha Anestésica Digital</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Entrar</h2>
          <p className="text-sm text-slate-500 mb-6">Acesse sua conta para continuar</p>

          {/* Seletor Individual / Grupo */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setModo('individual'); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                modo === 'individual'
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}>
              <User className="w-4 h-4" /> Individual
            </button>
            <button
              type="button"
              onClick={() => { setModo('grupo'); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                modo === 'grupo'
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}>
              <Users className="w-4 h-4" /> Grupo
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Campo Nome do Grupo — só aparece no modo grupo */}
            {modo === 'grupo' && (
              <div className="animate-fade-in">
                <label className="form-label">Nome do Grupo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Digite o nome do grupo..."
                  value={nomeGrupo}
                  onChange={e => setNomeGrupo(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            )}

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm text-primary-700 hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{' '}
            <Link href="/register" className="text-primary-700 font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
