'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Stethoscope, Loader2, User, Users, ChevronDown } from 'lucide-react'

interface GrupoOption {
  id: string
  nome: string
  papel: string
  permissao_consolidado: boolean
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [modo, setModo] = useState<'individual' | 'grupo'>('individual')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Grupo
  const [grupos, setGrupos] = useState<GrupoOption[]>([])
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoOption | null>(null)
  const [loadingGrupos, setLoadingGrupos] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const emailBuscadoRef = useRef('')

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Busca grupos ao sair do campo email (onBlur)
  async function buscarGrupos() {
    if (!email || !email.includes('@')) return
    if (emailBuscadoRef.current === email) return // já buscou
    emailBuscadoRef.current = email

    setLoadingGrupos(true)
    setGrupos([])
    setGrupoSelecionado(null)

    // Autentica temporariamente para buscar grupos — não, apenas busca por email no profiles
    // Busca user_id pelo email via profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (!profile) {
      setLoadingGrupos(false)
      return
    }

    // Busca grupos do usuário
    const { data: membrosData } = await supabase
      .from('group_members')
      .select('papel, permissao_consolidado, group_id')
      .eq('user_id', profile.id)

    if (!membrosData || membrosData.length === 0) {
      setLoadingGrupos(false)
      return
    }

    const groupIds = membrosData.map((m: any) => m.group_id)
    const { data: gruposData } = await supabase
      .from('groups')
      .select('id, nome')
      .in('id', groupIds)

    const lista: GrupoOption[] = (gruposData ?? []).map((g: any) => {
      const membro = membrosData.find((m: any) => m.group_id === g.id)
      return {
        id: g.id,
        nome: g.nome,
        papel: membro?.papel ?? 'anestesista',
        permissao_consolidado: membro?.permissao_consolidado ?? false,
      }
    })

    setGrupos(lista)
    setLoadingGrupos(false)

    if (lista.length > 0) setShowDropdown(true)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (modo === 'grupo' && !grupoSelecionado) {
      setError('Selecione um grupo para continuar.')
      return
    }

    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email ou senha incorretos. Verifique seus dados.')
      setLoading(false)
      return
    }

    if (modo === 'grupo' && grupoSelecionado) {
      // Confirma que ainda é membro (dupla verificação)
      const { data: membro } = await supabase
        .from('group_members')
        .select('papel, permissao_consolidado')
        .eq('group_id', grupoSelecionado.id)
        .eq('user_id', authData.user.id)
        .single()

      if (!membro) {
        setError('Você não tem permissão para acessar este grupo.')
        setLoading(false)
        return
      }

      localStorage.setItem('grupo_id', grupoSelecionado.id)
      localStorage.setItem('grupo_nome', grupoSelecionado.nome)
      localStorage.setItem('grupo_papel', membro.papel)
      localStorage.setItem('grupo_permissao_consolidado', String(membro.permissao_consolidado))

      router.push(`/grupo/${grupoSelecionado.id}/dashboard`)
      router.refresh()
      return
    }

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
            <button type="button"
              onClick={() => { setModo('individual'); setError(null); setGrupoSelecionado(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                modo === 'individual'
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}>
              <User className="w-4 h-4" /> Individual
            </button>
            <button type="button"
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

            {/* EMAIL */}
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); emailBuscadoRef.current = '' }}
                onBlur={() => { if (modo === 'grupo') buscarGrupos() }}
                required
                autoComplete="email"
              />
            </div>

            {/* GRUPO — só no modo grupo, após email */}
            {modo === 'grupo' && (
              <div className="animate-fade-in" ref={dropdownRef}>
                <label className="form-label">Grupo</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => grupos.length > 0 && setShowDropdown(!showDropdown)}
                    className={`form-input w-full text-left flex items-center justify-between ${
                      !grupoSelecionado ? 'text-slate-400' : 'text-slate-900'
                    }`}>
                    <span>
                      {loadingGrupos
                        ? 'Buscando grupos...'
                        : grupoSelecionado
                          ? `${grupoSelecionado.nome} (${grupoSelecionado.papel})`
                          : grupos.length === 0 && emailBuscadoRef.current
                            ? 'Nenhum grupo encontrado'
                            : 'Selecione um grupo...'}
                    </span>
                    {loadingGrupos
                      ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </button>

                  {showDropdown && grupos.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      {grupos.map(g => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => { setGrupoSelecionado(g); setShowDropdown(false); setError(null) }}
                          className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b last:border-0">
                          <p className="text-sm font-medium text-slate-900">{g.nome}</p>
                          <p className="text-xs text-slate-400 capitalize">{g.papel}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SENHA */}
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
                <button type="button"
                  onClick={() => setShowPass(!showPass)}
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

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm text-primary-700 hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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
