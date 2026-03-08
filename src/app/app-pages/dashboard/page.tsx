import { createServerClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: records }, { data: profile }] = await Promise.all([
    supabase
      .from('anesthesia_records')
      .select('*, institutions(name)')
      .eq('user_id', user!.id)
      .order('procedure_date', { ascending: false }),
    supabase.from('profiles').select('full_name, crm').eq('id', user!.id).single(),
  ])

  return <DashboardClient records={records ?? []} profile={profile} />
}
