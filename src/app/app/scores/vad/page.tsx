'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RotateCcw, BookOpen, GitBranch, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'

// ─────────────────────────────────────────────
// ÁRVORE DE DECISÃO — DAS (Difficult Airway Society)
// ─────────────────────────────────────────────
type Node = {
  id: string
  text: string
  detail?: string
  type: 'question' | 'action' | 'final' | 'emergency'
  options?: { label: string; next: string; color?: string }[]
}

const DAS_NODES: Record<string, Node> = {
  start: {
    id: 'start',
    text: 'Paciente anestesiado — Intubação traqueal necessária',
    detail: 'Início do algoritmo DAS para intubação traqueal difícil não antecipada em adultos.',
    type: 'action',
    options: [{ label: 'Iniciar Plano A', next: 'plano_a_prep' }],
  },
  plano_a_prep: {
    id: 'plano_a_prep',
    text: 'PLANO A — Otimizar e tentar intubação',
    detail: '1. Otimizar posição da cabeça e pescoço (posição de olfato)\n2. Pré-oxigenar com FiO₂ 100%\n3. Garantir bloqueio neuromuscular adequado\n4. Laringoscopia direta ou videolaringoscopia (máx. 3+1 tentativas)\n5. Aplicar manipulação laríngea externa se necessário\n6. Usar Bougie (introdutor) se abertura glótica limitada\n7. Remover pressão cricoide se aplicada\n8. Manter oxigenação e anestesia entre tentativas',
    type: 'action',
    options: [
      { label: 'Intubação bem-sucedida ✓', next: 'sucesso_a', color: 'green' },
      { label: 'Falha na intubação — declarar falha', next: 'plano_a_falha', color: 'red' },
    ],
  },
  sucesso_a: {
    id: 'sucesso_a',
    text: 'Sucesso — Intubação traqueal confirmada',
    detail: 'Confirmar intubação traqueal obrigatoriamente com capnografia (curva de CO₂ contínua).\n\nDocumentar no prontuário: dispositivo utilizado, número de tentativas e qualquer dificuldade encontrada.',
    type: 'final',
  },
  plano_a_falha: {
    id: 'plano_a_falha',
    text: 'Falha no Plano A — Declare em voz alta para a equipe',
    detail: 'Se em dificuldade → CHAMAR POR AJUDA imediatamente.\n\nNão persista além de 3+1 tentativas. Tentativas repetidas causam trauma e podem converter uma situação "pode oxigenar" em "não pode oxigenar" (NINO).',
    type: 'action',
    options: [{ label: 'Avançar para Plano B', next: 'plano_b' }],
  },
  plano_b: {
    id: 'plano_b',
    text: 'PLANO B — Manter oxigenação: inserir DEG (Dispositivo Extraglótico)',
    detail: '1. Inserir DEG de 2ª geração (ex: i-gel, LMA ProSeal, LMA Supreme)\n2. Máximo de 3 tentativas — troque dispositivo ou tamanho se necessário\n3. Oxigenar e ventilar — confirme com capnografia\n4. Manter anestesia adequada\n\nDEG de 2ª geração: preferível por ter canal gástrico e maior vedação.',
    type: 'action',
    options: [
      { label: 'Ventilação com DEG bem-sucedida ✓', next: 'plano_b_sucesso', color: 'green' },
      { label: 'Falha na ventilação com DEG', next: 'plano_b_falha', color: 'red' },
    ],
  },
  plano_b_sucesso: {
    id: 'plano_b_sucesso',
    text: 'DEG funcionando — PAUSE E PENSE',
    detail: 'Com oxigenação mantida pelo DEG, você tem tempo. Avalie as opções:\n\n• Despertar o paciente (melhor opção se cirurgia eletiva)\n• Intubação através do DEG (com fibroscópio ou bougie guiado)\n• Prosseguir sem intubar a traqueia (se cirurgia pode ser feita assim)\n• Traqueostomia ou cricotireoidostomia eletiva\n\nDecisão compartilhada com cirurgião e equipe.',
    type: 'question',
    options: [
      { label: 'Despertar o paciente', next: 'despertar' },
      { label: 'Intubação através do DEG', next: 'intubacao_deg' },
      { label: 'Prosseguir sem intubar', next: 'prosseguir_sem_intubar' },
      { label: 'Via aérea cirúrgica eletiva', next: 'cirurgica_eletiva' },
    ],
  },
  despertar: {
    id: 'despertar',
    text: 'Decisão: Despertar o paciente',
    detail: 'Melhor opção em cirurgia eletiva.\n\n1. Manter oxigenação pelo DEG\n2. Reverter bloqueio neuromuscular (sugammadex ou neostigmina)\n3. Aguardar retorno da consciência\n4. Retirar DEG com paciente acordado\n5. Reagendar cirurgia com planejamento de VA difícil\n6. Documentar e alertar o paciente por escrito\n7. Considerar: intubação acordada com fibroscópio, traqueostomia eletiva ou anestesia regional na próxima abordagem',
    type: 'final',
  },
  intubacao_deg: {
    id: 'intubacao_deg',
    text: 'Intubação através do DEG',
    detail: 'Técnica com fibroscópio flexível:\n1. Passar fibroscópio carregado com TT através do canal do DEG\n2. Visualizar a glote pelo fibroscópio\n3. Avançar o TT sobre o fibroscópio\n4. Confirmar com capnografia\n5. Retirar DEG mantendo o TT posicionado\n\nRisco: deslocamento do TT ao retirar o DEG — usar técnica de railroading cuidadosa.',
    type: 'final',
  },
  prosseguir_sem_intubar: {
    id: 'prosseguir_sem_intubar',
    text: 'Prosseguir cirurgia com DEG (sem intubar)',
    detail: 'Opção válida quando:\n• Cirurgia de curta duração\n• Baixo risco de aspiração\n• Ventilação excelente pelo DEG\n• Cirurgião e anestesiologista concordam\n\nAtenção: monitorar ventilação continuamente. Ter plano de resgate imediato preparado.',
    type: 'final',
  },
  cirurgica_eletiva: {
    id: 'cirurgica_eletiva',
    text: 'Via aérea cirúrgica eletiva',
    detail: 'Traqueostomia cirúrgica eletiva ou cricotireoidostomia eletiva.\n\nIndicada quando:\n• Anatomia desfavorável que impossibilita qualquer técnica percutânea\n• Obstrução supraglótica fixa\n• Paciente com necessidade de via aérea definitiva a longo prazo',
    type: 'final',
  },
  plano_b_falha: {
    id: 'plano_b_falha',
    text: 'Falha no DEG — Avançar para Plano C',
    detail: 'Declare falha na ventilação com DEG.\nPaciente está em risco de hipóxia — urgência máxima.',
    type: 'action',
    options: [{ label: 'Avançar para Plano C', next: 'plano_c' }],
  },
  plano_c: {
    id: 'plano_c',
    text: 'PLANO C — Tentativa final de ventilação sob máscara facial',
    detail: '1. Ventilação com máscara facial com 2 operadores (técnica a dois)\n2. Adjuntos de via aérea: cânula orofaríngea (Guedel) + nasofaríngea\n3. Oxigenação apneica com cateter nasal de alto fluxo (HFNO) se disponível\n4. Posição otimizada (elevação da cabeça 20–30°)\n5. Avaliar necessidade de CPAP\n\nSe ventilação POSSÍVEL → "Pare e pense" (ver opções Plano B acima)\nSe NÃO POSSÍVEL → Declarar NINO → Plano D imediato',
    type: 'action',
    options: [
      { label: 'Ventilação com máscara possível ✓', next: 'plano_b_sucesso', color: 'green' },
      { label: 'NINO — Não pode intubar, não pode oxigenar', next: 'plano_d', color: 'red' },
    ],
  },
  plano_d: {
    id: 'plano_d',
    text: '🚨 PLANO D — EMERGÊNCIA — Acesso cervical anterior emergencial',
    detail: '⚠️ SITUAÇÃO DE RISCO DE VIDA — NINO DECLARADO\n\nCricotireoidostomia por bisturi (técnica preferencial — DAS 2015):\n\n1. Palpar membrana cricotireóidea\n2. Incisão vertical na pele (4 cm)\n3. Incisão horizontal na membrana cricotireóidea\n4. Dilatar com pinça de Trousseau\n5. Inserir cânula de traqueostomia nº 6 ou TT nº 6 com cuff\n6. Inflar cuff e ventilar\n7. Confirmar com capnografia\n\nTécnica alternativa: cricotireoidostomia com kit comercial (Melker).\n\nAPÓS RESOLUÇÃO:\n• Cuidados pós-operatórios intensivos\n• Preencher formulário de alerta de VAD\n• Explicar ao paciente verbalmente e por escrito\n• Notificar serviço/base de dados',
    type: 'emergency',
  },
}

