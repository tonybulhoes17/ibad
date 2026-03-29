'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

// Cada parâmetro tem pontuação 0-4
const PARAMETROS = [
  {
    id: 'respiratorio',
    sistema: 'Respiratório',
    label: 'PaO₂/FiO₂ (mmHg)',
    emoji: '🫁',
    opcoes: [
      { pts: 0, label: '≥ 400', desc: 'Normal' },
      { pts: 1, label: '300–399', desc: 'Leve' },
      { pts: 2, label: '200–299', desc: 'Moderado' },
      { pts: 3, label: '100–199 + VM', desc: 'Grave — com ventilação mecânica' },
      { pts: 4, label: '< 100 + VM', desc: 'Muito grave — com ventilação mecânica' },
    ],
  },
  {
    id: 'coagulacao',
    sistema: 'Coagulação',
    label: 'Plaquetas (×10³/µL)',
    emoji: '🩸',
    opcoes: [
      { pts: 0, label: '≥ 150', desc: 'Normal' },
      { pts: 1, label: '100–149', desc: 'Leve' },
      { pts: 2, label: '50–99', desc: 'Moderado' },
      { pts: 3, label: '20–49', desc: 'Grave' },
      { pts: 4, label: '< 20', desc: 'Muito grave' },
    ],
  },
  {
    id: 'hepatico',
    sistema: 'Hepático',
    label: 'Bilirrubina total (mg/dL)',
    emoji: '🟡',
    opcoes: [
      { pts: 0, label: '< 1,2', desc: 'Normal' },
      { pts: 1, label: '1,2–1,9', desc: 'Leve' },
      { pts: 2, label: '2,0–5,9', desc: 'Moderado' },
      { pts: 3, label: '6,0–11,9', desc: 'Grave' },
      { pts: 4, label: '≥ 12,0', desc: 'Muito grave' },
    ],
  },
  {
    id: 'cardiovascular',
    sistema: 'Cardiovascular',
    label: 'PAM ou vasopressores',
    emoji: '❤️',
    opcoes: [
      { pts: 0, label: 'PAM ≥ 70 mmHg', desc: 'Sem vasopressor' },
      { pts: 1, label: 'PAM < 70 mmHg', desc: 'Hipotensão sem vasopressor' },
      { pts: 2, label: 'Dopamina ≤ 5 ou Dobutamina', desc: 'Qualquer dose' },
      { pts: 3, label: 'Dopamina 5,1–15 ou NE/Epi ≤ 0,1', desc: 'µg/kg/min' },
      { pts: 4, label: 'Dopamina > 15 ou NE/Epi > 0,1', desc: 'µg/kg/min' },
    ],
  },
  {
    id: 'neurologico',
    sistema: 'Neurológico',
    label: 'Glasgow Coma Scale',
    emoji: '🧠',
    opcoes: [
      { pts: 0, label: '15', desc: 'Normal' },
      { pts: 1, label: '13–14', desc: 'Leve' },
      { pts: 2, label: '10–12', desc: 'Moderado' },
      { pts: 3, label: '6–9', desc: 'Grave' },
      { pts: 4, label: '< 6', desc: 'Muito grave — coma profundo' },
    ],
  },
  {
    id: 'renal',
    sistema: 'Renal',
    label: 'Creatinina (mg/dL) ou diurese',
    emoji: '🫘',
    opcoes: [
      { pts: 0, label: '< 1,2', desc: 'Normal' },
      { pts: 1, label: '1,2–1,9', desc: 'Leve' },
      { pts: 2, label: '2,0–3,4', desc: 'Moderado' },
      { pts: 3, label: '3,5–4,9 ou diurese < 500 mL/dia', desc: 'Grave' },
      { pts: 4, label: '> 5,0 ou diurese < 200 mL/dia', desc: 'Muito grave' },
    ],
  },
]

function getMortalidade(score: number) {
  if (score <= 1) return { label: '< 10%', color: 'emerald' }
  if (score <= 3) return { label: '< 10%', color: 'emerald' }
  if (score <= 5) return { label: '~20%', color: 'yellow' }
  if (score <= 7) return { label: '~20–33%', color: 'yellow' }
  if (score <= 9) return { label: '~40%', color: 'orange' }
  if (score <= 11) return { label: '~50%', color: 'orange' }
  return { label: '> 95%', color: 'red' }
}

