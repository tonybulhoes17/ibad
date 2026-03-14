'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useInstituicoes, usePlanos } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { ANESTHESIA_TYPES } from '@/constants/anesthesia'
import { Save, Loader2, ChevronRight, ChevronLeft, Search, X, AlertTriangle, Copy } from 'lucide-react'

const STEPS = ['Identificação', 'Histórico Clínico', 'Exame Físico', 'Exames & Conclusão', 'Administrativo']

const ASA_OPTIONS = ['ASA I', 'ASA II', 'ASA III', 'ASA IV']
const MALLAMPATI_OPTIONS = ['I', 'II', 'III', 'IV']

const DEFAULT_FASTING = 'Jejum de 08 horas para sólidos e Jejum de 02 horas para líquidos sem resíduos (água, água de coco ou suco de laranja coado)'

type FormData = {
  patient_name: string
  patient_cpf: string
  patient_sex: string
  patient_age: string
  patient_color: string
  patient_city: string
  patient_phone: string
  patient_profession: string
  surgery_name: string
  surgeon: string
  surgery_hospital: string
  procedure_date: string
  consultation_date: string
  institution_id: string
  previous_surgeries: string
  complications: string
  blood_transfusion: string
  habits: string
  allergies: boolean
  allergies_details: string
  comorbidities: string
  medications: string
  asa_status: string
  urgency: boolean
  weight: string
  height: string
  imc: string
  physical_exam: string
  mallampati: string
  vad_risk: boolean
  lab_results: string
  xray: string
  ecg: string
  other_exams: string
  specialist: string
  fit_for_procedure: boolean
  proposed_anesthesia: string
  fasting: string
  medication_instructions: string
  observations: string
  uti_reservation: boolean
  blood_components: boolean
  surgery_value: string
  insurance_plan_id: string
  is_paid: boolean
  has_glosa: boolean
}

const initial: FormData = {
  patient_name: '', patient_cpf: '', patient_sex: '', patient_age: '',
  patient_color: '', patient_city: '', patient_phone: '', patient_profession: '',
  surgery_name: '', surgeon: '', surgery_hospital: '',
  procedure_date: '', consultation_date: new Date().toISOString().slice(0, 10),
  institution_id: '',
  previous_surgeries: '', complications: '', blood_transfusion: '', habits: '',
  allergies: false, allergies_details: '',
  comorbidities: '', medications: '',
  asa_status: '', urgency: false,
  weight: '', height: '', imc: '',
  physical_exam: '', mallampati: '', vad_risk: false,
  lab_results: '', xray: '', ecg: '', other_exams: '', specialist: '',
  fit_for_procedure: true, proposed_anesthesia: '',
  fasting: DEFAULT_FASTING,
  medication_instructions: '', observations: '',
  uti_reservation: false, blood_components: false,
  surgery_value: '', insurance_plan_id: '',
  is_paid: false, has_glosa: false,
}

// Palavras que ativam alerta de Monjaro/caneta
const MONJARO_WORDS = ['monjaro', 'ozempic', 'wegovy', 'saxenda', 'semaglutida', 'liraglutida', 'tirzepatida', 'caneta']
// Palavras que ativam alerta de itens estéticos
const COSMETIC_WORDS = ['gel', 'esmalte', 'aplique', 'piercing', 'lente', 'silicone', 'botox', 'preenchimento']

function checkMonjaro(text: string) {
  const lower = text.toLowerCase()
  return MONJARO_WORDS.some(w => lower.includes(w))
}

function checkCosmetic(text: string) {
  const lower = text.toLowerCase()
  return COSMETIC_WORDS.some(w => lower.includes(w))
}

interface ConsultaFormProps {
  initialData?: Partial<FormData>
  consultaId?: string
  mode?: 'create' | 'edit'
}

