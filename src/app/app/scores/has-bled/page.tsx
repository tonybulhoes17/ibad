'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const FATORES = [
  {
    id: 'hipertensao',
    letra: 'H',
    titulo: 'Hypertension — Hipertensão não controlada',
    pergunta: 'PAS > 160 mmHg',
    desc: 'Hipertensão sistólica não controlada (pressão sistólica > 160 mmHg)',
    pontos: 1,
  },
  {
    id: 'renal',
    letra: 'A',
    titulo: 'Abnormal renal/liver — Disfunção renal',
    pergunta: 'Insuficiência renal grave (creatinina > 2,26 mg/dL ou diálise)',
    desc: 'Creatinina > 2,26 mg/dL, diálise ou transplante renal',
    pontos: 1,
  },
  {
    id: 'hepatico',
    letra: 'A',
    titulo: 'Abnormal renal/liver — Disfunção hepática',
    pergunta: 'Cirrose ou bilirrubina > 2× normal + AST/ALT/FA > 3× normal',
    desc: 'Cirrose hepática ou bilirrubina > 2× limite superior + elevação de transaminases',
    pontos: 1,
  },
  {
    id: 'avc',
    letra: 'S',
    titulo: 'Stroke — AVC prévio',
    pergunta: 'História de AVC isquêmico ou hemorrágico',
    desc: 'Qualquer acidente vascular cerebral prévio',
    pontos: 1,
  },
  {
    id: 'sangramento',
    letra: 'B',
    titulo: 'Bleeding — Sangramento prévio',
    pergunta: 'Histórico de sangramento maior ou predisposição ao sangramento',
    desc: 'Sangramento gastrointestinal, anemia, trombocitopenia, coagulopatia, uso de AINEs',
    pontos: 1,
  },
  {
    id: 'inr',
    letra: 'L',
    titulo: 'Labile INR — INR lábil',
    pergunta: 'INR instável ou tempo na faixa terapêutica < 60% (se em uso de warfarina)',
    desc: 'Somente aplicável a pacientes em uso de anticoagulante oral warfarina',
    pontos: 1,
  },
  {
    id: 'idade',
    letra: 'E',
    titulo: 'Elderly — Idade avançada',
    pergunta: 'Idade > 65 anos',
    desc: '',
    pontos: 1,
  },
  {
    id: 'drogas',
    letra: 'D',
    titulo: 'Drugs — Uso de drogas/álcool',
    pergunta: 'Uso concomitante de antiagregantes, AINEs ou abuso de álcool',
    desc: 'Aspirina, clopidogrel, AINEs ou consumo de ≥ 8 doses/semana de álcool',
    pontos: 1,
  },
]

function getRisco(score: number) {
  if (score <= 1) return {
    label: 'Baixo risco de sangramento',
    color: 'emerald',
    taxa: '1,0–1,9% ao ano',
    conduta: 'Anticoagulação geralmente indicada se benefício (CHA₂DS₂-VASc ≥ 2). Risco de sangramento aceitável.',
  }
  if (score === 2) return {
    label: 'Risco moderado',
    color: 'yellow',
    taxa: '~2,6–3,2% ao ano',
    conduta: 'Avaliar relação risco/benefício da anticoagulação. Corrigir fatores modificáveis (PA, INR, medicamentos).',
  }
  return {
    label: 'Alto risco de sangramento',
    color: 'red',
    taxa: score === 3 ? '~3,7% ao ano' : score === 4 ? '~8,7% ao ano' : '> 12% ao ano',
    conduta: 'Score ≥ 3 NÃO contraindica anticoagulação, mas exige atenção. Corrigir TODOS os fatores modificáveis. Monitorização frequente. Discutir caso com equipe.',
  }
}

const colorCard: Record<string, string> = {
  emerald: 'border-emerald-400 bg-emerald-50',
  yellow: 'border-yellow-400 bg-yellow-50',
  red: 'border-red-400 bg-red-50',
}

const colorBadge: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
}