function getClassificacao(score: number) {
  if (score <= 1) return { label: 'Sem disfunção significativa', color: 'emerald' }
  if (score <= 3) return { label: 'Disfunção orgânica leve', color: 'lime' }
  if (score <= 6) return { label: 'Disfunção orgânica moderada', color: 'yellow' }
  if (score <= 9) return { label: 'Disfunção orgânica grave', color: 'orange' }
  return { label: 'Disfunção orgânica muito grave', color: 'red' }
}

const colorCard: Record<string, string> = {
  emerald: 'border-emerald-400 bg-emerald-50',
  lime: 'border-lime-400 bg-lime-50',
  yellow: 'border-yellow-400 bg-yellow-50',
  orange: 'border-orange-400 bg-orange-50',
  red: 'border-red-400 bg-red-50',
}

const colorBadge: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800',
  lime: 'bg-lime-100 text-lime-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
}

const colorBar: Record<string, string> = {
  emerald: 'bg-emerald-500',
  lime: 'bg-lime-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
}

const sistemaColor: Record<string, string> = {
  respiratorio: 'bg-blue-50 border-blue-200 text-blue-700',
  coagulacao: 'bg-red-50 border-red-200 text-red-700',
  hepatico: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  cardiovascular: 'bg-pink-50 border-pink-200 text-pink-700',
  neurologico: 'bg-purple-50 border-purple-200 text-purple-700',
  renal: 'bg-indigo-50 border-indigo-200 text-indigo-700',
}

