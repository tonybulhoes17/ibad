'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useInstituicoes, usePlanos, useTemplates, useSaveFicha } from '@/hooks'
import { useGrupoInstituicoes, useGrupoPlanos } from '@/hooks/grupo'
import { Organograma } from './Organograma'
import type { AnesthesiaRecord, TimelineData } from '@/types/database.types'
import { ANESTHESIA_TYPES, MODALITIES, DESTINATIONS, DEFAULT_TEMPLATES } from '@/constants/anesthesia'
import { generateDefaultTimeline, formatDate } from '@/lib/utils'
import { Save, Eye, Loader2, ChevronRight, ChevronLeft, Copy } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type FormData = Omit<AnesthesiaRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>

const STEPS = ['Identificação', 'Tipo & Tempo', 'Organograma', 'Descrição & Desfecho']

interface FichaFormProps {
  initialData?: Partial<FormData>
  recordId?: string
  mode?: 'create' | 'edit'
  groupId?: string | null
}

export function FichaForm({ initialData, recordId, mode = 'create', groupId: groupIdProp }: FichaFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = groupIdProp ?? searchParams.get('group_id')
  const { instituicoes: instituicoesInd } = useInstituicoes()
  const { planos: planosInd } = usePlanos()
  const { instituicoes: instituicoesGrupo } = useGrupoInstituicoes(groupId ?? '')
  const { planos: planosGrupo } = useGrupoPlanos(groupId ?? '')
  const instituicoes = groupId ? instituicoesGrupo : instituicoesInd
  const planos = groupId ? planosGrupo : planosInd
  const { getByType } = useTemplates()
  const { save, update, saving } = useSaveFicha()
  const [step, setStep] = useState(0)

  const [form, setForm] = useState<FormData>({
    procedure_date: new Date().toISOString().slice(0, 10),
    institution_id: null,
    anesthesia_code: null,
    patient_name: '',
    patient_cpf: null,
    patient_age: null,
    patient_sex: null,
    surgeon: null,
    surgery_name: '',
    anesthesia_type: '',
    modality: 'eletiva',
    start_time: null,
    end_time: null,
    total_fluids_ml: null,
    destination: null,
    description: null,
    timeline_data: generateDefaultTimeline(60) as TimelineData,
    insurance_plan_id: null,
    surgery_value: null,
    is_paid: false,
    has_glosa: false,
    notes: null,
    ...initialData,
  })

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // Auto-preencher descrição ao mudar tipo de anestesia
  function handleAnesthesiaTypeChange(type: string) {
    set('anesthesia_type', type)
    const template = getByType(type) ?? DEFAULT_TEMPLATES[type] ?? null
    if (template) set('description', template)
  }

  // Auto-preencher timeline ao mudar duração
  function handleDurationChange(mins: number) {
    set('timeline_data', generateDefaultTimeline(mins) as TimelineData)
  }

  async function handleSubmit() {
    const payload = { ...form }
    if (mode === 'edit' && recordId) {
      const { error } = await update(recordId, payload)
      if (!error) router.push(`/app/fichas/${recordId}`)
    } else {
      const { record, error } = await save(payload, groupId)
      if (!error && record) {
        const destino = groupId ? `/grupo/${groupId}/fichas` : `/app/fichas/${record.id}`
        router.push(destino)
      }
    }
  }

  const isValid = form.patient_name && form.surgery_name && form.anesthesia_type

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-0">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                i === step ? 'bg-primary-700 text-white' :
                i < step ? 'text-primary-600 hover:bg-primary-50' :
                'text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
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
        <div className="card p-5 space-y-4 animate-fade-in">
          <h2 className="section-header">Identificação do Caso</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2 lg:col-span-1">
              <label className="form-label">Data do Procedimento *</label>
              <input type="date" className="form-input"
                value={form.procedure_date}
                onChange={e => set('procedure_date', e.target.value)} />
            </div>
            <div className="col-span-2 lg:col-span-2">
              <label className="form-label">Instituição</label>
              <select className="form-select"
                value={form.institution_id ?? ''}
                onChange={e => set('institution_id', e.target.value || null)}>
                <option value="">Selecione...</option>
                {instituicoes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nome do Paciente *</label>
              <input type="text" className="form-input" placeholder="Nome completo"
                value={form.patient_name}
                onChange={e => set('patient_name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">CPF</label>
              <input type="text" className="form-input font-mono" placeholder="000.000.000-00"
                value={form.patient_cpf ?? ''}
                onChange={e => set('patient_cpf', e.target.value || null)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Idade</label>
              <input type="number" className="form-input" placeholder="Anos" min={0} max={150}
                value={form.patient_age ?? ''}
                onChange={e => set('patient_age', e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className="form-label">Sexo</label>
              <select className="form-select"
                value={form.patient_sex ?? ''}
                onChange={e => set('patient_sex', (e.target.value as 'M' | 'F') || null)}>
                <option value="">—</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div>
              <label className="form-label">Cód. Anestesia</label>
              <input type="text" className="form-input font-mono" placeholder="Opcional"
                value={form.anesthesia_code ?? ''}
                onChange={e => set('anesthesia_code', e.target.value || null)} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Cirurgião</label>
              <input type="text" className="form-input" placeholder="Nome do cirurgião"
                value={form.surgeon ?? ''}
                onChange={e => set('surgeon', e.target.value || null)} />
            </div>
            <div>
              <label className="form-label">Cirurgia Realizada *</label>
              <input type="text" className="form-input" placeholder="Nome da cirurgia"
                value={form.surgery_name}
                onChange={e => set('surgery_name', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: Tipo & Tempo */}
      {step === 1 && (
        <div className="card p-5 space-y-4 animate-fade-in">
          <h2 className="section-header">Tipo de Anestesia & Tempo</h2>
          <div>
            <label className="form-label">Tipo de Anestesia *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ANESTHESIA_TYPES.map(t => (
                <button key={t.value} type="button"
                  onClick={() => handleAnesthesiaTypeChange(t.value)}
                  className={`text-sm px-3 py-2 rounded-lg border text-left transition-colors ${
                    form.anesthesia_type === t.value
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Modalidade</label>
              <div className="flex gap-2">
                {MODALITIES.map(m => (
                  <button key={m.value} type="button"
                    onClick={() => set('modality', m.value as 'eletiva' | 'urgencia')}
                    className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                      form.modality === m.value
                        ? m.value === 'urgencia'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-primary-700 text-white border-primary-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Duração estimada</label>
              <select className="form-select"
                onChange={e => handleDurationChange(Number(e.target.value))}>
                <option value={60}>1 hora</option>
                <option value={30}>30 min</option>
                <option value={90}>1h30</option>
                <option value={120}>2 horas</option>
                <option value={180}>3 horas</option>
                <option value={240}>4 horas</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Hora de Início</label>
              <input type="time" className="form-input font-mono"
                value={form.start_time ?? ''}
                onChange={e => set('start_time', e.target.value || null)} />
            </div>
            <div>
              <label className="form-label">Hora de Fim</label>
              <input type="time" className="form-input font-mono"
                value={form.end_time ?? ''}
                onChange={e => set('end_time', e.target.value || null)} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Organograma */}
      {step === 2 && (
        <div className="card p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">Organograma Anestésico</h2>
            <p className="text-xs text-slate-400">Clique nos valores para editar</p>
          </div>
          {form.timeline_data && (
            <Organograma
              data={form.timeline_data}
              onChange={d => set('timeline_data', d)}
              mode="edit"
            />
          )}
        </div>
      )}

      {/* STEP 3: Descrição & Desfecho */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <h2 className="section-header">Descrição da Anestesia</h2>
            <textarea
              className="form-textarea w-full"
              style={{ minHeight: '220px' }}
              placeholder="Descreva o procedimento anestésico..."
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value || null)}
            />
          </div>

          <div className="card p-5">
            <h2 className="section-header">Desfecho</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Total de Fluidos (mL)</label>
                <input type="number" className="form-input font-mono" placeholder="0"
                  value={form.total_fluids_ml ?? ''}
                  onChange={e => set('total_fluids_ml', e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div>
                <label className="form-label">Destino</label>
                <div className="flex gap-2">
                  {DESTINATIONS.map(d => (
                    <button key={d.value} type="button"
                      onClick={() => set('destination', d.value as AnesthesiaRecord['destination'])}
                      className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${
                        form.destination === d.value
                          ? 'bg-primary-700 text-white border-primary-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 border-dashed border-slate-300 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-500 mb-4">
              💼 Informações Administrativas (não aparecem na ficha impressa)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Plano de Saúde</label>
                <select className="form-select"
                  value={form.insurance_plan_id ?? ''}
                  onChange={e => set('insurance_plan_id', e.target.value || null)}>
                  <option value="">Selecione...</option>
                  {planos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Valor da Cirurgia (R$)</label>
                <input type="number" className="form-input font-mono" placeholder="0,00" step="0.01"
                  value={form.surgery_value ?? ''}
                  onChange={e => set('surgery_value', e.target.value ? Number(e.target.value) : null)} />
              </div>
              <div className="flex gap-3">
                <ToggleField label="Pago" value={form.is_paid} onChange={v => set('is_paid', v)} color="green" />
                <ToggleField label="Glosa" value={form.has_glosa} onChange={v => set('has_glosa', v)} color="red" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
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
            <>
              <button type="button"
                onClick={() => router.push(`/print/${recordId ?? 'preview'}`)}
                className="btn-secondary flex items-center gap-2">
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button type="button"
                onClick={handleSubmit}
                disabled={saving || !isValid}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : 'Salvar Ficha'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleField({ label, value, onChange, color }: {
  label: string; value: boolean; onChange: (v: boolean) => void; color: 'green' | 'red'
}) {
  const activeClass = color === 'green'
    ? 'bg-emerald-600 text-white border-emerald-600'
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
