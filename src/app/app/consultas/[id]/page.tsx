import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Printer } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ANESTHESIA_TYPES } from '@/constants/anesthesia'

export default async function ViewConsultaPage({ params }: { params: { id: string } }) {
  console.log('PARAMS:', params)
  const supabase = createServerClient()
  const { data } = await supabase
    .from('consultation_records')
    .select('*')
    .eq('id', params.id)
    .single()

  console.log('DATA:', data)
  if (!data) notFound()

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
          <Link href={`/print-consulta/${r.id}`} target="_blank"
            className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> Imprimir
          </Link>
          <Link href={`/app/consultas/${r.id}/editar`}
            className="btn-primary flex items-center gap-2 text-sm">
            <Edit2 className="w-4 h-4" /> Editar
          </Link>
        </div>
      </div>

      {r.vad_risk && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-sm text-red-700 font-semibold">
          ⚠ Via Aérea Difícil (VAD)
        </div>
      )}
      {r.allergies && (
        <div className="mb-4 flex items-center gap-2 bg-orange-50 border border-orange-300 rounded-xl px-4 py-3 text-sm text-orange-700 font-semibold">
          ⚠ Alergia: {r.allergies_details || 'Sim'}
        </div>
      )}

      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Dados Pessoais</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            ['Nome', r.patient_name],
            ['CPF', r.patient_cpf ?? '—'],
            ['Sexo', r.patient_sex ?? '—'],
            ['Idade', r.patient_age ? `${r.patient_age} anos` : '—'],
            ['Cidade', r.patient_city ?? '—'],
            ['Telefone', r.patient_phone ?? '—'],
            ['Profissão', r.patient_profession ?? '—'],
            ['Cor', r.patient_color ?? '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Dados do Procedimento</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            ['Cirurgia', r.surgery_name ?? '—'],
            ['Cirurgião', r.surgeon ?? '—'],
            ['Hospital', r.surgery_hospital ?? '—'],
            ['Data Procedimento', formatDate(r.procedure_date)],
            ['Instituição Consulta', r.institutions?.name ?? '—'],
            ['Data Consulta', formatDate(r.consultation_date)],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico Clínico</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          {[
            ['Cirurgias Anteriores', r.previous_surgeries ?? '—'],
            ['Intercorrências', r.complications ?? '—'],
            ['Hemotransfusão', r.blood_transfusion ?? '—'],
            ['Hábitos', r.habits ?? '—'],
            ['Alergias', r.allergies ? (r.allergies_details || 'Sim') : 'Não'],
            ['Comorbidades', r.comorbidities ?? '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </div>
        {r.medications && (
          <div className="mt-3">
            <p className="text-xs text-slate-400 mb-0.5">Medicamentos em Uso</p>
            <p className="font-medium text-slate-800 text-sm">{r.medications}</p>
          </div>
        )}
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Exame Físico</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            ['ASA', r.asa_status ?? '—'],
            ['Urgência', r.urgency ? 'Sim' : 'Não'],
            ['Peso', r.weight ? `${r.weight} kg` : '—'],
            ['Altura', r.height ? `${r.height} cm` : '—'],
            ['IMC', r.imc ?? '—'],
            ['Mallampati', r.mallampati ?? '—'],
            ['Risco VAD', r.vad_risk ? '⚠ Sim' : 'Não'],
            ['Exame Físico', r.physical_exam ?? '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Exames</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          {[
            ['Laboratório', r.lab_results ?? '—'],
            ['RX Tórax', r.xray ?? '—'],
            ['ECG', r.ecg ?? '—'],
            ['Outros Exames', r.other_exams ?? '—'],
            ['Especialista', r.specialist ?? '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Conclusão</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          {[
            ['Apto ao Procedimento', r.fit_for_procedure ? 'Sim' : 'Não'],
            ['Anestesia Proposta', r.proposed_anesthesia ?? '—'],
            ['Reserva UTI', r.uti_reservation ? 'Sim' : 'Não'],
            ['Reserva Hemocomponentes', r.blood_components ? 'Sim' : 'Não'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400 mb-0.5">{k}</p>
              <p className="font-medium text-slate-800">{v}</p>
            </div>
          ))}
        </div>
        {r.fasting && <div className="mt-3"><p className="text-xs text-slate-400 mb-0.5">Jejum</p><p className="font-medium text-slate-800 text-sm">{r.fasting}</p></div>}
        {r.medication_instructions && <div className="mt-3"><p className="text-xs text-slate-400 mb-0.5">Medicamentos — Orientações</p><p className="font-medium text-slate-800 text-sm">{r.medication_instructions}</p></div>}
        {r.observations && <div className="mt-3"><p className="text-xs text-slate-400 mb-0.5">Observações</p><p className="font-medium text-slate-800 text-sm">{r.observations}</p></div>}
      </div>

      <div className="card p-5">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Financeiro</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Plano</p><p className="font-medium text-slate-800">{r.insurance_plans?.name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Valor</p><p className="font-medium text-slate-800 font-mono">{r.surgery_value ? `R$ ${Number(r.surgery_value).toFixed(2).replace('.', ',')}` : '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Status</p><p className="font-medium text-slate-800">{r.is_paid ? '✓ Pago' : r.has_glosa ? '⚠ Glosa' : '⏳ Pendente'}</p></div>
        </div>
      </div>
    </div>
  )
}