export default function SOFAPage() {
  const router = useRouter()
  const [valores, setValores] = useState<Record<string, number>>({})

  const score = Object.values(valores).reduce((s, v) => s + v, 0)
  const respondidos = Object.keys(valores).length
  const classificacao = getClassificacao(score)
  const mortalidade = getMortalidade(score)

  function setValor(id: string, pts: number) {
    setValores(p => ({ ...p, [id]: pts }))
  }

  const sepse = score >= 2 // Sepsis-3: aumento ≥2 no SOFA indica disfunção orgânica

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Score SOFA</h1>
        <p className="text-sm text-slate-500 mt-1">Sequential Organ Failure Assessment — Avaliação de disfunção orgânica e sepse</p>
      </div>

      {/* Score dinâmico */}
      <div className={`card p-4 mb-5 border-2 transition-all ${colorCard[classificacao.color]}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pontuação total</p>
            <p className="text-3xl font-bold text-slate-900">{score}<span className="text-lg text-slate-400">/24</span></p>
            <p className="text-xs text-slate-400 mt-0.5">{respondidos}/6 sistemas avaliados</p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorBadge[classificacao.color]}`}>
              {classificacao.label}
            </span>
            <p className="text-xs text-slate-500 mt-2">Mortalidade estimada: <strong>{mortalidade.label}</strong></p>
          </div>
        </div>
        <div className="bg-white rounded-full h-2 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${colorBar[classificacao.color]}`}
            style={{ width: `${(score / 24) * 100}%` }} />
        </div>
        {sepse && respondidos >= 2 && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
            ⚠️ Score ≥ 2 — Critério de disfunção orgânica para diagnóstico de SEPSE (Sepsis-3)
          </div>
        )}
      </div>

      {/* Parâmetros */}
      <div className="space-y-4 mb-6">
        {PARAMETROS.map(param => (
          <div key={param.id} className="card p-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold mb-3 ${sistemaColor[param.id]}`}>
              <span>{param.emoji}</span> {param.sistema} — {param.label}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {param.opcoes.map(opt => (
                <button key={opt.pts} type="button"
                  onClick={() => setValor(param.id, opt.pts)}
                  className={`text-center p-2.5 rounded-xl border-2 transition-all ${
                    valores[param.id] === opt.pts
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}>
                  <p className={`text-lg font-bold ${valores[param.id] === opt.pts ? 'text-primary-700' : 'text-slate-400'}`}>{opt.pts}</p>
                  <p className="text-xs font-medium text-slate-700 leading-tight mt-0.5">{opt.label}</p>
                  <p className="text-xs text-slate-400 leading-tight mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Resultado */}
      {respondidos >= 3 && (
        <div className={`card p-6 border-2 ${colorCard[classificacao.color]} animate-fade-in`}>
          <h2 className="text-lg font-bold text-slate-900 mb-1">{classificacao.label} — {score}/24 pontos</h2>
          <p className="text-sm text-slate-600 mb-4">Mortalidade estimada: <strong>{mortalidade.label}</strong></p>

          <div className="bg-white rounded-xl p-4 space-y-4 text-sm">

            <div>
              <p className="font-semibold text-slate-700 mb-2">📊 Referência de mortalidade por pontuação</p>
              <div className="space-y-1 text-xs">
                {[
                  { range: '0–1', mort: '< 10%', c: 'bg-emerald-50 text-emerald-700' },
                  { range: '2–3', mort: '< 10%', c: 'bg-lime-50 text-lime-700' },
                  { range: '4–5', mort: '~20%', c: 'bg-yellow-50 text-yellow-700' },
                  { range: '6–7', mort: '~20–33%', c: 'bg-yellow-50 text-yellow-700' },
                  { range: '8–9', mort: '~40%', c: 'bg-orange-50 text-orange-700' },
                  { range: '10–11', mort: '~50%', c: 'bg-orange-50 text-orange-700' },
                  { range: '≥ 12', mort: '> 95%', c: 'bg-red-50 text-red-700' },
                ].map(row => (
                  <div key={row.range} className={`flex justify-between px-3 py-1.5 rounded-lg font-medium ${row.c}`}>
                    <span>SOFA {row.range}</span>
                    <span>Mortalidade {row.mort}</span>
                  </div>
                ))}
              </div>
            </div>

            {score >= 2 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-700 mb-1">🔴 Critério de Sepse — Sepsis-3</p>
                <p className="text-xs text-red-600 leading-relaxed">
                  Aumento de ≥ 2 pontos no SOFA em paciente com suspeita de infecção = <strong>SEPSE</strong> pelo consenso Sepsis-3 (2016). Se PAM &lt; 65 mmHg + lactato &gt; 2 mmol/L apesar de ressuscitação volêmica adequada = <strong>CHOQUE SÉPTICO</strong>.
                </p>
              </div>
            )}

            <div>
              <p className="font-semibold text-slate-700 mb-1">🏥 Conduta na UTI</p>
              <ul className="text-xs text-slate-600 space-y-1 leading-relaxed">
                {score >= 8
                  ? <>
                      <li>• Avaliar suporte ventilatório invasivo — estratégia protetora (Vt 6 mL/kg, PEEP adequada)</li>
                      <li>• Norepinefrina como vasopressor de primeira linha (PAM alvo ≥ 65 mmHg)</li>
                      <li>• Monitorização hemodinâmica invasiva — considerar cateter de artéria pulmonar</li>
                      <li>• Controle glicêmico rigoroso (alvo 140–180 mg/dL)</li>
                      <li>• Considerar corticoterapia em choque refratário (hidrocortisona 200–300 mg/dia)</li>
                    </>
                  : <>
                      <li>• Monitorização contínua de parâmetros hemodinâmicos e respiratórios</li>
                      <li>• Reavaliar SOFA a cada 24–48h para detectar piora</li>
                      <li>• Tratar causa base — foco infeccioso, hipovolemia, etc.</li>
                      <li>• Suporte orgânico conforme necessidade clínica</li>
                    </>
                }
              </ul>
            </div>

            <div className="border-t pt-3">
              <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                O SOFA (Sequential Organ Failure Assessment), originalmente chamado de Sepsis-related Organ Failure Assessment, foi desenvolvido por Vincent et al. em 1996. Avalia 6 sistemas orgânicos (respiratório, coagulação, hepático, cardiovascular, neurológico e renal), cada um com pontuação de 0 a 4, totalizando máximo de 24 pontos. Pelo consenso Sepsis-3 (2016), um aumento agudo de ≥ 2 pontos no SOFA em paciente com suspeita de infecção define sepse. É amplamente utilizado em UTIs para prognóstico e monitorização da evolução clínica.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
