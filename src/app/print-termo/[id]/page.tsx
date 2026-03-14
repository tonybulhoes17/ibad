import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TermoPrint } from '@/components/consulta/TermoPrint'

export default async function PrintTermoPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data } = await supabase
    .from('consultation_records')
    .select('*, institutions(*)')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) notFound()
  const r = data as any

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, crm, rqe, signature_url')
    .eq('id', r.user_id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">{r.patient_name}</p>
          <p className="text-xs text-slate-500">Termo de Consentimento</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="btn-primary text-sm px-4 py-2"
            id="print-btn"
          >
            🖨️ Imprimir Termo
          </button>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('print-btn')?.addEventListener('click', function() {
            window.print();
          });
        `
      }} />

      <div className="flex justify-center py-8">
        <div className="shadow-xl">
          <TermoPrint record={r} profile={profile} />
        </div>
      </div>
    </div>
  )
}
