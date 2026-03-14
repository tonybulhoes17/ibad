import { ConsultaForm } from '@/components/consulta/ConsultaForm'
import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditarConsultaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('consultation_records')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) notFound()
  const r = data as any

  const initialData = {
    patient_name: r.patient_name ?? '',
    patient_cpf: r.patient_cpf ?? '',
    patient_sex: r.patient_sex ?? '',
    patient_age: r.patient_age ? String(r.patient_age) : '',
    patient_color: r.patient_color ?? '',
    patient_city: r.patient_city ?? '',
    patient_phone: r.patient_phone ?? '',
    patient_profession: r.patient_profession ?? '',
    surgery_name: r.surgery_name ?? '',
    surgeon: r.surgeon ?? '',
    surgery_hospital: r.surgery_hospital ?? '',
    procedure_date: r.procedure_date ?? '',
    consultation_date: r.consultation_date ?? '',
    institution_id: r.institution_id ?? '',
    previous_surgeries: r.previous_surgeries ?? '',
    complications: r.complications ?? '',
    blood_transfusion: r.blood_transfusion ?? '',
    habits: r.habits ?? '',
    allergies: r.allergies ?? false,
    allergies_details: r.allergies_details ?? '',
    comorbidities: r.comorbidities ?? '',
    medications: r.medications ?? '',
    asa_status: r.asa_status ?? '',
    urgency: r.urgency ?? false,
    weight: r.weight ? String(r.weight) : '',
    height: r.height ? String(r.height) : '',
    imc: r.imc ? String(r.imc) : '',
    physical_exam: r.physical_exam ?? '',
    mallampati: r.mallampati ?? '',
    vad_risk: r.vad_risk ?? false,
    lab_results: r.lab_results ?? '',
    xray: r.xray ?? '',
    ecg: r.ecg ?? '',
    other_exams: r.other_exams ?? '',
    specialist: r.specialist ?? '',
    fit_for_procedure: r.fit_for_procedure ?? true,
    proposed_anesthesia: r.proposed_anesthesia ?? '',
    fasting: r.fasting ?? '',
    medication_instructions: r.medication_instructions ?? '',
    observations: r.observations ?? '',
    uti_reservation: r.uti_reservation ?? false,
    blood_components: r.blood_components ?? false,
    surgery_value: r.surgery_value ? String(r.surgery_value) : '',
    insurance_plan_id: r.insurance_plan_id ?? '',
    is_paid: r.is_paid ?? false,
    has_glosa: r.has_glosa ?? false,
  }

  return <ConsultaForm mode="edit" consultaId={params.id} initialData={initialData} />
}