export function ConsultaForm({ initialData, consultaId, mode = 'create' }: ConsultaFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { instituicoes } = useInstituicoes()
  const { planos } = usePlanos()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({ ...initial, ...initialData })

  // Busca pré-consulta
  const [preSearch, setPreSearch] = useState('')
  const [preResults, setPreResults] = useState<any[]>([])
  const [searchingPre, setSearchingPre] = useState(false)
  const preSearchRef = useRef<NodeJS.Timeout>()

  // Busca consultas anteriores
  const [previousConsultas, setPreviousConsultas] = useState<any[]>([])
  const [showPrevious, setShowPrevious] = useState(false)

  // Alertas
  const showMonjaroAlert = checkMonjaro(form.medications)
  const showCosmeticAlert = checkCosmetic(form.physical_exam)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Calcular IMC automaticamente
  useEffect(() => {
    const w = parseFloat(form.weight)
    const h = parseFloat(form.height) / 100
    if (w > 0 && h > 0) {
      set('imc', (w / (h * h)).toFixed(1))
    } else {
      set('imc', '')
    }
  }, [form.weight, form.height])

  // Busca pré-consultas em tempo real
  useEffect(() => {
    if (preSearch.length < 3) {
      setPreResults([])
      return
    }
    clearTimeout(preSearchRef.current)
    preSearchRef.current = setTimeout(async () => {
      setSearchingPre(true)
      const { data } = await supabase
        .from('pre_consultations')
        .select('*')
        .ilike('full_name', `%${preSearch}%`)
        .order('created_at', { ascending: false })
        .limit(5)
      setPreResults(data ?? [])
      setSearchingPre(false)
    }, 400)
  }, [preSearch])

  // Busca consultas anteriores ao digitar nome
  useEffect(() => {
    if (form.patient_name.length < 3) {
      setPreviousConsultas([])
      setShowPrevious(false)
      return
    }
    const timer = setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('consultation_records')
        .select('id, patient_name, patient_cpf, consultation_date, surgery_name')
        .eq('user_id', user.id)
        .ilike('patient_name', `%${form.patient_name}%`)
        .order('consultation_date', { ascending: false })
        .limit(5)
      if (data && data.length > 0) {
        setPreviousConsultas(data)
        setShowPrevious(true)
      } else {
        setPreviousConsultas([])
        setShowPrevious(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [form.patient_name])

  // Importar dados da pré-consulta
  function importPreConsulta(pre: any) {
    setForm(prev => ({
      ...prev,
      patient_name: prev.patient_name || pre.full_name || '',
      patient_cpf: prev.patient_cpf || pre.cpf || '',
      patient_age: prev.patient_age || String(pre.age ?? ''),
      patient_city: prev.patient_city || pre.city || '',
      surgery_name: prev.surgery_name || pre.procedure_name || '',
      surgeon: prev.surgeon || pre.surgeon || '',
      surgery_hospital: prev.surgery_hospital || pre.surgery_hospital || '',
      procedure_date: prev.procedure_date || pre.procedure_date || '',
      previous_surgeries: prev.previous_surgeries || (pre.previous_surgeries ? (pre.previous_surgeries_details || 'Sim') : 'Não'),
      habits: prev.habits || (pre.smoking ? `Tabagismo: ${pre.smoking_details || 'Sim'}` : 'Nega tabagismo'),
      allergies: prev.allergies || pre.drug_allergy || false,
      allergies_details: prev.allergies_details || pre.drug_allergy_details || '',
      comorbidities: prev.comorbidities || pre.comorbidities || '',
      medications: prev.medications || pre.medications || '',
      weight: prev.weight || String(pre.weight ?? ''),
      height: prev.height || String(pre.height ?? ''),
      physical_exam: prev.physical_exam || [
        pre.dental_prosthesis ? 'Prótese dentária' : '',
        pre.cosmetic_items ? 'Itens estéticos' : '',
      ].filter(Boolean).join(', '),
    }))
    setPreSearch('')
    setPreResults([])
  }

  // Criar cópia de consulta anterior
  async function copiarConsulta(id: string) {
    const { data } = await (supabase.from('consultation_records') as any)
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      const { id: _, user_id, created_at, updated_at, consultation_date, ...rest } = data
      setForm(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(rest).map(([k, v]) => [k, v === null ? '' : String(v)])
        ),
        consultation_date: new Date().toISOString().slice(0, 10),
        is_paid: false,
        has_glosa: false,
        surgery_value: '',
        insurance_plan_id: '',
      }))
      setShowPrevious(false)
    }
  }

  async function handleSubmit() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      patient_name: form.patient_name,
      patient_cpf: form.patient_cpf || null,
      patient_sex: form.patient_sex || null,
      patient_age: form.patient_age ? parseInt(form.patient_age) : null,
      patient_color: form.patient_color || null,
      patient_city: form.patient_city || null,
      patient_phone: form.patient_phone || null,
      patient_profession: form.patient_profession || null,
      surgery_name: form.surgery_name || null,
      surgeon: form.surgeon || null,
      surgery_hospital: form.surgery_hospital || null,
      procedure_date: form.procedure_date || null,
      consultation_date: form.consultation_date,
      institution_id: form.institution_id || null,
      previous_surgeries: form.previous_surgeries || null,
      complications: form.complications || null,
      blood_transfusion: form.blood_transfusion || null,
      habits: form.habits || null,
      allergies: form.allergies,
      allergies_details: form.allergies_details || null,
      comorbidities: form.comorbidities || null,
      medications: form.medications || null,
      asa_status: form.asa_status || null,
      urgency: form.urgency,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      imc: form.imc ? parseFloat(form.imc) : null,
      physical_exam: form.physical_exam || null,
      mallampati: form.mallampati || null,
      vad_risk: form.vad_risk,
      lab_results: form.lab_results || null,
      xray: form.xray || null,
      ecg: form.ecg || null,
      other_exams: form.other_exams || null,
      specialist: form.specialist || null,
      fit_for_procedure: form.fit_for_procedure,
      proposed_anesthesia: form.proposed_anesthesia || null,
      fasting: form.fasting || null,
      medication_instructions: form.medication_instructions || null,
      observations: form.observations || null,
      uti_reservation: form.uti_reservation,
      blood_components: form.blood_components,
      surgery_value: form.surgery_value ? parseFloat(form.surgery_value) : 0,
      insurance_plan_id: form.insurance_plan_id || null,
      is_paid: form.is_paid,
      has_glosa: form.has_glosa,
    }

    if (mode === 'edit' && consultaId) {
      await (supabase.from('consultation_records') as any).update(payload).eq('id', consultaId)
      router.push(`/app/consultas/${consultaId}`)
    } else {
      const { data } = await (supabase.from('consultation_records') as any)
        .insert(payload).select().single()
      if (data) router.push(`/app/consultas/${data.id}`)
    }
    setSaving(false)
  }

  const isValid = form.patient_name && form.surgery_name

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-6 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-0 flex-shrink-0">
            <button onClick={() => setStep(i)}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                i === step ? 'bg-primary-700 text-white' :
                i < step ? 'text-primary-600 hover:bg-primary-50' : 'text-slate-400'
              }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border flex-shrink-0 ${
                i === step ? 'bg-white text-primary-700 border-white' :
                i < step ? 'bg-primary-100 border-primary-200 text-primary-600' :
                'border-slate-300 text-slate-400'
              }`}>{i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* STEP 0: Identificação */}
      {step === 0 && (
        <div className="space-y-4 animate-fade-in">

          {/* Busca Pré-Consulta */}
          <div className="card p-5 border-blue-200 bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" /> Importar dados de Pré-Consulta
            </h3>
            <div className="relative">
              <input type="text" value={preSearch}
                onChange={e => setPreSearch(e.target.value)}
                placeholder="Digite o nome do paciente (mín. 3 letras)..."
                className="w-full border border-blue-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
              {searchingPre && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-blue-400" />
              )}
            </div>
            {preResults.length > 0 && (
              <div className="mt-2 bg-white border border-blue-200 rounded-lg overflow-hidden shadow-sm">
                {preResults.map(pre => (
                  <button key={pre.id} type="button"
                    onClick={() => importPreConsulta(pre)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 transition-colors">
                    <div className="font-medium text-slate-800 text-sm">{pre.full_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {pre.cpf && `CPF: ${pre.cpf} · `}
                      {pre.age && `${pre.age} anos · `}
                      {pre.procedure_name && pre.procedure_name}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {preSearch.length >= 3 && !searchingPre && preResults.length === 0 && (
              <p className="text-xs text-blue-500 mt-2">Nenhuma pré-consulta encontrada.</p>
            )}
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="section-header">Dados Pessoais</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <label className="form-label">Nome do Paciente *</label>
                <input type="text" className="form-input" placeholder="Nome completo"
                  value={form.patient_name}
                  onChange={e => set('patient_name', e.target.value)} />
                {/* Consultas anteriores */}
                {showPrevious && previousConsultas.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-amber-300 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-3 py-2 bg-amber-50 border-b border-amber-200">
                      <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Consultas anteriores encontradas
                      </p>
                    </div>
                    {previousConsultas.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-3 py-2 border-b last:border-0 hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{c.patient_name}</p>
                          <p className="text-xs text-slate-400">{c.patient_cpf && `CPF: ${c.patient_cpf} · `}{c.consultation_date} · {c.surgery_name}</p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button type="button"
                            onClick={() => router.push(`/app/consultas/${c.id}`)}
                            className="text-xs text-primary-600 hover:text-primary-800 font-medium whitespace-nowrap">
                            Ver
                          </button>
                          <button type="button"
                            onClick={() => copiarConsulta(c.id)}
                            className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded hover:bg-amber-600 font-medium whitespace-nowrap">
                            Copiar
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setShowPrevious(false)}
                      className="w-full text-xs text-slate-400 py-1.5 hover:bg-slate-50 flex items-center justify-center gap-1">
                      <X className="w-3 h-3" /> Fechar
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">CPF</label>
                <input type="text" className="form-input font-mono" placeholder="000.000.000-00"
                  value={form.patient_cpf}
                  onChange={e => set('patient_cpf', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Idade</label>
                <input type="number" className="form-input" placeholder="Anos"
                  value={form.patient_age}
                  onChange={e => set('patient_age', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Sexo</label>
                <select className="form-select" value={form.patient_sex} onChange={e => set('patient_sex', e.target.value)}>
                  <option value="">—</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div>
                <label className="form-label">Cor</label>
                <input type="text" className="form-input" placeholder="Cor/raça"
                  value={form.patient_color}
                  onChange={e => set('patient_color', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Cidade</label>
                <input type="text" className="form-input" placeholder="Cidade"
                  value={form.patient_city}
                  onChange={e => set('patient_city', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Telefone</label>
                <input type="text" className="form-input font-mono" placeholder="(00) 00000-0000"
                  value={form.patient_phone}
                  onChange={e => set('patient_phone', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Profissão</label>
                <input type="text" className="form-input" placeholder="Profissão"
                  value={form.patient_profession}
                  onChange={e => set('patient_profession', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="section-header">Dados do Procedimento</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Cirurgia Proposta *</label>
                <input type="text" className="form-input" placeholder="Nome da cirurgia"
                  value={form.surgery_name}
                  onChange={e => set('surgery_name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Cirurgião</label>
                <input type="text" className="form-input" placeholder="Nome do cirurgião"
                  value={form.surgeon}
                  onChange={e => set('surgeon', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Hospital da Cirurgia</label>
                <input type="text" className="form-input" placeholder="Local da cirurgia"
                  value={form.surgery_hospital}
                  onChange={e => set('surgery_hospital', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Data do Procedimento</label>
                <input type="date" className="form-input"
                  value={form.procedure_date}
                  onChange={e => set('procedure_date', e.target.value)} />
              </div>
            </div>
            </div>
        </div>
      )}

      {/* STEP 1: Histórico Clínico */}
      {step === 1 && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <h2 className="section-header">Histórico Clínico/Cirúrgico</h2>

          <div>
            <label className="form-label">Cirurgias Anteriores</label>
            <input type="text" className="form-input" placeholder="Não / Sim (descrever)"
              value={form.previous_surgeries}
              onChange={e => set('previous_surgeries', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Intercorrências</label>
            <input type="text" className="form-input" placeholder="Não / Descrever"
              value={form.complications}
              onChange={e => set('complications', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Hemotransfusão</label>
              <input type="text" className="form-input" placeholder="Não / Sim"
                value={form.blood_transfusion}
                onChange={e => set('blood_transfusion', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Hábitos</label>
              <input type="text" className="form-input" placeholder="Tabagismo, etilismo..."
                value={form.habits}
                onChange={e => set('habits', e.target.value)} />
            </div>
          </div>

          {/* Alergias */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="form-label mb-0">Alergias</label>
              <div className="flex gap-2">
                {['Não', 'Sim'].map(v => (
                  <button key={v} type="button"
                    onClick={() => set('allergies', v === 'Sim')}
                    className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
                      form.allergies === (v === 'Sim')
                        ? v === 'Sim' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-600 text-white border-slate-600'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}>{v}</button>
                ))}
              </div>
            </div>
            {form.allergies && (
              <input type="text" className="form-input border-red-300 bg-red-50"
                placeholder="Especificar alergia(s)"
                value={form.allergies_details}
                onChange={e => set('allergies_details', e.target.value)} />
            )}
          </div>

          <div>
            <label className="form-label">Comorbidades</label>
            <input type="text" className="form-input" placeholder="Diabetes, HAS, etc."
              value={form.comorbidities}
              onChange={e => set('comorbidities', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Medicamentos em Uso</label>
            {showMonjaroAlert && (
              <div className="mb-2 flex items-center gap-2 bg-orange-50 border border-orange-300 rounded-lg px-3 py-2 text-xs text-orange-700 font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Atenção: paciente em uso de caneta emagrecedora. Avaliar jejum prolongado!
              </div>
            )}
            <textarea className="form-textarea w-full" rows={3}
              placeholder="Listar medicamentos em uso..."
              value={form.medications}
              onChange={e => set('medications', e.target.value)} />
          </div>
        </div>
      )}

      {/* STEP 2: Exame Físico */}
      {step === 2 && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <h2 className="section-header">Exame Físico</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Peso (kg)</label>
              <input type="number" className="form-input" placeholder="Ex: 70"
                value={form.weight}
                onChange={e => set('weight', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Altura (cm)</label>
              <input type="number" className="form-input" placeholder="Ex: 165"
                value={form.height}
                onChange={e => set('height', e.target.value)} />
            </div>
            <div>
              <label className="form-label">IMC</label>
              <input type="text" className="form-input bg-slate-50 font-mono" readOnly
                value={form.imc || '—'}
                placeholder="Calculado auto." />
            </div>
            <div>
              <label className="form-label">Urgência</label>
              <button type="button"
                onClick={() => set('urgency', !form.urgency)}
                className={`w-full py-2 text-sm rounded-lg border font-medium transition-colors ${
                  form.urgency ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300'
                }`}>
                {form.urgency ? '⚠ Urgência' : 'Eletiva'}
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Estado Físico ASA</label>
            <div className="flex gap-2 flex-wrap">
              {ASA_OPTIONS.map(asa => (
                <button key={asa} type="button"
                  onClick={() => set('asa_status', asa)}
                  className={`px-4 py-2 text-sm rounded-lg border font-medium transition-colors ${
                    form.asa_status === asa
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}>{asa}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Exame Físico</label>
            {showCosmeticAlert && (
              <div className="mb-2 flex items-center gap-2 bg-orange-50 border border-orange-300 rounded-lg px-3 py-2 text-xs text-orange-700 font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Atenção: paciente com itens estéticos. Orientar retirada antes do procedimento!
              </div>
            )}
            <input type="text" className="form-input"
              placeholder="Ex: Prótese dentária, normal..."
              value={form.physical_exam}
              onChange={e => set('physical_exam', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Mallampati</label>
              <div className="flex gap-2">
                {MALLAMPATI_OPTIONS.map(m => (
                  <button key={m} type="button"
                    onClick={() => set('mallampati', m)}
                    className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                      form.mallampati === m
                        ? 'bg-primary-700 text-white border-primary-700'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Risco VAD</label>
              <button type="button"
                onClick={() => set('vad_risk', !form.vad_risk)}
                className={`w-full py-2 text-sm rounded-lg border font-medium transition-colors ${
                  form.vad_risk
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}>
                {form.vad_risk ? '⚠ VAD — Via Aérea Difícil' : 'VAD — Sem risco'}
              </button>
            </div>
          </div>

          {form.vad_risk && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-700 font-medium">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              Via Aérea Difícil marcada! Será destacado na ficha impressa.
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Exames & Conclusão */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5 space-y-4">
            <h2 className="section-header">Exames</h2>
            <div>
              <label className="form-label">Laboratório</label>
              <textarea className="form-textarea w-full" rows={2}
                placeholder="HB, HT, PLQ, UR, CR, GLIC..."
                value={form.lab_results}
                onChange={e => set('lab_results', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">RX Tórax</label>
                <input type="text" className="form-input" placeholder="Normal / Alterado"
                  value={form.xray}
                  onChange={e => set('xray', e.target.value)} />
              </div>
              <div>
                <label className="form-label">ECG</label>
                <input type="text" className="form-input" placeholder="RS / Alteração"
                  value={form.ecg}
                  onChange={e => set('ecg', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="form-label">Outros Exames</label>
              <input type="text" className="form-input" placeholder="ECOTT, Cintilografia..."
                value={form.other_exams}
                onChange={e => set('other_exams', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Especialista</label>
              <input type="text" className="form-input" placeholder="Ex: Cardio (CRM: 00000): Baixo risco CV"
                value={form.specialist}
                onChange={e => set('specialist', e.target.value)} />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="section-header">Conclusão</h2>

            <div className="flex items-center gap-3">
              <label className="form-label mb-0">Apto ao Procedimento?</label>
              <div className="flex gap-2">
                {['Sim', 'Não'].map(v => (
                  <button key={v} type="button"
                    onClick={() => set('fit_for_procedure', v === 'Sim')}
                    className={`px-4 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                      form.fit_for_procedure === (v === 'Sim')
                        ? v === 'Sim' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-600 border-slate-300'
                    }`}>{v}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Anestesia Proposta</label>
              <select className="form-select" value={form.proposed_anesthesia}
                onChange={e => set('proposed_anesthesia', e.target.value)}>
                <option value="">Selecione...</option>
                {ANESTHESIA_TYPES.map(t => <option key={t.value} value={t.label}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Jejum</label>
              <textarea className="form-textarea w-full" rows={2}
                value={form.fasting}
                onChange={e => set('fasting', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Medicamentos em Uso — Orientações</label>
              <textarea className="form-textarea w-full" rows={2}
                placeholder="Ex: Manter / Suspender X 24h antes..."
                value={form.medication_instructions}
                onChange={e => set('medication_instructions', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Observações</label>
              <textarea className="form-textarea w-full" rows={2}
                placeholder="Observações adicionais..."
                value={form.observations}
                onChange={e => set('observations', e.target.value)} />
            </div>

            <div className="flex gap-4">
              <ToggleField label="Reserva UTI" value={form.uti_reservation}
                onChange={v => set('uti_reservation', v)} color="orange" />
              <ToggleField label="Reserva Hemocomp." value={form.blood_components}
                onChange={v => set('blood_components', v)} color="red" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Administrativo */}
      {step === 4 && (
        <div className="card p-5 space-y-4 animate-fade-in border-dashed border-slate-300 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-500 mb-2">
            💼 Informações Administrativas (não aparecem na ficha impressa)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Instituição da Consulta</label>
                <select className="form-select" value={form.institution_id} onChange={e => set('institution_id', e.target.value)}>
                  <option value="">Selecione...</option>
                  {instituicoes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Data da Consulta</label>
                <input type="date" className="form-input"
                  value={form.consultation_date}
                  onChange={e => set('consultation_date', e.target.value)} />
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Plano de Saúde</label>
              <select className="form-select" value={form.insurance_plan_id}
                onChange={e => set('insurance_plan_id', e.target.value)}>
                <option value="">Selecione...</option>
                {planos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Valor da Consulta (R$)</label>
              <input type="number" className="form-input font-mono" placeholder="0,00" step="0.01"
                value={form.surgery_value}
                onChange={e => set('surgery_value', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3">
            <ToggleField label="Pago" value={form.is_paid} onChange={v => set('is_paid', v)} color="green" />
            <ToggleField label="Glosa" value={form.has_glosa} onChange={v => set('has_glosa', v)} color="red" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button type="button"
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <div className="flex gap-3">
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)}
              className="btn-primary flex items-center gap-2">
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit}
              disabled={saving || !isValid}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar Consulta'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleField({ label, value, onChange, color }: {
  label: string; value: boolean; onChange: (v: boolean) => void
  color: 'green' | 'red' | 'orange'
}) {
  const activeClass = color === 'green' ? 'bg-emerald-600 text-white border-emerald-600'
    : color === 'orange' ? 'bg-orange-500 text-white border-orange-500'
    : 'bg-red-600 text-white border-red-600'
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border font-medium transition-colors ${
        value ? activeClass : 'bg-white text-slate-600 border-slate-200'
      }`}>
      <span className={`w-3 h-3 rounded-full border ${value ? 'bg-white border-white' : 'border-slate-400'}`} />
      {label}: {value ? 'Sim' : 'Não'}
    </button>
  )
}
