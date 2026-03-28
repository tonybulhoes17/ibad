'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const FATORES = [
  {
    grupo: '1 ponto cada',
    pontos: 1,
    color: 'blue',
    itens: [
      { id: 'idade_41_60', label: 'Idade 41–60 anos' },
      { id: 'cirurgia_menor', label: 'Cirurgia de pequeno porte planejada' },
      { id: 'cirurgia_maior_30', label: 'Cirurgia de grande porte nos últimos 30 dias' },
      { id: 'varizes', label: 'Varizes de membros inferiores' },
      { id: 'doenca_inflamatoria', label: 'Doença inflamatória intestinal' },
      { id: 'edema_mmii', label: 'Edema de membros inferiores atual' },
      { id: 'obesidade', label: 'Obesidade (IMC > 25)' },
      { id: 'ima_recente', label: 'Infarto agudo do miocárdio recente' },
      { id: 'icc', label: 'Insuficiência cardíaca congestiva (<1 mês)' },
      { id: 'sepse', label: 'Sepse (<1 mês)' },
      { id: 'pneumonia', label: 'Pneumonia grave (<1 mês)' },
      { id: 'repouso_leito', label: 'Repouso no leito > 72h' },
      { id: 'anticoncepcional', label: 'Anticoncepcional oral ou terapia de reposição hormonal' },
      { id: 'gestante_parto', label: 'Gestação ou pós-parto (<1 mês)' },
      { id: 'aborto', label: 'História de aborto espontâneo inexplicado' },
    ],
  },
  {
    grupo: '2 pontos cada',
    pontos: 2,
    color: 'yellow',
    itens: [
      { id: 'idade_61_74', label: 'Idade 61–74 anos' },
      { id: 'artroscopia', label: 'Artroscopia' },
      { id: 'cirurgia_maior_45', label: 'Cirurgia de grande porte > 45 min' },
      { id: 'laparoscopia_45', label: 'Cirurgia laparoscópica > 45 min' },
      { id: 'neoplasia', label: 'Neoplasia atual ou prévia' },
      { id: 'acamado', label: 'Paciente acamado > 72h no pré-operatório' },
      { id: 'gesso', label: 'Imobilização com gesso (<1 mês)' },
      { id: 'acesso_venoso', label: 'Acesso venoso central' },
    ],
  },
  {
    grupo: '3 pontos cada',
    pontos: 3,
    color: 'orange',
    itens: [
      { id: 'idade_75', label: 'Idade ≥ 75 anos' },
      { id: 'tvp_tep_previo', label: 'TVP ou TEP prévio' },
      { id: 'historia_familiar', label: 'História familiar de TVP/TEP' },
      { id: 'fator_v', label: 'Fator V de Leiden positivo' },
      { id: 'protrombina', label: 'Mutação G20210A da protrombina' },
      { id: 'homocisteina', label: 'Hiperhomocisteinemia' },
      { id: 'anticardiolipina', label: 'Anticorpo anticardiolipina elevado' },
      { id: 'tap_elevado', label: 'Anticoagulante lúpico positivo' },
      { id: 'antitrombina', label: 'Deficiência de antitrombina, proteína C ou S' },
      { id: 'trombocitopenia', label: 'Trombocitopenia induzida por heparina (HIT)' },
      { id: 'outras_trombofilias', label: 'Outras trombofilias congênitas ou adquiridas' },
    ],
  },
  {
    grupo: '5 pontos cada',
    pontos: 5,
    color: 'red',
    itens: [
      { id: 'avc', label: 'AVC (<1 mês)' },
      { id: 'artroplastia', label: 'Artroplastia eletiva de quadril ou joelho' },
      { id: 'fratura_quadril', label: 'Fratura de quadril, pelve ou membros inferiores (<1 mês)' },
      { id: 'lesao_medular', label: 'Lesão medular aguda (<1 mês)' },
      { id: 'cirurgia_grande_porte', label: 'Múltiplos traumas (<1 mês)' },
    ],
  },
]

