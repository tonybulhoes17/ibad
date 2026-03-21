'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Users, Copy, Check, Trash2, Plus, RefreshCw, Shield, Stethoscope, ClipboardList } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Papel = 'admin' | 'anestesista' | 'secretaria'

interface Membro {
  id: string
  user_id: string
  papel: Papel
  permissao_consolidado: boolean
  aceito_em: string
  full_name: string
  crm: string
}

interface Convite {
  id: string
  codigo: string
  criado_em: string
  expira_em: string
  usado: boolean
}

export default function GrupoMembrosPage() {
  const params = useParams()
  const grupoId = params.id as string
  const supabase = createClient()

  const [membros, setMembros] = useState<Membro[]>([])
  const [convites, setConvites] = useState<Convite[]>([])
  const [loading, setLoading] = useState(true)
  const [gerandoConvite, setGerandoConvite] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [grupoId])

  async function fetchData() {
    setLoading(true)

    const [{ data: membrosData }, { data: convitesData }] = await Promise.all([
      supabase.from('group_members').select('*').eq('group_id', grupoId),
      supabase.from('group_invites').select('*')
        .eq('group_id', grupoId)
        .eq('usado', false)
        .gte('expira_em', new Date().toISOString())
        .order('criado_em', { ascending: false }),
    ])

    // Busca profiles separadamente para evitar problema de RLS no join
    const userIds = (membrosData ?? []).map((m: any) => m.user_id)
    let profilesMap: Record<string, { full_name: string; crm: string }> = {}

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, crm')
        .in('id', userIds)

      profilesMap = Object.fromEntries(
        (profilesData ?? []).map((p: any) => [p.id, { full_name: p.full_name, crm: p.crm }])
      )
    }

    const membrosFormatados: Membro[] = (membrosData ?? []).map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      papel: m.papel,
      permissao_consolidado: m.permissao_consolidado,
      aceito_em: m.aceito_em,
      full_name: profilesMap[m.user_id]?.full_name ?? '—',
      crm: profilesMap[m.user_id]?.crm ?? '—',
    }))

    setMembros(membrosFormatados)
    setConvites((convitesData ?? []) as Convite[])
    setLoading(false)
  }

  async function gerarConvite() {
    setGerandoConvite(true)
    await supabase.from('group_invites').insert({ group_id: grupoId })
    await fetchData()
    setGerandoConvite(false)
  }

  function copiarCodigo(codigo: string) {
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  async function removerMembro(membroId: string) {
    if (!confirm('Remover este membro do grupo? As fichas dele permanecerão no grupo.')) return
    await supabase.from('group_members').delete().eq('id', membroId)
    await fetchData()
  }

  async function alterarPapel(membro: Membro, novoPapel: Papel) {
    setUpdatingId(membro.id)
    await supabase.from('group_members').update({ papel: novoPapel }).eq('id', membro.id)
    await fetchData()
    setUpdatingId(null)
  }

  async function togglePermissaoConsolidado(membro: Membro) {
    setUpdatingId(membro.id)
    await supabase.from('group_members').update({ permissao_consolidado: !membro.permissao_consolidado }).eq('id', membro.id)
    await fetchData()
    setUpdatingId(null)
  }

  async function revogarConvite(conviteId: string) {
    await supabase.from('group_invites').delete().eq('id', conviteId)
    await fetchData()
  }

  const papelIcon = (papel: Papel) => {
    if (papel === 'admin') return <Shield className="w-3 h-3" />
    if (papel === 'secretaria') return <ClipboardList className="w-3 h-3" />
    return <Stethoscope className="w-3 h-3" />
  }

  const papelColor = (papel: Papel) => {
    if (papel === 'admin') return 'bg-primary-50 text-primary-700'
    if (papel === 'secretaria') return 'bg-amber-50 text-amber-700'
    return 'bg-emerald-50 text-emerald-700'
  }

  if (loading) return <div className="p-6 text-center text-slate-400">Carregando...</div>

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Membros</h1>
          <p className="text-sm text-slate-500">{membros.length} membro{membros.length !== 1 ? 's' : ''} no grupo</p>
        </div>
        <button
          onClick={gerarConvite}
          disabled={gerandoConvite}
          className="btn-primary flex items-center gap-2 text-sm">
          {gerandoConvite ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Gerar Convite
        </button>
      </div>

      {/* Convites ativos */}
      {convites.length > 0 && (
        <div className="card mb-6">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Convites Ativos</h3>
            <p className="text-xs text-slate-400 mt-0.5">Compartilhe o código com o anestesista. Expira em 7 dias.</p>
          </div>
          <div className="divide-y divide-slate-50">
            {convites.map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg tracking-widest">
                      {c.codigo.toUpperCase()}
                    </span>
                    <button
                      onClick={() => copiarCodigo(c.codigo.toUpperCase())}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors"
                      title="Copiar código"
                    >
                      {copiado === c.codigo.toUpperCase()
                        ? <Check className="w-4 h-4 text-emerald-500" />
                        : <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Expira em {formatDate(c.expira_em)}</p>
                </div>
                <button
                  onClick={() => revogarConvite(c.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  title="Revogar convite"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de membros */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Membros do Grupo</h3>
        </div>
        {membros.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Nenhum membro encontrado</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {membros.map(m => (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-700">
                    {m.full_name?.charAt(0) ?? '?'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900">{m.full_name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${papelColor(m.papel)}`}>
                      {papelIcon(m.papel)} {m.papel}
                    </span>
                    {m.permissao_consolidado && m.papel !== 'admin' && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        Visão consolidada
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">CRM: {m.crm}</p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {updatingId === m.id ? (
                    <span className="text-xs text-slate-400 animate-pulse">...</span>
                  ) : (
                    <>
                      {m.papel !== 'admin' && (
                        <select
                          value={m.papel}
                          onChange={e => alterarPapel(m, e.target.value as Papel)}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          <option value="anestesista">Anestesista</option>
                          <option value="secretaria">Secretaria</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}

                      {m.papel === 'anestesista' && (
                        <button
                          onClick={() => togglePermissaoConsolidado(m)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                            m.permissao_consolidado
                              ? 'bg-primary-50 text-primary-700 border-primary-200'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'
                          }`}
                        >
                          Consolidado
                        </button>
                      )}

                      {m.papel !== 'admin' && (
                        <button
                          onClick={() => removerMembro(m.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