// ─────────────────────────────────────────────
// ÁRVORE DE DECISÃO — ASA 2022
// ─────────────────────────────────────────────
const ASA_NODES: Record<string, Node> = {
  start: {
    id: 'start',
    text: 'Avaliar probabilidade de VA difícil',
    detail: 'A ASA 2022 preconiza avaliação pré-operatória obrigatória da via aérea em todos os pacientes.\n\nAvaliar os 4 domínios:\n1. Ventilação difícil sob máscara\n2. Laringoscopia/intubação difícil\n3. Supraglótico difícil (DEG)\n4. Via aérea cirúrgica difícil',
    type: 'action',
    options: [
      { label: 'VA difícil antecipada (eletivo)', next: 'asa_antecipada' },
      { label: 'VA difícil não antecipada (intraoperatório)', next: 'asa_nao_antecipada' },
    ],
  },
  asa_antecipada: {
    id: 'asa_antecipada',
    text: 'Via aérea difícil antecipada — Cirurgia eletiva',
    detail: 'Com VA difícil antecipada, a ASA 2022 recomenda consideração de intubação acordada.\n\nPreparo:\n• Sedação consciente ou anestesia tópica da VA\n• Técnicas preferidas: fibroscópio flexível, videolaringoscopia acordado\n• Ter equipe experiente, carrinho de VA difícil, cirurgião disponível',
    type: 'question',
    options: [
      { label: 'Intubação acordada', next: 'asa_acordado' },
      { label: 'Intubação com paciente anestesiado (risco aceito)', next: 'asa_anestesiado' },
    ],
  },
  asa_acordado: {
    id: 'asa_acordado',
    text: 'Intubação acordada — Paciente colaborativo',
    detail: 'Técnicas para intubação acordada (ASA 2022):\n\n• Fibroscópio flexível transnasal ou transoral\n• Videolaringoscopia acordado com anestesia tópica\n• Laringoscopia direta acordado\n• Máscara laríngea de intubação (ILMA)\n\nAnestesia tópica:\n• Lidocaína 4% nebulizada ou spray\n• Bloqueios nervosos (laríngeo superior, glossofaríngeo)\n• Sedação cuidadosa: dexmedetomidina ou midazolam em doses tituladas',
    type: 'question',
    options: [
      { label: 'Intubação acordada bem-sucedida ✓', next: 'asa_sucesso_acordado', color: 'green' },
      { label: 'Falha na intubação acordada', next: 'asa_falha_acordado', color: 'red' },
    ],
  },
  asa_sucesso_acordado: {
    id: 'asa_sucesso_acordado',
    text: 'Sucesso — Intubação acordada confirmada',
    detail: 'Confirmar com capnografia.\n\nApós confirmação:\n• Induzir anestesia geral com segurança\n• Documentar técnica utilizada\n• Informar o paciente e registrar no prontuário (alerta de VA difícil)',
    type: 'final',
  },
  asa_falha_acordado: {
    id: 'asa_falha_acordado',
    text: 'Falha na intubação acordada',
    detail: 'Opções:\n\n1. Cancelar o procedimento — reavaliar anatomia, otimizar técnica, repetir em outro momento\n2. Via aérea cirúrgica eletiva (traqueostomia acordado)\n3. Anestesia regional como alternativa à anestesia geral\n\nNÃO induzir anestesia geral sem via aérea segura garantida.',
    type: 'final',
  },
  asa_anestesiado: {
    id: 'asa_anestesiado',
    text: 'Indução com VA difícil conhecida — Atenção máxima',
    detail: 'Pré-requisitos obrigatórios:\n• Carrinho de VA difícil completo na sala\n• Videolaringoscópio como primeira escolha\n• DEG de 2ª geração disponível e pronto\n• Cricotireoidostomia preparada\n• Cirurgião disponível\n• Oxigenação apneica ativa (HFNO)\n\nLimite: máximo 2 tentativas de laringoscopia.',
    type: 'action',
    options: [
      { label: 'Intubação bem-sucedida ✓', next: 'asa_sucesso', color: 'green' },
      { label: 'Falha na intubação', next: 'asa_nao_antecipada', color: 'red' },
    ],
  },
  asa_sucesso: {
    id: 'asa_sucesso',
    text: 'Sucesso — Confirmar com capnografia',
    detail: 'Intubação confirmada com capnografia contínua.\n\nDocumentar e prosseguir com a cirurgia com monitorização habitual.',
    type: 'final',
  },
  asa_nao_antecipada: {
    id: 'asa_nao_antecipada',
    text: 'VA difícil não antecipada — Paciente já anestesiado',
    detail: 'Paciente anestesiado com falha de intubação. Avaliar imediatamente:\n\n• Nível de consciência e profundidade anestésica\n• Saturação de O₂ atual\n• Possibilidade de despertar o paciente\n• Ventilação com máscara facial possível?',
    type: 'question',
    options: [
      { label: 'Ventilação com máscara possível', next: 'asa_mask_ok' },
      { label: 'Ventilação com máscara impossível', next: 'asa_emergencia' },
    ],
  },
  asa_mask_ok: {
    id: 'asa_mask_ok',
    text: 'Ventilação com máscara possível — Oxigenação mantida',
    detail: 'Com oxigenação mantida, você tem tempo para decidir:\n\nASA 2022 recomenda:\n1. Pedir ajuda imediatamente\n2. Limitar novas tentativas de intubação (máx. 2 tentativas adicionais)\n3. Usar videolaringoscópio se ainda não usado\n4. Considerar DEG como ponte para oxigenação\n5. Considerar despertar o paciente',
    type: 'question',
    options: [
      { label: 'Tentar videolaringoscópio / técnica alternativa', next: 'asa_video' },
      { label: 'Inserir DEG de 2ª geração', next: 'asa_deg' },
      { label: 'Despertar o paciente', next: 'asa_despertar' },
    ],
  },
  asa_video: {
    id: 'asa_video',
    text: 'Tentativa com videolaringoscópio ou técnica alternativa',
    detail: 'Videolaringoscopia:\n• Melhora visualização em 1–2 graus de Cormack-Lehane\n• Use bougie sempre que a glote não for totalmente visível\n• Confirme com capnografia\n\nOutras técnicas: fibroscópio flexível, ILMA (máscara laríngea de intubação), combinação VL + fibroscópio.',
    type: 'question',
    options: [
      { label: 'Sucesso ✓', next: 'asa_sucesso', color: 'green' },
      { label: 'Nova falha', next: 'asa_deg', color: 'red' },
    ],
  },
  asa_deg: {
    id: 'asa_deg',
    text: 'Inserir DEG de 2ª geração (supraglótico)',
    detail: 'DEG de 2ª geração (i-gel, LMA ProSeal, LMA Supreme):\n• Inserir e confirmar ventilação com capnografia\n• Se sucesso → "Pare e pense" (despertar? intubação pelo DEG? prosseguir?)\n• Máximo 2 tentativas de DEG',
    type: 'question',
    options: [
      { label: 'DEG funciona — oxigenação mantida ✓', next: 'asa_deg_ok', color: 'green' },
      { label: 'DEG falhou', next: 'asa_emergencia', color: 'red' },
    ],
  },
  asa_deg_ok: {
    id: 'asa_deg_ok',
    text: 'DEG funcionando — Pause e avalie',
    detail: 'Com oxigenação garantida pelo DEG, ASA 2022 recomenda:\n\n• Despertar o paciente (opção mais segura em cirurgia eletiva)\n• Intubação guiada pelo DEG com fibroscópio\n• Prosseguir cirurgia com DEG (se curta, sem risco de aspiração)\n• Via aérea cirúrgica eletiva\n\nDocumentar a dificuldade e planejar próxima abordagem.',
    type: 'final',
  },
  asa_despertar: {
    id: 'asa_despertar',
    text: 'Despertar o paciente',
    detail: 'Procedimento de despertar (ASA 2022):\n\n1. Manter oxigenação (máscara ou DEG)\n2. Suspender agentes anestésicos\n3. Reverter bloqueio neuromuscular com sugammadex\n4. Aguardar recuperação completa da consciência e reflexos protetores\n5. Considerar na próxima tentativa: intubação acordada, anestesia regional, traqueostomia eletiva\n6. Informar e documentar',
    type: 'final',
  },
  asa_emergencia: {
    id: 'asa_emergencia',
    text: '🚨 EMERGÊNCIA — NINO — Via aérea cirúrgica imediata',
    detail: '⚠️ SITUAÇÃO DE RISCO DE VIDA\nNão pode intubar + Não pode oxigenar\n\nASA 2022 — Via aérea de emergência:\n\n1. Declarar NINO em voz alta — pedir ajuda\n2. Cricotireoidostomia com bisturi (técnica mais rápida e confiável):\n   a. Palpar e identificar membrana cricotireóidea\n   b. Incisão vertical na pele → incisão horizontal na membrana\n   c. Dilatar com pinça → inserir cânula/TT nº 6\n   d. Ventilar e confirmar com capnografia\n3. Alternativa: cricotireoidostomia percutânea por Seldinger\n4. Oxigenação jet transtraqueal como medida temporária\n\nAPÓS RESOLUÇÃO:\n• Cuidados intensivos\n• Documentação completa\n• Comunicação com paciente e família\n• Notificação institucional',
    type: 'emergency',
  },
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function AlgoritmoVADPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'choose' | 'interactive' | 'study'>('choose')
  const [diretriz, setDiretriz] = useState<'das' | 'asa'>('das')
  const [history, setHistory] = useState<string[]>(['start'])
  const [studyTab, setStudyTab] = useState<'texto' | 'fluxograma'>('texto')

  const nodes = diretriz === 'das' ? DAS_NODES : ASA_NODES
  const currentId = history[history.length - 1]
  const current = nodes[currentId]

  function go(nextId: string) {
    setHistory(h => [...h, nextId])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    if (history.length > 1) setHistory(h => h.slice(0, -1))
  }

  function restart() {
    setHistory(['start'])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const bgColor = current?.type === 'emergency'
    ? 'border-red-400 bg-red-50'
    : current?.type === 'final'
      ? 'border-emerald-400 bg-emerald-50'
      : 'border-primary-300 bg-primary-50/30'

  if (mode === 'choose') {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Algoritmo de Via Aérea Difícil</h1>
        <p className="text-sm text-slate-500 mb-8">Escolha a diretriz e o modo de uso</p>

        {/* Escolha da diretriz */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">Diretriz base:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: 'das', title: 'DAS 2015', sub: 'Difficult Airway Society', desc: 'Planos A, B, C e D. Mais usada na Europa e amplamente adotada no Brasil.' },
              { v: 'asa', title: 'ASA 2022', sub: 'American Society of Anesthesiologists', desc: 'Diretriz norte-americana atualizada. Foco em avaliação pré-operatória e decisão compartilhada.' },
            ].map(opt => (
              <button key={opt.v} type="button"
                onClick={() => setDiretriz(opt.v as 'das' | 'asa')}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  diretriz === opt.v
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-slate-200 bg-white hover:border-slate-400'
                }`}>
                <p className="font-bold text-slate-900">{opt.title}</p>
                <p className="text-xs text-slate-500 mb-2">{opt.sub}</p>
                <p className="text-xs text-slate-600">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Escolha do modo */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setHistory(['start']); setMode('interactive') }}
            className="group bg-white border-2 border-slate-200 hover:border-primary-500 rounded-2xl p-6 flex flex-col items-center text-center transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <GitBranch className="w-7 h-7 text-primary-700" />
            </div>
            <h2 className="font-bold text-slate-900 mb-2">Modo Interativo</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Responda passo a passo. O sistema guia você pelo algoritmo até a conduta indicada.
            </p>
            <span className="mt-4 inline-block bg-primary-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg">
              Usar agora
            </span>
          </button>

          <button onClick={() => setMode('study')}
            className="group bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center text-center transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <BookOpen className="w-7 h-7 text-emerald-700" />
            </div>
            <h2 className="font-bold text-slate-900 mb-2">Modo Estudo</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Revise o algoritmo completo em texto ou fluxograma visual. Ideal para fixar o conteúdo.
            </p>
            <span className="mt-4 inline-block bg-emerald-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg">
              Estudar
            </span>
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'study') {
    return (
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setMode('choose')} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex gap-2 ml-auto">
            {(['das', 'asa'] as const).map(d => (
              <button key={d} onClick={() => setDiretriz(d)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  diretriz === d ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-600 border-slate-200'
                }`}>
                {d === 'das' ? 'DAS 2015' : 'ASA 2022'}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-1">
          {diretriz === 'das' ? 'Algoritmo DAS 2015' : 'Algoritmo ASA 2022'}
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          {diretriz === 'das'
            ? 'Manuseio da intubação traqueal difícil não antecipada em adultos — Difficult Airway Society'
            : 'Manejo da via aérea difícil — American Society of Anesthesiologists 2022'}
        </p>

        <div className="flex gap-2 mb-5">
          {(['texto', 'fluxograma'] as const).map(t => (
            <button key={t} onClick={() => setStudyTab(t)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                studyTab === t ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-600 border-slate-200'
              }`}>
              {t === 'texto' ? '📄 Texto' : '📊 Fluxograma'}
            </button>
          ))}
        </div>

        {studyTab === 'texto' && (
          <div className="space-y-4">
            {diretriz === 'das' ? (
              <>
                <StudyCard color="blue" title="PLANO A — Ventilação e Intubação Traqueal" badge="1ª linha">
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Otimizar posição (cabeça e pescoço — posição de olfato)</li>
                    <li>Pré-oxigenação com FiO₂ 100%</li>
                    <li>Bloqueio neuromuscular adequado</li>
                    <li>Laringoscopia direta ou videolaringoscopia — máx. <strong>3+1 tentativas</strong></li>
                    <li>Manipulação laríngea externa + Bougie se necessário</li>
                    <li>Remover pressão cricoide se aplicada</li>
                    <li>Manter oxigenação entre tentativas</li>
                  </ul>
                  <p className="mt-3 text-xs text-red-600 font-semibold">Se em dificuldade → CHAMAR AJUDA | Falha → declarar e avançar para Plano B</p>
                </StudyCard>

                <StudyCard color="indigo" title="PLANO B — Manter Oxigenação com DEG" badge="Se Plano A falhar">
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Inserir DEG de 2ª geração (i-gel, LMA ProSeal, LMA Supreme)</li>
                    <li>Máximo de <strong>3 tentativas</strong></li>
                    <li>Confirmar ventilação com capnografia</li>
                  </ul>
                  <div className="mt-3 bg-amber-50 rounded-lg p-3 text-xs text-amber-700">
                    <strong>Se DEG funciona → PAUSE E PENSE:</strong> Despertar | Intubação pelo DEG | Prosseguir sem intubar | Via cirúrgica eletiva
                  </div>
                </StudyCard>

                <StudyCard color="amber" title="PLANO C — Ventilação com Máscara Facial" badge="Se Plano B falhar">
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Ventilação a dois operadores</li>
                    <li>Adjuntos: cânula orofaríngea + nasofaríngea</li>
                    <li>HFNO (alto fluxo nasal) se disponível</li>
                  </ul>
                  <p className="mt-3 text-xs text-slate-500">Se ventilação possível → opções do Plano B | Se NINO → Plano D imediato</p>
                </StudyCard>

                <StudyCard color="red" title="PLANO D — Acesso Cervical Anterior Emergencial" badge="NINO — EMERGÊNCIA">
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li><strong>Cricotireoidostomia por bisturi</strong> (técnica preferencial)</li>
                    <li>Incisão vertical pele → incisão horizontal membrana cricoide</li>
                    <li>Dilatar com Trousseau → inserir TT nº 6 com cuff</li>
                    <li>Confirmar com capnografia</li>
                  </ul>
                  <p className="mt-3 text-xs text-red-600 font-semibold">Após resolução: preencher alerta VAD, informar paciente por escrito, notificar serviço</p>
                </StudyCard>
              </>
            ) : (
              <>
                <StudyCard color="blue" title="AVALIAÇÃO PRÉ-OPERATÓRIA OBRIGATÓRIA" badge="Base da ASA 2022">
                  <p className="text-sm text-slate-600">Avaliar os 4 domínios de dificuldade:</p>
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside mt-2">
                    <li>Ventilação difícil com máscara</li>
                    <li>Laringoscopia/intubação difícil</li>
                    <li>Inserção de DEG difícil</li>
                    <li>Via aérea cirúrgica difícil</li>
                  </ul>
                </StudyCard>

                <StudyCard color="indigo" title="VA DIFÍCIL ANTECIPADA — Considerar intubação acordada" badge="Eletivo">
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Fibroscópio flexível (padrão ouro)</li>
                    <li>Videolaringoscopia acordado</li>
                    <li>Anestesia tópica + sedação consciente titulada</li>
                    <li>Máx. 2 tentativas sob anestesia se optar por essa via</li>
                  </ul>
                </StudyCard>

                <StudyCard color="amber" title="VA DIFÍCIL NÃO ANTECIPADA — Ventilação possível" badge="Intraoperatório">
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Pedir ajuda imediatamente</li>
                    <li>Videolaringoscópio como próxima escolha</li>
                    <li>DEG de 2ª geração como ponte</li>
                    <li>Despertar o paciente se possível</li>
                    <li>Máx. 2 tentativas adicionais totais</li>
                  </ul>
                </StudyCard>

                <StudyCard color="red" title="NINO — Via aérea cirúrgica de emergência" badge="EMERGÊNCIA">
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Cricotireoidostomia com bisturi (primeira escolha)</li>
                    <li>Alternativa: Seldinger percutâneo</li>
                    <li>Jet transtraqueal apenas como medida temporária</li>
                    <li>Documentar, comunicar, notificar</li>
                  </ul>
                </StudyCard>
              </>
            )}
          </div>
        )}

        {studyTab === 'fluxograma' && (
          <div className="card p-4 overflow-x-auto">
            {diretriz === 'das' ? <FluxogramaDAS /> : <FluxogramaASA />}
          </div>
        )}
      </div>
    )
  }

  // ── MODO INTERATIVO ──
  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMode('choose')} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm">
          <ArrowLeft className="w-4 h-4" /> Sair
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{diretriz === 'das' ? 'DAS 2015' : 'ASA 2022'}</span>
          <button onClick={restart} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50">
            <RotateCcw className="w-3 h-3" /> Reiniciar
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      {history.length > 1 && (
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-4 flex-wrap">
          {history.map((id, i) => (
            <span key={id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={i === history.length - 1 ? 'text-primary-600 font-medium' : ''}>
                {nodes[id]?.text?.split('—')[0]?.slice(0, 25) ?? id}
              </span>
            </span>
          ))}
        </div>
      )}

      {current && (
        <div className={`card p-6 border-2 ${bgColor} animate-fade-in`}>
          {/* Badge tipo */}
          <div className="flex items-center gap-2 mb-3">
            {current.type === 'emergency' && (
              <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" /> EMERGÊNCIA
              </span>
            )}
            {current.type === 'final' && (
              <span className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> CONDUTA FINAL
              </span>
            )}
            {current.type === 'question' && (
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                Decisão clínica
              </span>
            )}
            {current.type === 'action' && (
              <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full">
                Ação
              </span>
            )}
          </div>

          <h2 className="text-base font-bold text-slate-900 mb-4">{current.text}</h2>

          {current.detail && (
            <div className="bg-white rounded-xl p-4 mb-5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {current.detail}
            </div>
          )}

          {/* Opções */}
          {current.options && current.options.length > 0 && (
            <div className="space-y-2">
              {current.options.map(opt => (
                <button key={opt.next} onClick={() => go(opt.next)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center justify-between group ${
                    opt.color === 'green'
                      ? 'border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800'
                      : opt.color === 'red'
                        ? 'border-red-300 bg-white hover:bg-red-50 text-red-800'
                        : 'border-slate-200 bg-white hover:border-primary-400 hover:bg-primary-50 text-slate-800'
                  }`}>
                  {opt.label}
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}

          {/* Final / Emergência — botões de ação */}
          {(current.type === 'final' || current.type === 'emergency') && (
            <div className="flex gap-2 mt-5 pt-4 border-t border-slate-200">
              <button onClick={restart}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium">
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar algoritmo
              </button>
              {history.length > 1 && (
                <button onClick={back}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                </button>
              )}
            </div>
          )}

          {/* Botão voltar nos outros tipos */}
          {current.type !== 'final' && current.type !== 'emergency' && history.length > 1 && (
            <button onClick={back}
              className="mt-4 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-3 h-3" /> Voltar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// COMPONENTES AUXILIARES
// ─────────────────────────────────────────────
function StudyCard({ color, title, badge, children }: {
  color: 'blue' | 'indigo' | 'amber' | 'red'
  title: string; badge: string; children: React.ReactNode
}) {
  const colors = {
    blue: 'border-blue-300 bg-blue-50',
    indigo: 'border-indigo-300 bg-indigo-50',
    amber: 'border-amber-300 bg-amber-50',
    red: 'border-red-400 bg-red-50',
  }
  const badges = {
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
  }
  return (
    <div className={`rounded-xl border-2 p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badges[color]}`}>{badge}</span>
      </div>
      {children}
    </div>
  )
}

function FluxogramaDAS() {
  const boxes = [
    { label: 'PLANO A', sub: 'Intubação traqueal\n(máx. 3+1 tentativas)', color: 'bg-blue-700', ok: 'Sucesso → Confirmar com capnografia', fail: 'Falha → Declarar + Pedir ajuda' },
    { label: 'PLANO B', sub: 'DEG de 2ª geração\n(máx. 3 tentativas)', color: 'bg-indigo-700', ok: 'Sucesso → PAUSE E PENSE', fail: 'Falha → Avançar' },
    { label: 'PLANO C', sub: 'Máscara facial\n(2 operadores + adjuntos)', color: 'bg-amber-600', ok: 'Ventilação possível → PAUSE E PENSE', fail: 'NINO → PLANO D IMEDIATO' },
    { label: 'PLANO D', sub: 'Cricotireoidostomia\npor bisturi', color: 'bg-red-700', ok: '', fail: '' },
  ]
  return (
    <div className="min-w-[300px]">
      <p className="text-xs text-slate-500 mb-4 text-center">DAS 2015 — Estrutura dos 4 Planos</p>
      <div className="space-y-2">
        {boxes.map((b, i) => (
          <div key={b.label}>
            <div className={`${b.color} text-white rounded-xl p-4`}>
              <p className="font-bold text-sm">{b.label}</p>
              <p className="text-xs opacity-90 whitespace-pre-line mt-0.5">{b.sub}</p>
            </div>
            {b.ok && (
              <div className="flex gap-2 mt-1 ml-4">
                <div className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-lg">✓ {b.ok}</div>
                {b.fail && <div className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-lg">✗ {b.fail}</div>}
              </div>
            )}
            {i < boxes.length - 1 && (
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-4 bg-slate-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function FluxogramaASA() {
  const steps = [
    { label: 'Avaliação pré-op', sub: 'Identificar VA difícil antecipada', color: 'bg-blue-700' },
    { label: 'VA difícil antecipada?', sub: 'Sim → Intubação acordada\nNão → Indução padrão', color: 'bg-indigo-700' },
    { label: 'Intubação acordada', sub: 'Fibroscópio / Videolaringoscopia\nAnestesia tópica + sedação leve', color: 'bg-indigo-600' },
    { label: 'Falha inesperada (anestesiado)', sub: 'Ventilação possível? → Pedir ajuda\nVL + DEG + Despertar', color: 'bg-amber-600' },
    { label: 'NINO', sub: 'Cricotireoidostomia imediata\nDocumentar e comunicar', color: 'bg-red-700' },
  ]
  return (
    <div className="min-w-[300px]">
      <p className="text-xs text-slate-500 mb-4 text-center">ASA 2022 — Fluxo simplificado</p>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={s.label}>
            <div className={`${s.color} text-white rounded-xl p-4`}>
              <p className="font-bold text-sm">{s.label}</p>
              <p className="text-xs opacity-90 whitespace-pre-line mt-0.5">{s.sub}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center my-1">
                <div className="w-0.5 h-4 bg-slate-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
