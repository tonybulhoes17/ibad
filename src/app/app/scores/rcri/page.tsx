'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const FATORES = [
  {
    id: 'cirurgia_alto_risco',
    label: 'Cirurgia de alto risco',
    desc: 'Cirurgia intratorácica, intraabdominal suprainguinal ou vascular (exceto cirurgia vascular periférica)',
  },
  {
    id: 'cardiopatia_isquemica',
    label: 'Cardiopatia isquêmica',
    desc: 'História de IAM, angina estável ou instável, uso de nitrato, ECG com onda Q patológica, teste de esforço positivo',
  },
  {
    id: 'icc',
    label: 'Insuficiência cardíaca congestiva',
    desc: 'História de ICC, edema pulmonar, dispneia paroxística noturna, B3 ou crepitações bilaterais ao exame',
  },
  {
    id: 'doenca_cerebrovascular',
    label: 'Doença cerebrovascular',
    desc: 'História de AVC isquêmico ou AIT (acidente isquêmico transitório)',
  },
  {
    id: 'diabetes_insulina',
    label: 'Diabetes mellitus insulino-dependente',
    desc: 'Diabetes em uso de insulina (não inclui antidiabéticos orais)',
  },
  {
    id: 'creatinina',
    label: 'Creatinina sérica > 2,0 mg/dL',
    desc: 'Insuficiência renal crônica com creatinina pré-operatória acima de 2,0 mg/dL',
  },
]

function getRisco(score: number) {
  if (score === 0) return {
    label: 'Risco Muito Baixo',
    color: 'emerald',
    cmce: '0,4%',
    ic95: '(0,1–0,8%)',
    desc: 'Risco muito baixo de complicações cardíacas maiores.',
    conduta: 'Prosseguir com a cirurgia sem necessidade de investigação cardiológica adicional rotineira. Monitorização padrão.',
    exames: 'Eletrocardiograma de repouso. Demais exames conforme avaliação clínica.',
  }
  if (score === 1) return {
    label: 'Risco Baixo',
    color: 'lime',
    cmce: '1,0%',
    ic95: '(0,5–1,4%)',
    desc: 'Risco baixo de complicações cardíacas maiores.',
    conduta: 'Prosseguir com a cirurgia. Avaliar necessidade de otimização clínica. Betabloqueador perioperatório em pacientes já em uso.',
    exames: 'ECG pré-operatório. Ecocardiograma se dispneia ou ICC não avaliada recentemente.',
  }
  if (score === 2) return {
    label: 'Risco Intermediário',
    color: 'yellow',
    cmce: '2,4%',
    ic95: '(1,3–3,5%)',
    desc: 'Risco moderado — avaliar necessidade de investigação adicional.',
    conduta: 'Considerar avaliação cardiológica pré-operatória. Otimizar tratamento de comorbidades. Avaliar capacidade funcional (METs). Se <4 METs e cirurgia de alto risco, considerar teste de estresse.',
    exames: 'ECG, ecocardiograma, avaliação da capacidade funcional. Considerar cintilografia miocárdica em casos selecionados.',
  }
  return {
    label: 'Risco Alto',
    color: 'red',
    cmce: score === 3 ? '5,4%' : '>9%',
    ic95: score === 3 ? '(3,9–6,9%)' : '(estimado)',
    desc: 'Risco alto de complicações cardíacas maiores perioperatórias.',
    conduta: 'Avaliação cardiológica pré-operatória obrigatória em cirurgias eletivas. Otimizar terapia clínica. Considerar adiar cirurgia para estabilização. Monitorização hemodinâmica invasiva conforme indicação. Discutir risco/benefício com paciente e família.',
    exames: 'ECG, ecocardiograma, avaliação funcional completa. Teste de estresse farmacológico (dobutamina) se incapaz de realizar esforço. Cateterismo em casos selecionados.',
  }
}

const colorCard: Record<string, string> = {
  emerald: 'border-emerald-400 bg-emerald-50',
  lime: 'border-lime-400 bg-lime-50',
  yellow: 'border-yellow-400 bg-yellow-50',
  red: 'border-red-400 bg-red-50',
}

const colorBadge: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800',
  lime: 'bg-lime-100 text-lime-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
}