function getRisco(score: number) {
  if (score <= 1) return {
    label: 'Risco Muito Baixo',
    color: 'emerald',
    tev: '<10%',
    tvp: '0,5%',
    tep_fatal: '0,2%',
    profilaxia: 'Deambulação precoce. Sem profilaxia farmacológica necessária.',
    mecanica: 'Não necessária rotineiramente.',
  }
  if (score <= 2) return {
    label: 'Risco Baixo',
    color: 'lime',
    tev: '10–20%',
    tvp: '1,5%',
    tep_fatal: '0,4%',
    profilaxia: 'Deambulação precoce. Considerar meias elásticas de compressão gradual.',
    mecanica: 'Meias de compressão gradual (MCG) ou compressão pneumática intermitente (CPI).',
  }
  if (score <= 4) return {
    label: 'Risco Moderado',
    color: 'yellow',
    tev: '20–40%',
    tvp: '3%',
    tep_fatal: '0,7%',
    profilaxia: 'Heparina não fracionada (HNF) 5000 UI SC 8/8h ou Enoxaparina 40mg SC 1x/dia. Iniciar 12h antes ou após a cirurgia.',
    mecanica: 'CPI + MCG durante a internação.',
  }
  if (score <= 8) return {
    label: 'Risco Alto',
    color: 'orange',
    tev: '40–80%',
    tvp: '6%',
    tep_fatal: '1,4%',
    profilaxia: 'Enoxaparina 40mg SC 1x/dia ou HNF 5000 UI SC 8/8h por 7–10 dias. Estender profilaxia até 28–35 dias em cirurgias ortopédicas maiores.',
    mecanica: 'CPI obrigatória + MCG. Manter até deambulação plena.',
  }
  return {
    label: 'Risco Muito Alto',
    color: 'red',
    tev: '>80%',
    tvp: '6–12%',
    tep_fatal: '2–4%',
    profilaxia: 'Enoxaparina 40mg SC 1x/dia + CPI. Considerar filtro de veia cava inferior em casos selecionados. Estender profilaxia por 28–35 dias.',
    mecanica: 'CPI obrigatória. Manter até alta hospitalar.',
  }
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

const colorHeader: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  red: 'bg-red-50 border-red-200 text-red-700',
}

const colorCheck: Record<string, string> = {
  blue: 'bg-blue-600 border-blue-600',
  yellow: 'bg-yellow-500 border-yellow-500',
  orange: 'bg-orange-500 border-orange-500',
  red: 'bg-red-600 border-red-600',
}

