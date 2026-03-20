'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import {
  LayoutDashboard, FileText, DollarSign, Users,
  LogOut, Menu, X, Plus, ChevronRight, Stethoscope, ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GrupoContext {
  grupo_id: string
  grupo_nome: string
  grupo_papel: 'admin' | 'anestesista' | 'secretaria'
  grupo_permissao_consolidado: boolean
}

export default function GrupoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const grupoId = params.id as string
  const supabase = createClient()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ctx, setCtx] = useState<GrupoContext | null>(null)
  const [profile, setProfile] = useState<{ full_name: string; crm: string } | null>(null)

  useEffect(() => {
    // Lê contexto do grupo salvo no login
    const grupo_id = localStorage.getItem('grupo_id')
    const grupo_nome = localStorage.getItem('grupo_nome')
    const grupo_papel = localStorage.getItem('grupo_papel') as GrupoContext['grupo_papel']
    const grupo_permissao_consolidado = localStorage.getItem('grupo_permissao_consolidado') === 'true'

    if (!grupo_id || grupo_id !== grupoId) {
      router.push('/auth/login')
      return
    }

    setCtx({ grupo_id, grupo_nome: grupo_nome ?? '', grupo_papel, grupo_permissao_consolidado })

    // Busca perfil
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name, crm').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, [grupoId])

  async function handleLogout() {
    localStorage.removeItem('grupo_id')
    localStorage.removeItem('grupo_nome')
    localStorage.removeItem('grupo_papel')
    localStorage.removeItem('grupo_permissao_consolidado')
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const isAdmin = ctx?.grupo_papel === 'admin'
  const podeVerConsolidado = isAdmin || ctx?.grupo_permissao_consolidado

  const NAV_ITEMS = [
    { href: `/grupo/${grupoId}/dashboard`, label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: `/grupo/${grupoId}/fichas`, label: 'Fichas', icon: FileText, show: true },
    { href: `/grupo/${grupoId}/financeiro`, label: 'Financeiro', icon: DollarSign, show: podeVerConsolidado },
    { href: `/grupo/${grupoId}/membros`, label: 'Membros', icon: Users, show: isAdmin },
  ].filter(item => item.show)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo + nome do grupo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{ctx?.grupo_nome ?? 'Grupo'}</p>
          <p className="text-xs text-slate-400 capitalize">{ctx?.grupo_papel ?? ''}</p>
        </div>
      </div>

      {/* CTA Nova Ficha — secretaria não cria ficha */}
      {ctx?.grupo_papel !== 'secretaria' && (
        <div className="px-3 py-3 border-b border-slate-100">
          <Link
            href={`/grupo/${grupoId}/nova-ficha`}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Ficha
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                active
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn(
                'w-4 h-4 flex-shrink-0',
                active ? 'text-primary-700' : 'text-slate-400 group-hover:text-slate-600'
              )} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-primary-400" />}
            </Link>
          )
        })}

        {/* Voltar para conta individual */}
        <div className="pt-3">
          <Link
            href="/app/dashboard"
            onClick={() => {
              localStorage.removeItem('grupo_id')
              localStorage.removeItem('grupo_nome')
              localStorage.removeItem('grupo_papel')
              localStorage.removeItem('grupo_permissao_consolidado')
              setSidebarOpen(false)
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0 text-slate-400" />
            Conta Individual
          </Link>
        </div>
      </nav>

      {/* Perfil + Logout */}
      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary-700">
              {profile ? getInitials(profile.full_name) : '??'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{profile?.full_name}</p>
            <p className="text-xs text-slate-400 font-mono">{profile?.crm}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  if (!ctx) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
      Carregando...
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-white border-r border-slate-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-10">
            <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-700 rounded-md flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 truncate max-w-[140px]">{ctx?.grupo_nome}</span>
          </div>
          {ctx?.grupo_papel !== 'secretaria' && (
            <Link href={`/grupo/${grupoId}/nova-ficha`} className="p-1.5 bg-primary-700 rounded-lg text-white">
              <Plus className="w-5 h-5" />
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
