import { createServerClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: anesthesia }, { data: consultations }, { data: profile }] = await Promise.all([
    supabase
      .from('anesthesia_records')
      .select('*, institutions(name)')
      .eq('user_id', user!.id)
      .order('procedure_date', { ascending: false }),
    supabase
      .from('consultation_records')
      .select('*, institutions(name)')
      .eq('user_id', user!.id)
      .order('procedure_date', { ascending: false }),
    supabase.from('profiles').select('full_name, crm').eq('id', user!.id).single(),
  ])

  const anesthesiaRecords = (anesthesia ?? []).map((r: any) => ({ ...r, _type: 'anesthesia' }))
  const consultationRecords = (consultations ?? []).map((r: any) => ({
    ...r,
    _type: 'consultation',
    procedure_date: r.procedure_date ?? r.consultation_date,
  }))

  const allRecords = [...anesthesiaRecords, ...consultationRecords].sort((a, b) =>
    new Date(b.procedure_date).getTime() - new Date(a.procedure_date).getTime()
  )

  return <DashboardClient records={allRecords} profile={profile} />
}
