import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: currentTerm }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('terms_of_use').select('version').order('created_at', { ascending: false }).limit(1).single(),
  ])

  // Se há um termo vigente e o usuário não aceitou a versão atual → redireciona
  if (currentTerm && profile?.terms_accepted_version !== currentTerm.version) {
    redirect('/app/termos')
  }

  return <AppShell profile={profile}>{children}</AppShell>
}