const colorBar: Record<string, string> = {
  emerald: 'bg-emerald-500',
  lime: 'bg-lime-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

export default function RCRIPage() {
  const router = useRouter()
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})

  const score = Object.values(selecionados).filter(Boolean).length
  const risco = getRisco(score)

  function toggle(id: string) {
    setSelecionados(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">RCRI</h1>
        <p className="text-sm text-slate-500 mt-1">Revised Cardiac Risk Index — Risco de complicações cardíacas maiores perioperatórias</p>
      </div>

      {/* Score dinâmico */}
      <div className={`card p-4 mb-5 border-2 transition-all ${colorCard[risco.color]}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pontuação</p>
            <p className="text-3xl font-bold text-slate-900">
              {score}<span className="text-lg text-slate-400">/6</span>
            </p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorBadge[risco.color]}`}>
              {risco.label}
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">{risco.cmce}</p>
            <p className="text-xs text-slate-500">risco de CMCE</p>
          </div>
        </div>
        <div className="bg-white rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colorBar[risco.color]}`}
            style={{ width: `${(score / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Fatores */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-slate-700">Marque os fatores presentes (1 ponto cada):</p>
        {FATORES.map(f => (
          <button key={f.id} type="button"
            onClick={() => toggle(f.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
              selecionados[f.id]
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                : 'border-slate-200 bg-white hover:border-slate-400'
            }`}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              selecionados[f.id] ? 'bg-primary-700 border-primary-700' : 'border-slate-300 bg-white'
            }`}>
              {selecionados[f.id] && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">{f.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
            </div>
            <span className={`text-xs font-bold flex-shrink-0 mt-0.5 ${
              selecionados[f.id] ? 'text-primary-700' : 'text-slate-300'
            }`}>+1</span>
          </button>
        ))}
      </div>

      {/* Resultado */}
      <div className={`card p-6 border-2 ${colorCard[risco.color]} animate-fade-in`}>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          {risco.label} — {score}/6 pontos
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Risco de CMCE: <strong>{risco.cmce}</strong> {risco.ic95}
        </p>

        <div className="bg-white rounded-xl p-4 space-y-4 text-sm">

          {/* Tabela de referência */}
          <div>
            <p className="font-semibold text-slate-700 mb-2">📊 Referência por pontuação</p>
            <div className="space-y-1 text-xs">
              {[
                { pts: '0', label: 'Muito Baixo', cmce: '0,4%', c: 'bg-emerald-50 text-emerald-700' },
                { pts: '1', label: 'Baixo', cmce: '1,0%', c: 'bg-lime-50 text-lime-700' },
                { pts: '2', label: 'Intermediário', cmce: '2,4%', c: 'bg-yellow-50 text-yellow-700' },
                { pts: '3', label: 'Alto', cmce: '5,4%', c: 'bg-orange-50 text-orange-700' },
                { pts: '≥4', label: 'Muito Alto', cmce: '>9%', c: 'bg-red-50 text-red-700' },
              ].map(row => (
                <div key={row.pts}
                  className={`flex justify-between px-3 py-1.5 rounded-lg font-medium ${row.c} ${
                    (row.pts === String(score) || (row.pts === '≥4' && score >= 4)) ? 'ring-1 ring-current' : ''
                  }`}>
                  <span>{row.pts} fator{row.pts !== '1' ? 'es' : ''} — {row.label}</span>
                  <span>CMCE {row.cmce}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-1">🏥 Conduta perioperatória</p>
            <p className="text-slate-600 text-xs leading-relaxed">{risco.conduta}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-1">🔬 Exames sugeridos</p>
            <p className="text-slate-600 text-xs leading-relaxed">{risco.exames}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-2">❤️ Complicações cardíacas maiores (CMCE)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'IAM perioperatório',
                'Edema pulmonar agudo',
                'Fibrilação ventricular',
                'Parada cardíaca',
                'Bloqueio cardíaco completo',
                'Morte de causa cardíaca',
              ].map(c => (
                <div key={c} className="bg-slate-50 px-2 py-1.5 rounded text-slate-600">• {c}</div>
              ))}
            </div>
          </div>

          {score >= 3 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="font-semibold text-red-700 mb-1">⚠️ Avaliação cardiológica recomendada</p>
              <p className="text-red-600 text-xs leading-relaxed">
                Com {score} fatores de risco, recomenda-se avaliação cardiológica formal antes de cirurgias eletivas de médio e alto porte. Considerar otimização clínica e, se capacidade funcional {'<'}4 METs, investigação com teste de estresse.
              </p>
            </div>
          )}

          <div className="border-t pt-3">
            <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              O RCRI (Revised Cardiac Risk Index), também conhecido como Lee Index, foi derivado por Lee et al. em 1999 a partir de uma coorte de 4.315 pacientes submetidos a cirurgias não cardíacas eletivas de médio e alto porte. É o índice de risco cardíaco perioperatório mais validado e recomendado pelas diretrizes da ACC/AHA (2014) e da Sociedade Europeia de Cardiologia (ESC/ESA 2022) para estratificação de risco cardíaco pré-operatório em cirurgias não cardíacas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