const colorBar: Record<string, string> = {
  emerald: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

export default function HASBLEDPage() {
  const router = useRouter()
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})

  const score = Object.values(selecionados).filter(Boolean).length
  const risco = getRisco(score)
  const totalSelecionados = Object.keys(selecionados).filter(k => selecionados[k]).length

  // Fatores modificáveis selecionados
  const modificaveisAtivos = ['hipertensao', 'inr', 'drogas'].filter(k => selecionados[k])

  function toggle(id: string) {
    setSelecionados(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">HAS-BLED</h1>
        <p className="text-sm text-slate-500 mt-1">Risco de sangramento maior em pacientes anticoagulados com fibrilação atrial</p>
      </div>

      {/* Alerta importante */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Importante</p>
        <p className="text-xs text-amber-600 leading-relaxed">
          Score ≥ 3 <strong>não contraindica</strong> a anticoagulação. Serve para identificar fatores modificáveis e orientar monitorização mais rigorosa. A decisão deve sempre considerar o escore de risco tromboembólico (CHA₂DS₂-VASc).
        </p>
      </div>

      {/* Score dinâmico */}
      <div className={`card p-4 mb-5 border-2 transition-all ${colorCard[risco.color]}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pontuação</p>
            <p className="text-3xl font-bold text-slate-900">{score}<span className="text-lg text-slate-400">/8</span></p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorBadge[risco.color]}`}>
              {risco.label}
            </span>
            <p className="text-xs text-slate-500 mt-1">Taxa de sangramento: <strong>{risco.taxa}</strong></p>
          </div>
        </div>
        <div className="bg-white rounded-full h-2 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${colorBar[risco.color]}`}
            style={{ width: `${(score / 8) * 100}%` }} />
        </div>
      </div>

      {/* Fatores */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-slate-700">Marque os fatores presentes (1 ponto cada):</p>
        {FATORES.map(f => (
          <button key={f.id} type="button" onClick={() => toggle(f.id)}
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
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${selecionados[f.id] ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>{f.letra}</span>
                <p className="font-semibold text-slate-900 text-sm">{f.pergunta}</p>
              </div>
              <p className="text-xs text-slate-500">{f.desc}</p>
              {['hipertensao', 'inr', 'drogas'].includes(f.id) && (
                <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Fator modificável</span>
              )}
            </div>
            <span className={`text-xs font-bold flex-shrink-0 mt-0.5 ${selecionados[f.id] ? 'text-primary-700' : 'text-slate-300'}`}>+1</span>
          </button>
        ))}
      </div>

      {/* Resultado */}
      <div className={`card p-6 border-2 ${colorCard[risco.color]} animate-fade-in`}>
        <h2 className="text-lg font-bold text-slate-900 mb-1">{risco.label} — {score}/8 pontos</h2>
        <p className="text-sm text-slate-600 mb-4">Taxa anual de sangramento maior: <strong>{risco.taxa}</strong></p>

        <div className="bg-white rounded-xl p-4 space-y-4 text-sm">
          <div>
            <p className="font-semibold text-slate-700 mb-1">🩺 Conduta</p>
            <p className="text-slate-600 text-xs leading-relaxed">{risco.conduta}</p>
          </div>

          {modificaveisAtivos.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="font-semibold text-blue-700 mb-1">🔧 Fatores modificáveis presentes</p>
              <ul className="text-xs text-blue-600 space-y-0.5">
                {modificaveisAtivos.includes('hipertensao') && <li>• Controlar PA — alvo &lt; 140/90 mmHg</li>}
                {modificaveisAtivos.includes('inr') && <li>• Otimizar INR — manter TTR &gt; 65% ou trocar para DOAC</li>}
                {modificaveisAtivos.includes('drogas') && <li>• Revisar medicamentos — reduzir/suspender antiagregantes e AINEs se possível</li>}
              </ul>
            </div>
          )}

          <div>
            <p className="font-semibold text-slate-700 mb-2">📊 Referência de risco por pontuação</p>
            <div className="space-y-1 text-xs">
              {[
                { pts: '0', taxa: '1,0%/ano', label: 'Baixo risco', c: 'bg-emerald-50 text-emerald-700' },
                { pts: '1', taxa: '1,9%/ano', label: 'Baixo risco', c: 'bg-emerald-50 text-emerald-700' },
                { pts: '2', taxa: '3,2%/ano', label: 'Moderado', c: 'bg-yellow-50 text-yellow-700' },
                { pts: '3', taxa: '3,7%/ano', label: 'Alto risco', c: 'bg-red-50 text-red-700' },
                { pts: '4', taxa: '8,7%/ano', label: 'Alto risco', c: 'bg-red-50 text-red-700' },
                { pts: '≥5', taxa: '> 12%/ano', label: 'Muito alto risco', c: 'bg-red-100 text-red-800' },
              ].map(row => (
                <div key={row.pts} className={`flex justify-between px-3 py-1.5 rounded-lg font-medium ${row.c} ${row.pts === String(score) || (row.pts === '≥5' && score >= 5) ? 'ring-1 ring-current' : ''}`}>
                  <span>{row.pts} ponto{row.pts !== '1' ? 's' : ''} — {row.label}</span>
                  <span>{row.taxa}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              O HAS-BLED foi desenvolvido por Pisters et al. (2010) a partir do registro Euro Heart Survey em pacientes com fibrilação atrial. Pontuação máxima de 9 (rins + fígado = 2 pontos separados). É recomendado pelas diretrizes da ESC para FA. Score ≥ 3 não contraindica anticoagulação, mas indica necessidade de revisão dos fatores de risco, monitorização mais frequente e considerar NOACs no lugar de varfarinas quando TTR baixo. Não validado em outras indicações de anticoagulação além da FA.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
