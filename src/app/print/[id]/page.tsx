import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FichaPrint } from '@/components/ficha/FichaPrint'
import { PrintActions } from './PrintActions'

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { from_group?: string }
}) {
  const supabase = createServerClient()
  const { data: record } = await supabase
    .from('anesthesia_records')
    .select(`
      *,
      institutions (*),
      insurance_plans (name),
      profiles:user_id (full_name, crm, rqe, signature_url)
    `)
    .eq('id', params.id)
    .single()

  if (!record) notFound()

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">Ficha: {record.patient_name}</p>
          <p className="text-xs text-slate-500">Visualização de impressão A4</p>
        </div>
        <PrintActions recordId={params.id} fromGroup={searchParams.from_group} />
      </div>
      <div className="flex justify-center py-8">
        <div className="shadow-xl">
          <FichaPrint record={record as any} />
        </div>
      </div>
    </div>
  )
}
