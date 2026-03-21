'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Users, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UsarConvitePage() {
  const router = useRouter()
  const supabase = createClient()

  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  async function handleAceitar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSucesso(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // 1. Busca o convite pelo código
    const { data: convite, error: conviteError } = await supabase
      .from('group_invites')
      .select('id, group_id, usado, expira_em, groups(nome)')
      .ilike('codigo', codigo.trim())
      .single()

    if (conviteError || !convite) {
      setError('Código inválido. Verifique e tente novamente.')
      setLoading(false)
      return
    }

    // 2. Verifica se já foi usado
    if (convite.usado) {
      setError('Este código já foi utilizado.')
      setLoading(false)
      return
    }

    // 3. Verifica se expirou
    if (new Date(convite.expira_em) < new Date()) {
      setError('Este código expirou. Solicite um novo convite ao administrador.')
      setLoading(false)
      return
    }

    // 4. Verifica se já é membro
    const { data: membroExistente } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', convite.group_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membroExistente) {
      setError('Você já é membro deste grupo.')
      setLoading(false)
      return
    }

    // 5. Adiciona como membro anestesista
    const { error: membroError } = await supabase
      .from('group_members')
      .insert({
        group_id: convite.group_id,
        user_id: user.id,
        papel: 'anestesista',
        permissao_consolidado: false,
      })

    if (membroError) {
      setError('Erro ao entrar no grupo. Tente novamente.')
      setLoading(false)
      return
    }

    // 6. Marca convite como usado
    await supabase
      .from('group_invites')
      .update({ usado: true })
      .eq('id', convite.id)

    // 7. Salva contexto e redireciona
    const grupoNome = (convite.groups as any)?.nome ?? ''
    localStorage.setItem('grupo_id', convite.group_id)
    localStorage.setItem('grupo_nome', grupoNome)
    localStorage.setItem('grupo_papel', 'anestesista')
    localStorage.setItem('grupo_permissao_consolidado', 'false')

    setSucesso(`Você entrou no grupo "${grupoNome}" com sucesso!`)
    setLoading(false)

    setTimeout(() => {
      router.push(`/grupo/${convite.group_id}/dashboard`)
    }, 1500)
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
          <div>
            <h1 className="text-xl font-bold text-slate-900">Usar Código de Convite</h1>
            <p className="text-sm text-slate-500">Digite o código recebido do administrador do grupo.</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="card p-6">
        <form onSubmit={handleAceitar} className="space-y-5">

          <div>
            <label className="form-label">Código do Convite</label>
            <input
              type="text"
              className="form-input font-mono text-center text-lg tracking-widest uppercase"
              placeholder="EX: A1B2C3D4"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              required
              autoComplete="off"
              maxLength={8}
            />
            <p className="text-xs text-slate-400 mt-1">
              O código tem 8 caracteres e foi enviado pelo administrador do grupo.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {sucesso && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || codigo.trim().length < 6}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            {loading ? 'Verificando...' : 'Entrar no Grupo'}
          </button>

        </form>
      </div>

      {/* Info */}
      <div className="mt-4 card p-4 bg-slate-50">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-700">Como funciona?</strong><br />
          Ao usar um código válido você entra automaticamente como <strong>anestesista</strong> no grupo.
          O administrador poderá alterar seu papel posteriormente.
          Suas fichas individuais não são afetadas.
        </p>
      </div>

    </div>
  )
}
