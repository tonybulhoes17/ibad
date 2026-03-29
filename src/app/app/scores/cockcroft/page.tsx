'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

function calcularClCr(idade: number, peso: number, creatinina: number, sexo: 'M' | 'F'): number {
  if (!idade || !peso || !creatinina) return 0
  const base = ((140 - idade) * peso) / (72 * creatinina)
  return sexo === 'F' ? base * 0.85 : base
}

function getClassificacao(clcr: number) {
  if (clcr === 0) return null
  if (clcr >= 90) return { label: 'Função renal normal', estadio: 'G1', color: 'emerald', desc: 'TFG ≥ 90 mL/min/1,73m²' }
  if (clcr >= 60) return { label: 'Redução leve', estadio: 'G2', color: 'lime', desc: 'TFG 60–89 mL/min/1,73m²' }
  if (clcr >= 45) return { label: 'Redução leve a moderada', estadio: 'G3a', color: 'yellow', desc: 'TFG 45–59 mL/min/1,73m²' }
  if (clcr >= 30) return { label: 'Redução moderada a grave', estadio: 'G3b', color: 'orange', desc: 'TFG 30–44 mL/min/1,73m²' }
  if (clcr >= 15) return { label: 'Redução grave', estadio: 'G4', color: 'red', desc: 'TFG 15–29 mL/min/1,73m²' }
  return { label: 'Insuficiência renal terminal', estadio: 'G5', color: 'red', desc: 'TFG < 15 mL/min/1,73m² — Diálise' }
}