export default function CapriniPage() {
  const router = useRouter()
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({})

  const score = FATORES.reduce((total, grupo) => {
    return total + grupo.itens.filter(item => selecionados[item.id]).length * grupo.pontos
  }, 0)

  const risco = getRisco(score)
  const totalSelecionados = Object.values(selecionados).filter(Boolean).length

  function toggle(id: string) {
    setSelecionados(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Score de Caprini</h1>
        <p className="text-sm text-slate-500 mt-1">Avaliação de risco de Tromboembolismo Venoso (TEV/TVP) perioperatório</p>
      </div>

      {/* Score dinâmico */}
      <div className={`card p-4 mb-5 border-2 transition-all ${colorCard[risco.color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pontuação total</p>
            <p className="text-3xl font-bold text-slate-900">{score}</p>
            <p className="text-xs text-slate-400 mt-0.5">{totalSelecionados} fator{totalSelecionados !== 1 ? 'es' : ''} selecionado{totalSelecionados !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${colorBadge[risco.color]}`}>
              {risco.label}
            </span>
            <p className="text-xs text-slate-500 mt-2">TEV estimado: <strong>{risco.tev}</strong></p>
          </div>
        </div>
      </div>

      {/* Fatores de risco por grupo */}
      <div className="space-y-4 mb-6">
        {FATORES.map(grupo => (
          <div key={grupo.grupo}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-2 text-sm font-semibold ${colorHeader[grupo.color]}`}>
              <span>+{grupo.pontos} ponto{grupo.pontos > 1 ? 's' : ''} cada</span>
              <span className="font-normal opacity-70">— {grupo.grupo}</span>
            </div>
            <div className="space-y-2">
              {grupo.itens.map(item => (
                <button key={item.id} type="button"
                  onClick={() => toggle(item.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    selecionados[item.id]
                      ? `ring-1 ${colorCard[grupo.color === 'blue' ? 'emerald' : grupo.color === 'yellow' ? 'yellow' : grupo.color === 'orange' ? 'orange' : 'red']}`
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selecionados[item.id] ? colorCheck[grupo.color] : 'border-slate-300 bg-white'
                  }`}>
                    {selecionados[item.id] && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-sm text-slate-800">{item.label}</span>
                  <span className={`ml-auto text-xs font-bold flex-shrink-0 ${
                    selecionados[item.id] ? 'text-primary-700' : 'text-slate-300'
                  }`}>+{grupo.pontos}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Resultado detalhado */}
      <div className={`card p-6 border-2 ${colorCard[risco.color]} animate-fade-in`}>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          {risco.label} — {score} pontos
        </h2>
        <p className="text-sm text-slate-600 mb-4">Risco estimado de TEV: {risco.tev}</p>

        <div className="bg-white rounded-xl p-4 space-y-4 text-sm">

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">TEV total</p>
              <p className="font-bold text-slate-900">{risco.tev}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">TVP proximal</p>
              <p className="font-bold text-slate-900">{risco.tvp}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">TEP fatal</p>
              <p className="font-bold text-slate-900">{risco.tep_fatal}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-1">💊 Profilaxia farmacológica</p>
            <p className="text-slate-600 text-xs leading-relaxed">{risco.profilaxia}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-1">🦵 Profilaxia mecânica</p>
            <p className="text-slate-600 text-xs leading-relaxed">{risco.mecanica}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-700 mb-2">📊 Referência por pontuação</p>
            <div className="space-y-1 text-xs">
              {[
                { range: '0–1', label: 'Muito Baixo', tev: '<10%', c: 'bg-emerald-50 text-emerald-700' },
                { range: '2', label: 'Baixo', tev: '10–20%', c: 'bg-lime-50 text-lime-700' },
                { range: '3–4', label: 'Moderado', tev: '20–40%', c: 'bg-yellow-50 text-yellow-700' },
                { range: '5–8', label: 'Alto', tev: '40–80%', c: 'bg-orange-50 text-orange-700' },
                { range: '≥9', label: 'Muito Alto', tev: '>80%', c: 'bg-red-50 text-red-700' },
              ].map(row => (
                <div key={row.range} className={`flex justify-between px-3 py-1.5 rounded-lg font-medium ${row.c}`}>
                  <span>{row.range} pts — {row.label}</span>
                  <span>TEV {row.tev}</span>
                </div>
              ))}
            </div>
          </div>

          {score >= 5 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="font-semibold text-red-700 mb-1">🚨 Alto/Muito Alto Risco</p>
              <p className="text-red-600 text-xs leading-relaxed">
                Pacientes com Caprini ≥5 têm risco substancial de TEV. A profilaxia farmacológica é mandatória salvo contraindicação (sangramento ativo, trombocitopenia grave, cirurgia ocular/intracraniana). Discutir caso com equipe multidisciplinar.
              </p>
            </div>
          )}

          <div className="border-t pt-3">
            <p className="font-semibold text-slate-700 mb-1">📚 Sobre o Score</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              O Modelo de Avaliação de Risco de Caprini foi desenvolvido em 1991 e revisado em 2005 por Joseph Caprini. É o modelo de estratificação de risco de TEV cirúrgico mais amplamente validado e utilizado mundialmente, recomendado pelo American College of Chest Physicians (ACCP) e pelo American Society of Hematology (ASH). Considera fatores clínicos, histórico trombótico e condições adquiridas ou hereditárias de hipercoagulabilidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
