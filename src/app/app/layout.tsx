import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import PWAInstallBanner from '@/components/PWAInstallBanner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: currentTerm }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('terms_of_use').select('version').order('created_at', { ascending: false }).limit(1).single(),
  ])

  if (currentTerm && profile?.terms_accepted_version !== currentTerm.version) {
    redirect('/termos')
  }

  return (
    <AppShell profile={profile}>
      <PWAInstallBanner />
      {children}
    </AppShell>
  )
}