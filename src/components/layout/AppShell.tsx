'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database.types'
import { getInitials } from '@/lib/utils'
import {
  LayoutDashboard, FileText, Building2, Shield,
  BookOpen, DollarSign, User, LogOut, Menu, X,
  Plus, ChevronRight, Stethoscope, Users, Ticket
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/app/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/app/fichas',       label: 'Fichas',          icon: FileText },
  { href: '/app/financeiro',   label: 'Financeiro',      icon: DollarSign },
  { href: '/app/instituicoes', label: 'Instituições',    icon: Building2 },
  { href: '/app/planos',       label: 'Planos de Saúde', icon: Shield },
  { href: '/app/modelos',      label: 'Modelos',         icon: BookOpen },
  { href: '/app/perfil',       label: 'Perfil',          icon: User },
]

const GRUPO_ITEMS = [
  { href: '/grupo/criar',   label: 'Criar Grupo',    icon: Users },
  { href: '/app/convite',   label: 'Usar Convite',   icon: Ticket },
]

interface AppShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export function AppShell({ profile, children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">IBAD</p>
          <p className="text-xs text-slate-400">Ficha Anestésica</p>
        </div>
      </div>

      {/* CTA Nova Ficha */}
      <div className="px-3 py-3 border-b border-slate-100">
        <Link
          href="/app/nova-ficha"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Ficha
        </Link>
      </div>

      {/* Nav principal */}
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

        {/* Separador Grupos */}
        <div className="pt-3 pb-1 px-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grupos</p>
        </div>

        {GRUPO_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
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
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
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
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
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
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-700 rounded-md flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">IBAD</span>
          </div>
          <Link href="/app/nova-ficha" className="p-1.5 bg-primary-700 rounded-lg text-white">
            <Plus className="w-5 h-5" />
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
