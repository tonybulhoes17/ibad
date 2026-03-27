'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const PERGUNTAS = [
  {
    id: 'S',
    letra: 'S',
    titulo: 'Snoring — Ronco',
    pergunta: 'Você ronca alto?',
    desc: 'Tão alto que pode ser ouvido através de portas fechadas, ou seu parceiro cutuca você por causa do ronco?',
  },
  {
    id: 'T',
    letra: 'T',
    titulo: 'Tired — Cansaço',
    pergunta: 'Você se sente frequentemente cansado, fatigado ou sonolento durante o dia?',
    desc: 'Como adormecer no volante?',
  },
  {
    id: 'O',
    letra: 'O',
    titulo: 'Observed — Apneia observada',
    pergunta: 'Alguém já observou você parar de respirar durante o sono?',
    desc: 'Paradas respiratórias ou engasgos noturnos relatados por outra pessoa.',
  },
  {
    id: 'P',
    letra: 'P',
    titulo: 'Pressure — Pressão arterial',
    pergunta: 'Você tem ou está sendo tratado para hipertensão arterial?',
    desc: 'Hipertensão diagnosticada ou em uso de anti-hipertensivos.',
  },
  {
    id: 'B',
    letra: 'B',
    titulo: 'BMI — Índice de Massa Corporal',
    pergunta: 'IMC maior que 35 kg/m²?',
    desc: 'Obesidade grau II ou maior.',
  },
  {
    id: 'A',
    letra: 'A',
    titulo: 'Age — Idade',
    pergunta: 'Idade maior que 50 anos?',
    desc: '',
  },
  {
    id: 'N',
    letra: 'N',
    titulo: 'Neck — Circunferência do pescoço',
    pergunta: 'Circunferência do pescoço maior que 40 cm?',
    desc: 'Medida no nível da cartilagem cricóidea.',
  },
  {
    id: 'G',
    letra: 'G',
    titulo: 'Gender — Sexo masculino',
    pergunta: 'Paciente do sexo masculino?',
    desc: '',
  },
]

