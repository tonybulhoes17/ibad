'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

const ASA_OPTIONS = [
  {
    value: 'I',
    label: 'ASA I',
    desc: 'Paciente saudável, sem doença sistêmica',
    examples: 'Paciente hígido, não fumante, sem uso de álcool ou com uso mínimo.',
    color: 'emerald',
    mortalidade: '< 0,1%',
  },
  {
    value: 'II',
    label: 'ASA II',
    desc: 'Doença sistêmica leve, sem limitação funcional',
    examples: 'Fumante, gestante, obesidade (IMC 30–40), DM ou HAS controlados, doença pulmonar leve.',
    color: 'lime',
    mortalidade: '0,2%',
  },
  {
    value: 'III',
    label: 'ASA III',
    desc: 'Doença sistêmica grave com limitação funcional',
    examples: 'DM ou HAS mal controlados, DPOC, obesidade mórbida (IMC ≥40), hepatite ativa, dependência de álcool, marca-passo, IRC em diálise, IAM/AVC/AIT há >3 meses.',
    color: 'yellow',
    mortalidade: '1,8%',
  },
  {
    value: 'IV',
    label: 'ASA IV',
    desc: 'Doença sistêmica grave com risco de vida constante',
    examples: 'IAM/AVC/AIT recente (<3 meses), disfunção cardíaca grave (fração de ejeção <25%), sepse, CID, IRC não dialítica.',
    color: 'orange',
    mortalidade: '7,8%',
  },
  {
    value: 'V',
    label: 'ASA V',
    desc: 'Paciente moribundo sem expectativa de sobrevida sem cirurgia',
    examples: 'Aneurisma roto, trauma maciço, isquemia cerebral com efeito de massa, falência múltipla de órgãos.',
    color: 'red',
    mortalidade: '9,4%',
  },
  {
    value: 'VI',
    label: 'ASA VI',
    desc: 'Morte cerebral — doação de órgãos',
    examples: 'Paciente com morte encefálica confirmada para captação de órgãos.',
    color: 'slate',
    mortalidade: '—',
  },
]

const colorMap: Record<string, string> = {
  emerald: 'border-emerald-400 bg-emerald-50',
  lime: 'border-lime-400 bg-lime-50',
  yellow: 'border-yellow-400 bg-yellow-50',
  orange: 'border-orange-400 bg-orange-50',
  red: 'border-red-400 bg-red-50',
  slate: 'border-slate-400 bg-slate-50',
}

const selectedMap: Record<string, string> = {
  emerald: 'ring-emerald-500 border-emerald-500 bg-emerald-50',
  lime: 'ring-lime-500 border-lime-500 bg-lime-50',
  yellow: 'ring-yellow-500 border-yellow-500 bg-yellow-50',
  orange: 'ring-orange-500 border-orange-500 bg-orange-50',
  red: 'ring-red-500 border-red-500 bg-red-50',
  slate: 'ring-slate-500 border-slate-500 bg-slate-50',
}

export default function ASAPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [urgencia, setUrgencia] = useState(false)

  const option = ASA_OPTIONS.find(o => o.value === selected)

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Classificação ASA</h1>
        <p className="text-sm text-slate-500 mt-1">American Society of Anesthesiologists — Estado físico perioperatório</p>
      </div>

      {/* Urgência */}
      <div className="card p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">Cirurgia de Urgência / Emergência?</p>
          <p className="text-xs text-slate-500">Acrescenta sufixo "E" ao ASA (ex: ASA III-E)</p>
        </div>
        <button onClick={() => setUrgencia(!urgencia)}
          className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            urgencia ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300'
          }`}>
          {urgencia ? '⚠ Urgência' : 'Eletiva'}
        </button>
      </div>

      {/* Opções */}
      <div className="space-y-3 mb-6">
        {ASA_OPTIONS.map(opt => (
          <button key={opt.value} type="button"
            onClick={() => setSelected(opt.value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected === opt.value
                ? `ring-2 ${selectedMap[opt.color]}`
                : `border-slate-200 bg-white hover:${colorMap[opt.color]}`
            }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{opt.label}</span>
                  {selected === opt.value && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                </div>
                <p className="text-sm text-slate-700 mb-1">{opt.desc}</p>
                <p className="text-xs text-slate-400">{opt.examples}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400">Mortalidade</p>
                <p className="text-sm font-bold text-slate-700">{opt.mortalidade}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Resultado */}
      {selected && option && (
        <div className={`card p-6 border-2 ${colorMap[option.color]} animate-fade-in`}>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Resultado: {option.label}{urgencia ? '-E' : ''}
          </h2>
          <p className="text-sm text-slate-700 mb-4">{option.desc}{urgencia ? ' — Urgência/Emergência' : ''}</p>

          <div className="bg-white rounded-xl p-4 space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-700 mb-1">📋 Exemplos clínicos</p>
              <p className="text-slate-600">{option.examples}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">⚠️ Mortalidade perioperatória estimada</p>
              <p className="text-slate-600">{option.mortalidade}</p>
            </div>
            {urgencia && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-700 mb-1">🚨 Cirurgia de Urgência/Emergência</p>
                <p className="text-red-600 text-xs">O sufixo "E" indica que o risco cirúrgico é substancialmente maior do que o mesmo ASA em cirurgia eletiva. A classificação não muda, mas o risco real é multiplicado.</p>
              </div>
            )}
            <div className="border-t pt-3">
              <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score ASA</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                A classificação ASA (American Society of Anesthesiologists) foi criada em 1941 para padronizar a comunicação sobre o estado físico dos pacientes antes de procedimentos anestésicos. É amplamente utilizada em todo o mundo e serve como indicador de risco perioperatório. Não considera o tipo de cirurgia, apenas o estado clínico basal do paciente. A versão atualizada de 2020 incluiu exemplos clínicos específicos para cada categoria para reduzir variabilidade na classificação.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
