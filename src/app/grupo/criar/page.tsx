'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Users, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CriarGrupoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [nomeDisponivel, setNomeDisponivel] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Verifica disponibilidade do nome em tempo real
  async function checkNome(value: string) {
    setNome(value)
    setNomeDisponivel(null)
    if (value.trim().length < 3) return

    setChecking(true)
    const { data } = await supabase
      .from('groups')
      .select('id')
      .ilike('nome', value.trim())
      .maybeSingle()

    setNomeDisponivel(!data)
    setChecking(false)
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault()
    if (!nomeDisponivel) return
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Cria o grupo
    const { data: grupo, error: grupoError } = await supabase
      .from('groups')
      .insert({ nome: nome.trim(), cnpj: cnpj.trim() || null, criado_por: user.id })
      .select('id')
      .single()

    if (grupoError || !grupo) {
      setError('Erro ao criar o grupo. Tente novamente.')
      setLoading(false)
      return
    }

    // Adiciona o criador como admin
    await supabase.from('group_members').insert({
      group_id: grupo.id,
      user_id: user.id,
      papel: 'admin',
      permissao_consolidado: true,
    })

    // Salva contexto no localStorage e redireciona
    localStorage.setItem('grupo_id', grupo.id)
    localStorage.setItem('grupo_nome', nome.trim())
    localStorage.setItem('grupo_papel', 'admin')
    localStorage.setItem('grupo_permissao_consolidado', 'true')

    router.push(`/grupo/${grupo.id}/dashboard`)
  }

  return (
    <div className="p-4 lg:p-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="mb-6">
        <Link href="/app/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-700" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Criar Grupo</h1>
        </div>
        <p className="text-sm text-slate-500">Você será o administrador do grupo.</p>
      </div>

      {/* Card */}
      <div className="card p-6">
        <form onSubmit={handleCriar} className="space-y-5">

          {/* Nome do grupo */}
          <div>
            <label className="form-label">Nome do Grupo *</label>
            <div className="relative">
              <input
                type="text"
                className="form-input pr-8"
                placeholder="Ex: Grupo Anestesia Bahia"
                value={nome}
                onChange={e => checkNome(e.target.value)}
                required
                autoComplete="off"
                minLength={3}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                {!checking && nomeDisponivel === true && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {!checking && nomeDisponivel === false && <span className="text-red-500 text-xs font-medium">Indisponível</span>}
              </div>
            </div>
            {nomeDisponivel === false && (
              <p className="text-xs text-red-600 mt-1">Este nome já está em uso. Escolha outro.</p>
            )}
            {nomeDisponivel === true && (
              <p className="text-xs text-emerald-600 mt-1">Nome disponível!</p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Este será o nome que os membros digitarão ao fazer login no grupo.
            </p>
          </div>

          {/* CNPJ (opcional) */}
          <div>
            <label className="form-label">CNPJ <span className="text-slate-400 font-normal">(opcional)</span></label>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={e => setCnpj(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !nomeDisponivel}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            {loading ? 'Criando grupo...' : 'Criar Grupo'}
          </button>

        </form>
      </div>

    </div>
  )
}