function getAjusteMedicamentos(clcr: number) {
  if (clcr >= 60) return { nivel: 'Ajuste geralmente desnecessário', color: 'emerald' }
  if (clcr >= 30) return { nivel: 'Ajuste de dose necessário para vários fármacos', color: 'yellow' }
  return { nivel: 'Ajuste rigoroso — evitar nefrotóxicos — avaliar diálise', color: 'red' }
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

export default function CockcroftGaultPage() {
  const router = useRouter()
  const [idade, setIdade] = useState('')
  const [peso, setPeso] = useState('')
  const [creatinina, setCreatinina] = useState('')
  const [sexo, setSexo] = useState<'M' | 'F'>('M')

  const clcr = calcularClCr(
    parseFloat(idade),
    parseFloat(peso),
    parseFloat(creatinina),
    sexo
  )

  const classificacao = getClassificacao(clcr)
  const ajuste = clcr > 0 ? getAjusteMedicamentos(clcr) : null
  const pronto = !!parseFloat(idade) && !!parseFloat(peso) && !!parseFloat(creatinina)

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Cockcroft-Gault</h1>
        <p className="text-sm text-slate-500 mt-1">Estimativa do Clearance de Creatinina (ClCr) e estadiamento da função renal</p>
      </div>

      {/* Fórmula */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Fórmula</p>
        <p className="text-sm font-mono text-slate-700">
          ClCr = [(140 − idade) × peso] ÷ (72 × creatinina)
        </p>
        <p className="text-xs text-slate-400 mt-1">× 0,85 para mulheres &nbsp;|&nbsp; resultado em mL/min</p>
      </div>

      {/* Inputs */}
      <div className="card p-5 mb-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">Dados do paciente</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Sexo</label>
            <div className="flex gap-2">
              {[{ v: 'M', l: 'Masculino' }, { v: 'F', l: 'Feminino' }].map(opt => (
                <button key={opt.v} type="button"
                  onClick={() => setSexo(opt.v as 'M' | 'F')}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                    sexo === opt.v ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-600 border-slate-200'
                  }`}>{opt.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Idade (anos)</label>
            <input type="number" className="form-input" placeholder="Ex: 65" min="1" max="120"
              value={idade} onChange={e => setIdade(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Peso (kg)</label>
            <input type="number" className="form-input" placeholder="Ex: 70" min="1" step="0.1"
              value={peso} onChange={e => setPeso(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Creatinina sérica (mg/dL)</label>
            <input type="number" className="form-input font-mono" placeholder="Ex: 1,2" min="0.1" step="0.01"
              value={creatinina} onChange={e => setCreatinina(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Resultado */}
      {pronto && classificacao && (
        <div className={`card p-6 border-2 ${colorCard[classificacao.color]} animate-fade-in`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Clearance de Creatinina estimado</p>
              <p className="text-4xl font-bold text-slate-900 font-mono">
                {clcr.toFixed(1)} <span className="text-lg font-normal text-slate-500">mL/min</span>
              </p>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorBadge[classificacao.color]}`}>
                {classificacao.estadio}
              </span>
              <p className="text-xs text-slate-500 mt-1">{classificacao.desc}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 space-y-4 text-sm">
            <div>
              <p className="font-semibold text-slate-700 mb-1">🩺 Classificação</p>
              <p className="text-slate-600">{classificacao.label}</p>
            </div>

            {ajuste && (
              <div>
                <p className="font-semibold text-slate-700 mb-1">💊 Ajuste de medicamentos</p>
                <p className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                  ajuste.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                  ajuste.color === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>{ajuste.nivel}</p>
              </div>
            )}

            <div>
              <p className="font-semibold text-slate-700 mb-2">📊 Estadiamento da DRC (KDIGO)</p>
              <div className="space-y-1 text-xs">
                {[
                  { est: 'G1', range: '≥ 90', label: 'Normal', c: 'bg-emerald-50 text-emerald-700' },
                  { est: 'G2', range: '60–89', label: 'Redução leve', c: 'bg-lime-50 text-lime-700' },
                  { est: 'G3a', range: '45–59', label: 'Leve a moderada', c: 'bg-yellow-50 text-yellow-700' },
                  { est: 'G3b', range: '30–44', label: 'Moderada a grave', c: 'bg-orange-50 text-orange-700' },
                  { est: 'G4', range: '15–29', label: 'Grave', c: 'bg-red-50 text-red-700' },
                  { est: 'G5', range: '< 15', label: 'Insuficiência terminal', c: 'bg-red-100 text-red-900' },
                ].map(row => (
                  <div key={row.est} className={`flex justify-between px-3 py-1.5 rounded-lg font-medium ${row.c} ${row.est === classificacao.estadio ? 'ring-1 ring-current' : ''}`}>
                    <span>{row.est} — {row.range} mL/min</span>
                    <span>{row.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-2">💊 Fármacos de atenção perioperatória</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { f: 'AINEs', r: 'Evitar se ClCr < 30' },
                  { f: 'Metformina', r: 'Suspender se ClCr < 30' },
                  { f: 'IECA/BRA', r: 'Cuidado se ClCr < 30' },
                  { f: 'Aminoglicosídeos', r: 'Ajuste rigoroso' },
                  { f: 'Contraste iodado', r: 'Hidratação se < 60' },
                  { f: 'Heparina BPM', r: 'Ajuste se < 30' },
                  { f: 'Digoxina', r: 'Ajuste se < 50' },
                  { f: 'Vancomicina', r: 'Monitorar nível sérico' },
                ].map(m => (
                  <div key={m.f} className="bg-slate-50 px-2 py-1.5 rounded text-slate-600">
                    <span className="font-semibold">{m.f}:</span> {m.r}
                  </div>
                ))}
              </div>
            </div>

            {clcr < 30 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-700 mb-1">⚠️ Insuficiência Renal Grave</p>
                <p className="text-xs text-red-600 leading-relaxed">
                  ClCr &lt; 30 mL/min requer atenção especial no perioperatório. Evitar nefrotóxicos, AINEs e contraste sem hidratação adequada. Avaliar necessidade de diálise no pós-operatório. Ajustar antibióticos, anticoagulantes e analgésicos. Consultar nefrologista se possível.
                </p>
              </div>
            )}

            <div className="border-t pt-3">
              <p className="font-semibold text-slate-700 mb-1">📚 Sobre a Fórmula</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                A equação de Cockcroft-Gault foi publicada em 1976 por Donald Cockcroft e Henry Gault. Estima o clearance de creatinina usando idade, peso corporal, creatinina sérica e sexo. É amplamente utilizada para ajuste de doses de medicamentos em insuficiência renal. Limitações: superestima a TFG em obesos (usar peso ideal) e em edemaciados; subestima em pacientes muito musculosos. Para estadiamento formal da DRC, a equação CKD-EPI é preferida; para ajuste de medicamentos, a Cockcroft-Gault permanece como referência pela maioria das bulas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
