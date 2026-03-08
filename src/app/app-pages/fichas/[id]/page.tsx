import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { ANESTHESIA_TYPES, MODALITIES } from '@/constants/anesthesia'
import { Edit2, Printer, Trash2, ArrowLeft } from 'lucide-react'
import { Organograma } from '@/components/ficha/Organograma'

export default async function ViewFichaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: record } = await supabase
    .from('anesthesia_records')
    .select('*, institutions(*), insurance_plans(*), profiles:user_id(full_name, crm, rqe, signature_url)')
    .eq('id', params.id)
    .single()

  if (!record) notFound()

  const anesthesiaLabel = ANESTHESIA_TYPES.find(t => t.value === record.anesthesia_type)?.label
  const modalityLabel = MODALITIES.find(m => m.value === record.modality)?.label

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/app/fichas" className="text-slate-400 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{record.patient_name}</h1>
            <p className="text-sm text-slate-500">{formatDate(record.procedure_date)} · {record.surgery_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/print/${record.id}`} target="_blank"
            className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Imprimir
          </Link>
          <Link href={`/app/fichas/${record.id}/editar`}
            className="btn-primary flex items-center gap-2 text-sm">
            <Edit2 className="w-4 h-4" /> Editar
          </Link>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 mb-5">
        {record.is_paid ? <span className="badge-success">✓ Pago</span> : <span className="badge-warning">⏳ Pendente</span>}
        {record.has_glosa && <span className="badge-danger">⚠ Glosa</span>}
        {record.modality === 'urgencia' && <span className="badge badge-danger">🚨 Urgência</span>}
      </div>

      {/* Dados principais */}
      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide text-xs text-slate-500">Identificação</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            ['Instituição', (record as any).institutions?.name ?? '—'],
            ['Cirurgião', record.surgeon ?? '—'],
            ['Tipo de Anestesia', anesthesiaLabel ?? record.anesthesia_type],
            ['Modalidade', modalityLabel ?? '—'],
            ['Hora Início', formatTime(record.start_time)],
            ['Hora Fim', formatTime(record.end_time)],
            ['CPF', record.patient_cpf ?? '—'],
            ['Sexo / Idade', `${record.patient_sex ?? '—'} / ${record.patient_age ?? '—'} anos`],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Organograma */}
      {record.timeline_data && (
        <div className="card p-4 mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Organograma</h2>
          <Organograma data={record.timeline_data as any} mode="print" />
        </div>
      )}

      {/* Descrição */}
      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Descrição</h2>
        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
          {record.description ?? '—'}
        </p>
      </div>

      {/* Desfecho + Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Desfecho</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total de fluidos</span>
              <span className="font-mono font-medium">{record.total_fluids_ml ? `${record.total_fluids_ml} mL` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destino</span>
              <span className="font-medium">{record.destination ?? '—'}</span>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Financeiro</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Plano</span>
              <span>{(record as any).insurance_plans?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valor</span>
              <span className="font-mono font-medium">{formatCurrency(record.surgery_value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span>{record.is_paid ? '✓ Pago' : record.has_glosa ? '⚠ Glosa' : '⏳ Pendente'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
