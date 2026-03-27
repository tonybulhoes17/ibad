'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const FATORES = [
  { id: 'sexo', label: 'Sexo feminino', desc: 'Paciente do sexo feminino', pontos: 1 },
  { id: 'tabagismo', label: 'Não fumante', desc: 'Paciente não fumante (nunca fumou ou ex-fumante)', pontos: 1 },
  { id: 'nvpo', label: 'História de NVPO ou cinetose', desc: 'NVPO em anestesias anteriores ou cinetose (enjoo de movimento)', pontos: 1 },
  { id: 'opioide', label: 'Uso pós-op de opioides', desc: 'Previsão de uso de opioides no pós-operatório', pontos: 1 },
]

function getRisco(score: number) {
  if (score === 0) return { label: 'Muito Baixo', pct: '10%', color: 'emerald', conduta: 'Profilaxia antiemética não necessária rotineiramente.' }
  if (score === 1) return { label: 'Baixo', pct: '21%', color: 'lime', conduta: 'Considerar 1 agente profilático em pacientes com outros fatores de risco.' }
  if (score === 2) return { label: 'Moderado', pct: '39%', color: 'yellow', conduta: 'Profilaxia com 1–2 agentes (ondansetrona + dexametasona).' }
  if (score === 3) return { label: 'Alto', pct: '61%', color: 'orange', conduta: 'Profilaxia multimodal com 2–3 agentes. Considerar TIVA.' }
  return { label: 'Muito Alto', pct: '79%', color: 'red', conduta: 'Profilaxia máxima: TIVA (propofol), 3+ agentes antieméticos, evitar N₂O e opioides.' }
}

export default function ApfelPage() {
  const router = useRouter()
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})

  const score = FATORES.filter(f => selecionados[f.id]).length
  const risco = getRisco(score)

  const colorCard: Record<string, string> = {
    emerald: 'border-emerald-400 bg-emerald-50',
    lime: 'border-lime-400 bg-lime-50',
    yellow: 'border-yellow-400 bg-yellow-50',
    orange: 'border-orange-400 bg-orange-50',
    red: 'border-red-400 bg-red-50',
  }

  const colorBadge: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    lime: 'bg-lime-100 text-lime-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  }

  function toggle(id: string) {
    setSelecionados(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Score de Apfel</h1>
        <p className="text-sm text-slate-500 mt-1">Risco de Náuseas e Vômitos Pós-Operatórios (NVPO)</p>
      </div>

      {/* Score atual */}
      <div className={`card p-4 mb-5 border-2 transition-all ${colorCard[risco.color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pontuação atual</p>
            <p className="text-3xl font-bold text-slate-900">{score}<span className="text-lg text-slate-400">/4</span></p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorBadge[risco.color]}`}>
              {risco.label}
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{risco.pct}</p>
            <p className="text-xs text-slate-500">risco de NVPO</p>
          </div>
        </div>
      </div>

      {/* Fatores */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-slate-700">Marque os fatores presentes:</p>
        {FATORES.map(f => (
          <button key={f.id} type="button"
            onClick={() => toggle(f.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
              selecionados[f.id]
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                : 'border-slate-200 bg-white hover:border-slate-400'
            }`}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              selecionados[f.id] ? 'bg-primary-700 border-primary-700' : 'border-slate-300'
            }`}>
              {selecionados[f.id] && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">{f.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
            </div>
            <span className="text-xs font-bold text-slate-400 flex-shrink-0">+1 pt</span>
          </button>
        ))}
      </div>

      {/* Resultado detalhado */}
      <div className={`card p-6 border-2 ${colorCard[risco.color]} animate-fade-in`}>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Risco {risco.label} — {risco.pct} de NVPO
        </h2>
        <p className="text-sm text-slate-600 mb-4">Score de Apfel: {score}/4 pontos</p>

        <div className="bg-white rounded-xl p-4 space-y-4 text-sm">
          <div>
            <p className="font-semibold text-slate-700 mb-2">💊 Conduta antiemética sugerida</p>
            <p className="text-slate-600">{risco.conduta}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-2">🏥 Referência de risco por pontuação</p>
            <div className="space-y-1">
              {[
                { s: 0, r: '10%', c: 'bg-emerald-100 text-emerald-700' },
                { s: 1, r: '21%', c: 'bg-lime-100 text-lime-700' },
                { s: 2, r: '39%', c: 'bg-yellow-100 text-yellow-700' },
                { s: 3, r: '61%', c: 'bg-orange-100 text-orange-700' },
                { s: 4, r: '79%', c: 'bg-red-100 text-red-700' },
              ].map(row => (
                <div key={row.s} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium ${row.s === score ? row.c : 'bg-slate-50 text-slate-500'}`}>
                  <span>{row.s} fator{row.s !== 1 ? 'es' : ''}</span>
                  <span>{row.r}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-2">💉 Opções farmacológicas</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'Ondansetrona 4–8mg IV',
                'Dexametasona 4–8mg IV',
                'Droperidol 0,625–1,25mg IV',
                'Metoclopramida 10mg IV',
                'Dimenidrinato 1mg/kg IV',
                'Prometazina 12,5–25mg IV',
                'Aprepitanto 40mg VO',
                'Escopolamina transdérmica',
              ].map(m => (
                <div key={m} className="bg-slate-50 px-2 py-1.5 rounded text-slate-600">• {m}</div>
              ))}
            </div>
          </div>

          {score >= 3 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="font-semibold text-indigo-700 mb-1">🔵 Considerar TIVA</p>
              <p className="text-indigo-600 text-xs">Em pacientes com alto risco (≥3 fatores), a anestesia venosa total (TIVA) com propofol reduz a incidência de NVPO em até 25% comparada aos agentes inalatórios.</p>
            </div>
          )}

          <div className="border-t pt-3">
            <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              O Score de Apfel, publicado em 1999 e validado em múltiplos estudos, é o modelo preditivo de NVPO mais utilizado mundialmente. Cada um dos 4 fatores de risco contribui com 1 ponto. É simples, rápido e com boa acurácia (AUC ~0,65). A sociedade americana de anestesiologia (ASA) e a SAMBA recomendam seu uso rotineiro para guiar a profilaxia antiemética perioperatória.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
