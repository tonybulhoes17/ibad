'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const CLASSES = [
  {
    value: 'I',
    label: 'Classe I',
    desc: 'Palato mole, úvula, fauces e pilares amigdalianos visíveis',
    vad: false,
    color: 'emerald',
    risco: 'Baixo risco de via aérea difícil',
    intubacao: 'Intubação geralmente fácil (Cormack-Lehane I)',
  },
  {
    value: 'II',
    label: 'Classe II',
    desc: 'Palato mole, úvula e fauces visíveis — pilares não visíveis',
    vad: false,
    color: 'lime',
    risco: 'Risco leve-moderado',
    intubacao: 'Intubação habitualmente sem dificuldade (Cormack-Lehane I-II)',
  },
  {
    value: 'III',
    label: 'Classe III',
    desc: 'Palato mole e base da úvula visíveis — fauces não visíveis',
    vad: true,
    color: 'orange',
    risco: 'Risco aumentado de via aérea difícil',
    intubacao: 'Intubação pode ser difícil (Cormack-Lehane II-III) — prepare equipamentos',
  },
  {
    value: 'IV',
    label: 'Classe IV',
    desc: 'Apenas palato duro visível — palato mole não visível',
    vad: true,
    color: 'red',
    risco: 'Alto risco de via aérea difícil',
    intubacao: 'Intubação frequentemente difícil (Cormack-Lehane III-IV) — planeje via aérea difícil',
  },
]

const colorBorder: Record<string, string> = {
  emerald: 'border-emerald-400 bg-emerald-50',
  lime: 'border-lime-400 bg-lime-50',
  orange: 'border-orange-400 bg-orange-50',
  red: 'border-red-400 bg-red-50',
}

export default function MallampatiPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [aberturaBoca, setAberturaBoca] = useState<string>('')
  const [distanciaTE, setDistanciaTE] = useState<string>('')
  const [extensaoCervical, setExtensaoCervical] = useState<string>('')

  const option = CLASSES.find(c => c.value === selected)

  // Fatores adicionais de risco
  const bocaRestrita = aberturaBoca === 'restrita'
  const teRestrita = distanciaTE === 'restrita'
  const cervicalRestrita = extensaoCervical === 'restrita'
  const fatoresAdicionais = [bocaRestrita, teRestrita, cervicalRestrita].filter(Boolean).length
  const riscoAumentado = option?.vad || fatoresAdicionais >= 2

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Mallampati</h1>
        <p className="text-sm text-slate-500 mt-1">Classificação de via aérea — predição de intubação difícil</p>
      </div>

      {/* Instrução */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm text-blue-700">
        <p className="font-semibold mb-1">Como realizar:</p>
        <p>Paciente sentado, boca aberta ao máximo, língua protruída ao máximo, <strong>sem fonação</strong>. Avaliar a visibilidade das estruturas faríngeas.</p>
      </div>

      {/* Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {CLASSES.map(c => (
          <button key={c.value} type="button"
            onClick={() => setSelected(c.value)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              selected === c.value
                ? `ring-2 ring-offset-1 ${colorBorder[c.color]}`
                : 'border-slate-200 bg-white hover:border-slate-400'
            }`}>
            <p className="font-bold text-slate-900 mb-1">{c.label}</p>
            <p className="text-xs text-slate-600">{c.desc}</p>
            {c.vad && (
              <span className="inline-block mt-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                ⚠ Risco VAD
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Fatores adicionais */}
      <div className="card p-4 mb-5">
        <p className="text-sm font-semibold text-slate-800 mb-3">Fatores adicionais de risco</p>
        <div className="space-y-3">
          <div>
            <label className="form-label">Abertura de boca</label>
            <div className="flex gap-2">
              {[{ v: 'normal', l: 'Normal (>3 cm)' }, { v: 'restrita', l: 'Restrita (≤3 cm)' }].map(opt => (
                <button key={opt.v} type="button"
                  onClick={() => setAberturaBoca(opt.v)}
                  className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${
                    aberturaBoca === opt.v
                      ? opt.v === 'restrita' ? 'bg-red-600 text-white border-red-600' : 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>{opt.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Distância tireomentoniana</label>
            <div className="flex gap-2">
              {[{ v: 'normal', l: 'Normal (≥6 cm)' }, { v: 'restrita', l: 'Curta (<6 cm)' }].map(opt => (
                <button key={opt.v} type="button"
                  onClick={() => setDistanciaTE(opt.v)}
                  className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${
                    distanciaTE === opt.v
                      ? opt.v === 'restrita' ? 'bg-red-600 text-white border-red-600' : 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>{opt.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Extensão cervical</label>
            <div className="flex gap-2">
              {[{ v: 'normal', l: 'Normal (>80°)' }, { v: 'restrita', l: 'Limitada (≤80°)' }].map(opt => (
                <button key={opt.v} type="button"
                  onClick={() => setExtensaoCervical(opt.v)}
                  className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${
                    extensaoCervical === opt.v
                      ? opt.v === 'restrita' ? 'bg-red-600 text-white border-red-600' : 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>{opt.l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {selected && option && (
        <div className={`card p-6 border-2 ${colorBorder[option.color]} animate-fade-in`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mallampati {option.value}{fatoresAdicionais > 0 ? ` + ${fatoresAdicionais} fator${fatoresAdicionais > 1 ? 'es' : ''} adicional${fatoresAdicionais > 1 ? 'is' : ''}` : ''}</h2>
              <p className="text-sm text-slate-600">{option.risco}</p>
            </div>
            {riscoAumentado && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">
                ⚠ VAD Provável
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-700 mb-1">🔍 Correlação com laringoscopia</p>
              <p className="text-slate-600">{option.intubacao}</p>
            </div>
            {fatoresAdicionais >= 2 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-700 mb-1">⚠ Múltiplos fatores de risco presentes</p>
                <p className="text-red-600 text-xs">A presença de 2 ou mais fatores adicionais aumenta significativamente a probabilidade de via aérea difícil, independentemente do Mallampati isolado. Prepare equipamentos para via aérea difícil.</p>
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-700 mb-1">🛡️ Conduta sugerida</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                {option.value === 'I' || option.value === 'II'
                  ? 'Via aérea convencional. Laringoscopia direta habitual. Manter equipamentos de resgate disponíveis conforme protocolo local.'
                  : 'Considerar: videolaringoscopia como primeira escolha, dispositivos supraglóticos como backup, intubação acordada com fibroscópio em casos selecionados. Notificar equipe, checar carrinho de via aérea difícil. Seguir protocolo ASA de via aérea difícil.'}
              </p>
            </div>
            <div className="border-t pt-3">
              <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Descrita por Mallampati et al. em 1985 e modificada por Samsoon e Young em 1987, a classificação avalia a visibilidade das estruturas orofaríngeas para predizer dificuldade de intubação. Sensibilidade ~50%, especificidade ~90% para VAD. Deve ser utilizada em conjunto com outros preditores (LEMON, distância tireomentoniana, abertura de boca e extensão cervical) para avaliação completa da via aérea.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
