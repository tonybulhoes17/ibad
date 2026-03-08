export const ANESTHESIA_TYPES = [
  { value: 'geral_balanceada',  label: 'Geral Balanceada' },
  { value: 'geral_venosa',      label: 'Geral Venosa (TIVA)' },
  { value: 'geral_inalatoria',  label: 'Geral Inalatória' },
  { value: 'sedacao_local',     label: 'Sedação + Local' },
  { value: 'sedacao',           label: 'Sedação' },
  { value: 'sedacao_exame',     label: 'Sedação Exame' },
  { value: 'raquianestesia',    label: 'Raquianestesia' },
  { value: 'peridural',         label: 'Peridural' },
  { value: 'raqui_peridural',   label: 'Raqui + Peridural' },
  { value: 'geral_peridural',   label: 'Geral + Peridural' },
  { value: 'geral_raqui',       label: 'Geral + Raquianestesia' },
  { value: 'bloqueio_sedacao',  label: 'Bloqueio Periférico + Sedação' },
  { value: 'bloqueio_geral',    label: 'Bloqueio Periférico + Geral' },
] as const

export type AnesthesiaTypeValue = typeof ANESTHESIA_TYPES[number]['value']

export const FLUID_TYPES = [
  { value: 'RL',   label: 'RL — Ringer Lactato' },
  { value: 'PL',   label: 'PL — Plasma-Lyte' },
  { value: 'SF',   label: 'SF — Soro Fisiológico' },
  { value: 'CH',   label: 'CH — Concentrado de Hemácias' },
  { value: 'CP',   label: 'CP — Plaquetas' },
  { value: 'CRIO', label: 'CRIO — Crioprecipitado' },
  { value: 'PF',   label: 'PF — Plasma Fresco Congelado' },
] as const

export const ECG_VALUES = ['RS', 'FA', 'FV', 'EV', 'EA', 'TV', 'AESP', 'AO', 'BAVT'] as const

export const INHALATIONAL_AGENTS = [
  { value: 'sevoflurane', label: 'Sevoflurano' },
  { value: 'isoflurane',  label: 'Isoflurano' },
  { value: 'desflurane',  label: 'Desflurano' },
  { value: 'n2o',         label: 'Óxido Nitroso' },
] as const

export const DESTINATIONS = [
  { value: 'CRPA',        label: 'CRPA' },
  { value: 'Enfermaria',  label: 'Enfermaria' },
  { value: 'UTI',         label: 'UTI' },
] as const

export const MODALITIES = [
  { value: 'eletiva',   label: 'Eletiva' },
  { value: 'urgencia',  label: 'Urgência' },
] as const

export const DURATION_OPTIONS = [
  { value: 30,  label: '30 min' },
  { value: 60,  label: '1 hora' },
  { value: 90,  label: '1h30' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas' },
] as const

export const DEFAULT_TEMPLATES: Record<string, string> = {
  raquianestesia: `MONITORIZAÇÃO + VENOCLISE PERVIA + O2 CN + RAQUIANESTESIA ASSÉPTICA, L3-L4, AGULHA PONTA DE LÁPIS 27G, ATRAUMÁTICA E 01 TENTATIVA, RETORNO DE LIQUOR LÍMPIDO E CLARO, SEM INTERCORRÊNCIAS`,
  peridural: `MONITORIZAÇÃO + VENOCLISE PERVIA + O2 CN + ANESTESIA PERIDURAL LOMBAR ASSÉPTICA, AGULHA TUOHY 18G, IDENTIFICAÇÃO DO ESPAÇO PERIDURAL POR PERDA DE RESISTÊNCIA, INTRODUÇÃO DE CATETER PERIDURAL, SEM INTERCORRÊNCIAS`,
  geral_balanceada: `MONITORIZAÇÃO + VENOCLISE PERVIA + PRÉ-OXIGENAÇÃO + INDUÇÃO ANESTÉSICA ENDOVENOSA + INTUBAÇÃO OROTRAQUEAL COM LARINGOSCOPIA DIRETA + MANUTENÇÃO COM AGENTE INALATÓRIO + BLOQUEIO NEUROMUSCULAR, SEM INTERCORRÊNCIAS`,
  geral_venosa: `MONITORIZAÇÃO + VENOCLISE PERVIA + PRÉ-OXIGENAÇÃO + INDUÇÃO E MANUTENÇÃO ANESTÉSICA ENDOVENOSA (TIVA) COM PROPOFOL E REMIFENTANIL EM BOMBA DE INFUSÃO, SEM INTERCORRÊNCIAS`,
  sedacao: `MONITORIZAÇÃO + VENOCLISE PERVIA + SEDAÇÃO VENOSA COM MIDAZOLAM E FENTANIL + O2 POR CATETER NASAL, SEM INTERCORRÊNCIAS`,
  sedacao_local: `MONITORIZAÇÃO + VENOCLISE PERVIA + SEDAÇÃO VENOSA + ANESTESIA LOCAL PELO CIRURGIÃO + O2 POR CATETER NASAL, SEM INTERCORRÊNCIAS`,
}
