import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { ANESTHESIA_TYPES, MODALITIES } from '@/constants/anesthesia'
import { Edit2, Printer, ArrowLeft } from 'lucide-react'
import { Organograma } from '@/components/ficha/Organograma'

export default async function ViewFichaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('anesthesia_records')
    .select('*, institutions(*), insurance_plans(*), profiles:user_id(full_name, crm, rqe, signature_url)')
    .eq('id', params.id)
    .single()

  if (!data) notFound()
  const r = data as any

  const anesthesiaLabel = ANESTHESIA_TYPES.find(t => t.value === r.anesthesia_type)?.label
  const modalityLabel = MODALITIES.find(m => m.value === r.modality)?.label

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/app/fichas" className="text-slate-400 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{r.patient_name}</h1>
            <p className="text-sm text-slate-500">{formatDate(r.procedure_date)} · {r.surgery_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/print/${r.id}`} target="_blank"
            className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Imprimir
          </Link>
          <Link href={`/app/fichas/${r.id}/editar`}
            className="btn-primary flex items-center gap-2 text-sm">
            <Edit2 className="w-4 h-4" /> Editar
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {r.is_paid ? <span className="badge-success">✓ Pago</span> : <span className="badge-warning">⏳ Pendente</span>}
        {r.has_glosa && <span className="badge-danger">⚠ Glosa</span>}
        {r.modality === 'urgencia' && <span className="badge badge-danger">🚨 Urgência</span>}
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Identificação</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            ['Instituição', r.institutions?.name ?? '—'],
            ['Cirurgião', r.surgeon ?? '—'],
            ['Tipo de Anestesia', anesthesiaLabel ?? r.anesthesia_type],
            ['Modalidade', modalityLabel ?? '—'],
            ['Hora Início', formatTime(r.start_time)],
            ['Hora Fim', formatTime(r.end_time)],
            ['CPF', r.patient_cpf ?? '—'],
            ['Sexo / Idade', `${r.patient_sex ?? '—'} / ${r.patient_age ?? '—'} anos`],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {r.timeline_data && (
        <div className="card p-4 mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Organograma</h2>
          <Organograma data={r.timeline_data} mode="print" />
        </div>
      )}

      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Descrição</h2>
        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
          {r.description ?? '—'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Desfecho</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total de fluidos</span>
              <span className="font-mono font-medium">{r.total_fluids_ml ? `${r.total_fluids_ml} mL` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destino</span>
              <span className="font-medium">{r.destination ?? '—'}</span>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Financeiro</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Plano</span>
              <span>{r.insurance_plans?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valor</span>
              <span className="font-mono font-medium">{formatCurrency(r.surgery_value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span>{r.is_paid ? '✓ Pago' : r.has_glosa ? '⚠ Glosa' : '⏳ Pendente'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
