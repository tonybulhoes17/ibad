'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const FATORES = [
  {
    id: 'fr',
    label: 'Frequência respiratória ≥ 22 irpm',
    desc: 'Taquipneia como marcador de comprometimento respiratório',
  },
  {
    id: 'consciencia',
    label: 'Alteração do estado mental',
    desc: 'Glasgow < 15 — qualquer grau de confusão, sonolência ou agitação',
  },
  {
    id: 'pas',
    label: 'Pressão arterial sistólica ≤ 100 mmHg',
    desc: 'Hipotensão como marcador de disfunção circulatória',
  },
]

function getRisco(score: number) {
  if (score === 0) return {
    label: 'Baixo risco',
    color: 'emerald',
    descricao: 'Baixa probabilidade de desfecho adverso por sepse.',
    conduta: 'Monitorizar. Investigar outras causas. Não preenche critério de triagem para sepse pelo qSOFA.',
  }
  if (score === 1) return {
    label: 'Atenção',
    color: 'yellow',
    descricao: 'Risco intermediário. Vigilância aumentada recomendada.',
    conduta: 'Reavaliar frequentemente. Considerar coleta de lactato e hemoculturas. Monitorizar evolução clínica.',
  }
  return {
    label: 'Alto risco de sepse',
    color: 'red',
    descricao: 'Score ≥ 2 identifica pacientes fora da UTI com suspeita de infecção e alto risco de desfecho adverso.',
    conduta: 'Acionar equipe de resposta rápida. Aplicar bundle de sepse: hemoculturas, lactato, antibiótico em até 1h, ressuscitação volêmica. Considerar transferência para UTI. Aplicar score SOFA completo para confirmar disfunção orgânica.',
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

export default function QSOFAPage() {
  const router = useRouter()
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})

  const score = Object.values(selecionados).filter(Boolean).length
  const risco = getRisco(score)

  function toggle(id: string) {
    setSelecionados(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">qSOFA</h1>
        <p className="text-sm text-slate-500 mt-1">Quick SOFA — Triagem rápida de sepse fora da UTI</p>
      </div>

      {/* Score dinâmico */}
      <div className={`card p-4 mb-5 border-2 transition-all ${colorCard[risco.color]}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pontuação</p>
            <p className="text-3xl font-bold text-slate-900">{score}<span className="text-lg text-slate-400">/3</span></p>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorBadge[risco.color]}`}>
            {risco.label}
          </span>
        </div>
        <div className="bg-white rounded-full h-2 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${colorBar[risco.color]}`}
            style={{ width: `${(score / 3) * 100}%` }} />
        </div>
      </div>

      {/* Fatores */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-slate-700">Marque os critérios presentes (1 ponto cada):</p>
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
              <p className="font-semibold text-slate-900 text-sm">{f.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
            </div>
            <span className={`text-xs font-bold flex-shrink-0 mt-0.5 ${selecionados[f.id] ? 'text-primary-700' : 'text-slate-300'}`}>+1</span>
          </button>
        ))}
      </div>

      {/* Resultado */}
      <div className={`card p-6 border-2 ${colorCard[risco.color]} animate-fade-in`}>
        <h2 className="text-lg font-bold text-slate-900 mb-1">{risco.label} — {score}/3 pontos</h2>
        <p className="text-sm text-slate-600 mb-4">{risco.descricao}</p>

        <div className="bg-white rounded-xl p-4 space-y-4 text-sm">
          <div>
            <p className="font-semibold text-slate-700 mb-1">🏥 Conduta recomendada</p>
            <p className="text-slate-600 text-xs leading-relaxed">{risco.conduta}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-2">📊 Referência por pontuação</p>
            <div className="space-y-1 text-xs">
              {[
                { pts: '0', label: 'Baixo risco', c: 'bg-emerald-50 text-emerald-700' },
                { pts: '1', label: 'Atenção — vigilância aumentada', c: 'bg-yellow-50 text-yellow-700' },
                { pts: '≥2', label: 'Alto risco — acionar bundle de sepse', c: 'bg-red-50 text-red-700' },
              ].map(row => (
                <div key={row.pts} className={`flex justify-between px-3 py-1.5 rounded-lg font-medium ${row.c} ${
                  (row.pts === String(score) || (row.pts === '≥2' && score >= 2)) ? 'ring-1 ring-current' : ''
                }`}>
                  <span>{row.pts} ponto{row.pts !== '1' ? 's' : ''}</span>
                  <span>{row.label}</span>
                </div>
              ))}
            </div>
          </div>

          {score >= 2 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="font-semibold text-red-700 mb-1">🚨 Bundle de Sepse — Hora 1</p>
              <ul className="text-xs text-red-600 space-y-0.5 leading-relaxed">
                <li>• Coletar 2 pares de hemoculturas antes do antibiótico</li>
                <li>• Dosar lactato sérico (se &gt; 2 mmol/L → sepse grave)</li>
                <li>• Iniciar antibiótico de amplo espectro em até 1 hora</li>
                <li>• Ressuscitação com cristaloide 30 mL/kg se hipotensão ou lactato &gt; 4</li>
                <li>• Considerar norepinefrina se PAM &lt; 65 mmHg</li>
              </ul>
            </div>
          )}

          <div className="border-t pt-3">
            <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              O qSOFA (quick Sequential Organ Failure Assessment) foi proposto pelo Sepsis-3 Task Force em 2016 como ferramenta de triagem rápida para identificar pacientes fora da UTI com suspeita de infecção e risco aumentado de desfecho adverso. É simples, à beira do leito, sem exames laboratoriais. Score ≥ 2 deve motivar investigação para disfunção orgânica (SOFA) e implementação do bundle de sepse. Sensibilidade ~70%, especificidade ~83% para mortalidade hospitalar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
