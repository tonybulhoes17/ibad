import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Printer } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function ViewConsultaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('consultation_records')
    .select('*, institutions(*), insurance_plans(*)')
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    console.error('Erro ao buscar consulta:', error)
    notFound()
  }

  if (!data) {
    notFound()
  }

  const { data: profile } = data.user_id
    ? await supabase
        .from('profiles')
        .select('full_name, crm, rqe, signature_url')
        .eq('id', data.user_id)
        .maybeSingle()
    : { data: null }

  const r = {
    ...data,
    profiles: profile,
  } as any

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/app/fichas" className="text-slate-400 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{r.patient_name}</h1>
            <p className="text-sm text-slate-500">{formatDate(r.consultation_date)} · Consulta Pré-Anestésica</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/print-consulta/${r.id}`}
            target="_blank"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </Link>
          <Link
            href={`/app/consultas/${r.id}/editar`}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Edit2 className="w-4 h-4" /> Editar
          </Link>
        </div>
      </div>

      {/* resto da página */}
    </div>
  )
}