function getRisco(score: number) {
  if (score <= 2) return {
    label: 'Baixo Risco',
    color: 'emerald',
    pct: '~12%',
    desc: 'Baixa probabilidade de apneia obstrutiva do sono moderada a grave.',
    conduta: 'Não há necessidade de investigação adicional rotineira. Manejo anestésico padrão com atenção habitual à via aérea.',
  }
  if (score <= 4) return {
    label: 'Risco Intermediário',
    color: 'yellow',
    pct: '~30%',
    desc: 'Risco moderado de SAOS — considerar investigação.',
    conduta: 'Considerar polissonografia pré-operatória em cirurgias eletivas. Planejar monitorização pós-operatória. Preferir analgesia multimodal para reduzir uso de opioides. Atenção redobrada na extubação.',
  }
  return {
    label: 'Alto Risco',
    color: 'red',
    pct: '~60–80%',
    desc: 'Alta probabilidade de SAOS moderada a grave.',
    conduta: 'Investigar SAOS antes de cirurgias eletivas de médio/grande porte. Se CPAP em uso, trazer equipamento para o perioperatório. Evitar sedativos e opioides no pré-operatório. Preferir anestesia regional/local quando possível. Monitorização contínua de oximetria no pós-operatório. Planejar UTI/semi-intensivo conforme porte cirúrgico.',
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

const letraColor: Record<string, string> = {
  emerald: 'bg-emerald-600',
  yellow: 'bg-yellow-500',
  red: 'bg-red-600',
}

export default function StopBangPage() {
  const router = useRouter()
  const [respostas, setRespostas] = useState<Record<string, boolean>>({})

  const score = Object.values(respostas).filter(Boolean).length
  const respondidas = Object.keys(respostas).length
  const risco = getRisco(score)

  function toggle(id: string, valor: boolean) {
    setRespostas(p => ({ ...p, [id]: valor }))
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">STOP-BANG</h1>
        <p className="text-sm text-slate-500 mt-1">Rastreio de Síndrome da Apneia Obstrutiva do Sono (SAOS)</p>
      </div>

      {/* Score dinâmico */}
      <div className={`card p-4 mb-5 border-2 transition-all ${colorCard[risco.color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pontuação</p>
            <p className="text-3xl font-bold text-slate-900">{score}<span className="text-lg text-slate-400">/8</span></p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorBadge[risco.color]}`}>
              {risco.label}
            </span>
            <p className="text-xs text-slate-500 mt-1">{respondidas}/8 respondidas</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              risco.color === 'emerald' ? 'bg-emerald-500' : risco.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(score / 8) * 100}%` }}
          />
        </div>
      </div>

      {/* Perguntas */}
      <div className="space-y-3 mb-6">
        {PERGUNTAS.map(p => (
          <div key={p.id} className={`card p-4 border-2 transition-all ${
            respostas[p.id] !== undefined
              ? respostas[p.id] ? 'border-primary-300 bg-primary-50' : 'border-slate-200'
              : 'border-slate-200'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm ${
                respostas[p.id] ? letraColor[risco.color] : 'bg-slate-300'
              }`}>
                {p.letra}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 mb-0.5">{p.titulo}</p>
                <p className="text-sm font-medium text-slate-900">{p.pergunta}</p>
                {p.desc && <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => toggle(p.id, true)}
                className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                  respostas[p.id] === true
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                }`}>
                Sim
              </button>
              <button type="button"
                onClick={() => toggle(p.id, false)}
                className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors ${
                  respostas[p.id] === false
                    ? 'bg-slate-600 text-white border-slate-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}>
                Não
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resultado detalhado */}
      {respondidas >= 4 && (
        <div className={`card p-6 border-2 ${colorCard[risco.color]} animate-fade-in`}>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {risco.label} — {score}/8 pontos
          </h2>
          <p className="text-sm text-slate-600 mb-4">Probabilidade estimada de SAOS moderada a grave: {risco.pct}</p>

          <div className="bg-white rounded-xl p-4 space-y-4 text-sm">
            <div>
              <p className="font-semibold text-slate-700 mb-1">📋 Interpretação</p>
              <p className="text-slate-600">{risco.desc}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">🏥 Conduta perioperatória sugerida</p>
              <p className="text-slate-600 text-xs leading-relaxed">{risco.conduta}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-2">📊 Referência de risco</p>
              <div className="space-y-1 text-xs">
                {[
                  { range: '0–2', label: 'Baixo risco', pct: '~12%', c: 'bg-emerald-50 text-emerald-700' },
                  { range: '3–4', label: 'Risco intermediário', pct: '~30%', c: 'bg-yellow-50 text-yellow-700' },
                  { range: '5–8', label: 'Alto risco', pct: '~60–80%', c: 'bg-red-50 text-red-700' },
                ].map(row => (
                  <div key={row.range} className={`flex justify-between px-3 py-1.5 rounded-lg font-medium ${row.c}`}>
                    <span>{row.range} pontos — {row.label}</span>
                    <span>{row.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {score >= 5 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-700 mb-1">🚨 Alto risco — atenção especial</p>
                <p className="text-red-600 text-xs leading-relaxed">
                  Pacientes com STOP-BANG ≥5 têm risco significativamente aumentado de complicações respiratórias pós-operatórias, incluindo hipóxia, reintubação e necessidade de UTI. A sensibilidade para SAOS grave é superior a 90% neste grupo.
                </p>
              </div>
            )}

            <div className="border-t pt-3">
              <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                O questionário STOP-BANG foi desenvolvido por Chung et al. (2008) como ferramenta de rastreio pré-operatório para SAOS. É validado em populações cirúrgicas com sensibilidade de 93% e especificidade de 43% para SAOS moderada a grave (AHI ≥15). É recomendado pela Sociedade Americana de Anestesiologia (ASA) e pela SASA para triagem pré-operatória rotineira. Não substitui a polissonografia para diagnóstico definitivo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
