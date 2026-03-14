import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Printer } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function ViewConsultaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data } = await supabase
    .from('consultation_records')
    .select('*, institutions(*), insurance_plans(*)')
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
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">

      {/* Header */}
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

      {/* TESTE VISUAL */}
      <div className="bg-yellow-100 border border-yellow-300 rounded-xl px-4 py-3 mb-4 text-sm text-yellow-800">
        Conteúdo da consulta carregado abaixo
      </div>

      {/* Alertas */}
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

      {/* Dados Pessoais */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Dados Pessoais</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Nome</p><p className="font-medium text-slate-800">{r.patient_name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">CPF</p><p className="font-medium text-slate-800">{r.patient_cpf ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Sexo</p><p className="font-medium text-slate-800">{r.patient_sex ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Idade</p><p className="font-medium text-slate-800">{r.patient_age ? `${r.patient_age} anos` : '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Cidade</p><p className="font-medium text-slate-800">{r.patient_city ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Telefone</p><p className="font-medium text-slate-800">{r.patient_phone ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Profissão</p><p className="font-medium text-slate-800">{r.patient_profession ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Cor</p><p className="font-medium text-slate-800">{r.patient_color ?? '—'}</p></div>
        </div>
      </div>

      {/* Dados do Procedimento */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Dados do Procedimento</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Cirurgia</p><p className="font-medium text-slate-800">{r.surgery_name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Cirurgião</p><p className="font-medium text-slate-800">{r.surgeon ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Hospital</p><p className="font-medium text-slate-800">{r.surgery_hospital ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Data Procedimento</p><p className="font-medium text-slate-800">{formatDate(r.procedure_date)}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Instituição Consulta</p><p className="font-medium text-slate-800">{r.institutions?.name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Data Consulta</p><p className="font-medium text-slate-800">{formatDate(r.consultation_date)}</p></div>
        </div>
      </div>

      {/* Histórico Clínico */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico Clínico</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Cirurgias Anteriores</p><p className="font-medium text-slate-800">{r.previous_surgeries ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Intercorrências</p><p className="font-medium text-slate-800">{r.complications ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Hemotransfusão</p><p className="font-medium text-slate-800">{r.blood_transfusion ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Hábitos</p><p className="font-medium text-slate-800">{r.habits ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Alergias</p><p className="font-medium text-slate-800">{r.allergies ? (r.allergies_details || 'Sim') : 'Não'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Comorbidades</p><p className="font-medium text-slate-800">{r.comorbidities ?? '—'}</p></div>
        </div>
        {r.medications && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-0.5">Medicamentos em Uso</p>
            <p className="font-medium text-slate-800 text-sm">{r.medications}</p>
          </div>
        )}
      </div>

      {/* Exame Físico */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Exame Físico</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">ASA</p><p className="font-medium text-slate-800">{r.asa_status ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Urgência</p><p className="font-medium text-slate-800">{r.urgency ? 'Sim' : 'Não'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Peso</p><p className="font-medium text-slate-800">{r.weight ? `${r.weight} kg` : '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Altura</p><p className="font-medium text-slate-800">{r.height ? `${r.height} cm` : '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">IMC</p><p className="font-medium text-slate-800">{r.imc ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Mallampati</p><p className="font-medium text-slate-800">{r.mallampati ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Risco VAD</p><p className="font-medium text-slate-800">{r.vad_risk ? '⚠ Sim' : 'Não'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Exame Físico</p><p className="font-medium text-slate-800">{r.physical_exam ?? '—'}</p></div>
        </div>
      </div>

      {/* Exames */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Exames</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Laboratório</p><p className="font-medium text-slate-800">{r.lab_results ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">RX Tórax</p><p className="font-medium text-slate-800">{r.xray ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">ECG</p><p className="font-medium text-slate-800">{r.ecg ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Outros Exames</p><p className="font-medium text-slate-800">{r.other_exams ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Especialista</p><p className="font-medium text-slate-800">{r.specialist ?? '—'}</p></div>
        </div>
      </div>

      {/* Conclusão */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Conclusão</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm mb-3">
          <div><p className="text-xs text-slate-400 mb-0.5">Apto ao Procedimento</p><p className="font-medium text-slate-800">{r.fit_for_procedure ? 'Sim' : 'Não'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Anestesia Proposta</p><p className="font-medium text-slate-800">{r.proposed_anesthesia ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Reserva UTI</p><p className="font-medium text-slate-800">{r.uti_reservation ? 'Sim' : 'Não'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Reserva Hemocomponentes</p><p className="font-medium text-slate-800">{r.blood_components ? 'Sim' : 'Não'}</p></div>
        </div>
        {r.fasting && <div className="mt-2 pt-2 border-t border-slate-100"><p className="text-xs text-slate-400 mb-0.5">Jejum</p><p className="font-medium text-slate-800 text-sm">{r.fasting}</p></div>}
        {r.medication_instructions && <div className="mt-2 pt-2 border-t border-slate-100"><p className="text-xs text-slate-400 mb-0.5">Medicamentos — Orientações</p><p className="font-medium text-slate-800 text-sm">{r.medication_instructions}</p></div>}
        {r.observations && <div className="mt-2 pt-2 border-t border-slate-100"><p className="text-xs text-slate-400 mb-0.5">Observações</p><p className="font-medium text-slate-800 text-sm">{r.observations}</p></div>}
      </div>

      {/* Financeiro */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Financeiro</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-slate-400 mb-0.5">Plano</p><p className="font-medium text-slate-800">{r.insurance_plans?.name ?? '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Valor</p><p className="font-mono font-medium text-slate-800">{r.surgery_value ? `R$ ${Number(r.surgery_value).toFixed(2).replace('.', ',')}` : '—'}</p></div>
          <div><p className="text-xs text-slate-400 mb-0.5">Status</p><p className="font-medium text-slate-800">{r.is_paid ? '✓ Pago' : r.has_glosa ? '⚠ Glosa' : '⏳ Pendente'}</p></div>
        </div>
      </div>

      {/* Médico */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Médico Responsável</h2>
        <div className="flex items-center gap-4">
          {profile?.signature_url && (
            <img src={profile.signature_url} alt="Assinatura" style={{ maxHeight: 50, maxWidth: 160 }} />
          )}
          <div>
            <p className="font-medium text-slate-800">{profile?.full_name ?? '—'}</p>
            <p className="text-xs text-slate-500">CRM: {profile?.crm ?? '—'}</p>
            {profile?.rqe && <p className="text-xs text-slate-500">RQE: {profile.rqe}</p>}
          </div>
        </div>
      </div>

    </div>
  )
}