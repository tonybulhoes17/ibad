'use client'

import Link from 'next/link'
import { Activity, ChevronRight } from 'lucide-react'

const SCORES = [
  {
    category: '⚡ Emergência',
    color: 'red',
    items: [
      { href: '/app/scores/vad', name: 'Algoritmo VAD', desc: 'Via aérea difícil — DAS 2015 e ASA 2022 interativos' },
    ],
  },
  {
    category: '🟢 Essenciais',
    color: 'emerald',
    items: [
      { href: '/app/scores/asa', name: 'ASA', desc: 'Classificação do estado físico do paciente' },
      { href: '/app/scores/mallampati', name: 'Mallampati', desc: 'Predição de via aérea difícil' },
      { href: '/app/scores/apfel', name: 'Apfel (NVPO)', desc: 'Risco de náuseas e vômitos pós-operatórios' },
      { href: '/app/scores/stop-bang', name: 'STOP-BANG', desc: 'Rastreio de apneia obstrutiva do sono' },
      { href: '/app/scores/rcri', name: 'RCRI', desc: 'Risco cardíaco perioperatório revisado' },
      { href: '/app/scores/caprini', name: 'Caprini (TEV)', desc: 'Risco de tromboembolismo venoso' },
      { href: '/app/scores/lemon', name: 'LEMON', desc: 'Avaliação de via aérea difícil', disabled: true },
    ],
  },
  {
    category: '🟡 Intermediários',
    color: 'amber',
    items: [
      { href: '/app/scores/ariscat', name: 'ARISCAT', desc: 'Risco de complicações pulmonares', disabled: true },
      { href: '/app/scores/cha2ds2vasc', name: 'CHA₂DS₂-VASc', desc: 'Risco de AVC em FA', disabled: true },
      { href: '/app/scores/has-bled', name: 'HAS-BLED', desc: 'Risco de sangramento em anticoagulação' },
      { href: '/app/scores/frailty', name: 'Clinical Frailty Scale', desc: 'Avaliação de fragilidade clínica', disabled: true },
      { href: '/app/scores/cockcroft', name: 'Cockcroft-Gault', desc: 'Estimativa da função renal (ClCr)'},
    ],
  },
  {
    category: '🔵 Avançados',
    color: 'blue',
    items: [
      { href: '/app/scores/sofa', name: 'SOFA', desc: 'Avaliação de disfunção orgânica' },
      { href: '/app/scores/qsofa', name: 'qSOFA', desc: 'Triagem rápida de sepse' },
      { href: '/app/scores/apache2', name: 'APACHE II', desc: 'Prognóstico em UTI', disabled: true },
      { href: '/app/scores/possum', name: 'POSSUM', desc: 'Risco cirúrgico e mortalidade', disabled: true },
    ],
  },
  {
    category: '🧠 Extras',
    color: 'purple',
    items: [
      { href: '/app/scores/minicog', name: 'Mini-Cog', desc: 'Rastreio cognitivo rápido', disabled: true },
      { href: '/app/scores/vas', name: 'VAS / NRS', desc: 'Escala visual analógica de dor', disabled: true },
      { href: '/app/scores/dor-cronica', name: 'Dor Crônica Pós-op', desc: 'Índice de risco de dor crônica', disabled: true },
    ],
  },
]

const borderColors: Record<string, string> = {
  emerald: 'border-emerald-200 hover:border-emerald-400',
  amber: 'border-amber-200 hover:border-amber-400',
  blue: 'border-blue-200 hover:border-blue-400',
  purple: 'border-purple-200 hover:border-purple-400',
}

const badgeColors: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  purple: 'bg-purple-50 text-purple-700',
}

export default function ScoresPage() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" /> Scores de Risco
        </h1>
        <p className="text-sm text-slate-500 mt-1">Calculadoras clínicas para avaliação perioperatória</p>
      </div>

      <div className="space-y-6">
        {SCORES.map(group => (
          <div key={group.category}>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">{group.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.items.map(score => (
                score.disabled ? (
                  <div key={score.name}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl opacity-40 cursor-not-allowed">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{score.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{score.desc}</p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full flex-shrink-0 ml-3">Em breve</span>
                  </div>
                ) : (
                  <Link key={score.name} href={score.href}
                    className={`flex items-center justify-between p-4 bg-white border-2 rounded-xl transition-all hover:shadow-sm ${borderColors[group.color]}`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{score.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{score.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColors[group.color]}`}>
                        Calcular
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
