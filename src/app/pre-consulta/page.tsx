'use client'

import { useState } from 'react'
import { createPublicClient } from '@/lib/supabase/public'

type FormData = {
  full_name: string
  cpf: string
  age: string
  city: string
  email: string
  procedure_name: string
  surgeon: string
  surgery_hospital: string
  procedure_date: string
  previous_surgeries: boolean | null
  previous_surgeries_details: string
  anesthetic_complications: boolean | null
  anesthetic_complications_details: string
  smoking: boolean | null
  smoking_details: string
  drug_allergy: boolean | null
  drug_allergy_details: string
  uses_medication: boolean | null
  medications: string
  comorbidities: string
  weight: string
  height: string
  dental_prosthesis: boolean | null
  cosmetic_items: boolean | null
  uses_monjaro: boolean | null
}

const initial: FormData = {
  full_name: '', cpf: '', age: '', city: '', email: '',
  procedure_name: '', surgeon: '', surgery_hospital: '', procedure_date: '',
  previous_surgeries: null, previous_surgeries_details: '',
  anesthetic_complications: null, anesthetic_complications_details: '',
  smoking: null, smoking_details: '',
  drug_allergy: null, drug_allergy_details: '',
  uses_medication: null, medications: '',
  comorbidities: '',
  weight: '', height: '',
  dental_prosthesis: null, cosmetic_items: null, uses_monjaro: null,
}

function YesNo({ label, hint, value, onChange }: {
  label: string; hint?: string; value: boolean | null
  onChange: (v: boolean) => void
}) {
  return (
    <div className="mb-5">
      <p className="font-medium text-slate-800 mb-1">{label}</p>
      {hint && <p className="text-sm text-slate-500 mb-2">{hint}</p>}
      <div className="flex gap-3">
        <button type="button"
          onClick={() => onChange(true)}
          className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${value === true ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}>
          Sim
        </button>
        <button type="button"
          onClick={() => onChange(false)}
          className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${value === false ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}>
          Não
        </button>
      </div>
    </div>
  )
}

export default function PreConsultaPage() {
  const [form, setForm] = useState<FormData>(initial)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: keyof FormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) {
      setError('Por favor, preencha seu nome completo.')
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createPublicClient()
    const { error: err } = await supabase.from('pre_consultations').insert({
      full_name: form.full_name,
      cpf: form.cpf || null,
      age: form.age ? parseInt(form.age) : null,
      city: form.city || null,
      email: form.email || null,
      procedure_name: form.procedure_name || null,
      surgeon: form.surgeon || null,
      surgery_hospital: form.surgery_hospital || null,
      procedure_date: form.procedure_date || null,
      previous_surgeries: form.previous_surgeries,
      previous_surgeries_details: form.previous_surgeries_details || null,
      anesthetic_complications: form.anesthetic_complications,
      anesthetic_complications_details: form.anesthetic_complications_details || null,
      smoking: form.smoking,
      smoking_details: form.smoking_details || null,
      drug_allergy: form.drug_allergy,
      drug_allergy_details: form.drug_allergy_details || null,
      uses_medication: form.uses_medication,
      medications: form.medications || null,
      comorbidities: form.comorbidities || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      dental_prosthesis: form.dental_prosthesis,
      cosmetic_items: form.cosmetic_items,
      uses_monjaro: form.uses_monjaro,
    })
    setSaving(false)
    if (err) {
      setError('Erro ao enviar. Tente novamente.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-start justify-center p-4 pt-10">
        <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Ficha enviada com sucesso!</h1>
            <p className="text-slate-500">Obrigado por preencher as informações.</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 text-sm text-slate-700 space-y-4 leading-relaxed">
            <p>Sua ficha de avaliação foi recebida com sucesso. Obrigado por preencher as informações — isso ajuda a tornar sua consulta mais organizada e eficiente.</p>
            <p className="font-semibold text-slate-800">Agora fique atento(a) às seguintes orientações para o dia da consulta:</p>
            <div>
              <p className="font-semibold">1. Horário da consulta</p>
              <p>Procure estar disponível no horário agendado. Em caso de consulta online, esteja preparado(a) alguns minutos antes do horário marcado para evitar atrasos.</p>
            </div>
            <div>
              <p className="font-semibold">2. Consulta online</p>
              <p>Se sua consulta for online, procure estar em um local tranquilo, silencioso e com boa conexão de internet. Se possível, utilize um ambiente bem iluminado para facilitar a comunicação durante a avaliação.</p>
            </div>
            <div>
              <p className="font-semibold">3. Exames médicos</p>
              <p>Tenha em mãos seus exames mais recentes, principalmente:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Exames de sangue (como hemograma e coagulograma)</li>
                <li>Eletrocardiograma (ECG)</li>
                <li>Relatório ou avaliação do cardiologista, caso possua</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">4. Informações importantes</p>
              <p>Se possível, tenha por perto:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Lista dos medicamentos que você usa atualmente</li>
                <li>Informações sobre cirurgias ou tratamentos prévios</li>
                <li>Resultados de exames anteriores relacionados ao seu problema de saúde</li>
              </ul>
            </div>
            <p>Caso tenha qualquer dificuldade ou precise atualizar alguma informação antes da consulta, entre em contato com a equipe do serviço.</p>
            <p className="font-medium text-blue-700">Nos vemos em breve. Será um prazer atendê-lo(a). 💙</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 pt-8 pb-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="text-xl font-bold text-blue-700">IBAD</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Ficha de Avaliação Pré-Anestésica</h1>
          <p className="text-slate-500 mt-2 text-sm">Preencha com calma. Todos os campos são opcionais, exceto o nome.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-blue-700 uppercase tracking-wide mb-5">Dados Pessoais</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
              <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                placeholder="Seu nome completo"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input type="text" value={form.cpf} onChange={e => set('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Idade</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)}
                  placeholder="Ex: 45"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                  placeholder="Sua cidade"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
                <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)}
                  placeholder="Ex: 70"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Altura (cm)</label>
                <input type="number" value={form.height} onChange={e => set('height', e.target.value)}
                  placeholder="Ex: 165"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-blue-700 uppercase tracking-wide mb-5">Dados do Procedimento</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Qual cirurgia ou procedimento vai realizar?</label>
              <input type="text" value={form.procedure_name} onChange={e => set('procedure_name', e.target.value)}
                placeholder="Ex: Colecistectomia, Catarata..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do cirurgião</label>
              <input type="text" value={form.surgeon} onChange={e => set('surgeon', e.target.value)}
                placeholder="Nome do médico que vai operar"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Hospital ou clínica onde será realizada a cirurgia</label>
              <input type="text" value={form.surgery_hospital} onChange={e => set('surgery_hospital', e.target.value)}
                placeholder="Nome do local"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data prevista da cirurgia</label>
              <input type="date" value={form.procedure_date} onChange={e => set('procedure_date', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-blue-700 uppercase tracking-wide mb-5">Histórico de Saúde</h2>
            <YesNo label="Já fez alguma cirurgia antes?"
              hint="Inclui qualquer tipo de operação, mesmo que pequena"
              value={form.previous_surgeries}
              onChange={v => set('previous_surgeries', v)} />
            {form.previous_surgeries && (
              <div className="mb-5 -mt-2">
                <textarea value={form.previous_surgeries_details}
                  onChange={e => set('previous_surgeries_details', e.target.value)}
                  placeholder="Quais cirurgias? Quando foram?"
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            )}
            <YesNo label="Já teve algum problema com anestesia?"
              hint="Reações, acordou durante a cirurgia, náuseas intensas, etc."
              value={form.anesthetic_complications}
              onChange={v => set('anesthetic_complications', v)} />
            {form.anesthetic_complications && (
              <div className="mb-5 -mt-2">
                <textarea value={form.anesthetic_complications_details}
                  onChange={e => set('anesthetic_complications_details', e.target.value)}
                  placeholder="Descreva o que aconteceu"
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            )}
            <YesNo label="Fuma ou já fumou?"
              value={form.smoking}
              onChange={v => set('smoking', v)} />
            {form.smoking && (
              <div className="mb-5 -mt-2">
                <input type="text" value={form.smoking_details}
                  onChange={e => set('smoking_details', e.target.value)}
                  placeholder="Quantos cigarros por dia? Parou há quanto tempo?"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-blue-700 uppercase tracking-wide mb-5">Alergias</h2>
            <YesNo label="Tem alergia a algum medicamento?"
              hint="Ex: penicilina, dipirona, AAS, anestésicos..."
              value={form.drug_allergy}
              onChange={v => set('drug_allergy', v)} />
            {form.drug_allergy && (
              <div className="-mt-2">
                <input type="text" value={form.drug_allergy_details}
                  onChange={e => set('drug_allergy_details', e.target.value)}
                  placeholder="Nome dos remédios que causam alergia"
                  className="w-full border border-red-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-blue-700 uppercase tracking-wide mb-5">Medicamentos e Doenças</h2>
            <YesNo label="Usa algum medicamento diariamente?"
              hint="Inclui remédios para pressão, diabetes, coração, tireoide, etc."
              value={form.uses_medication}
              onChange={v => set('uses_medication', v)} />
            {form.uses_medication && (
              <div className="mb-5 -mt-2">
                <textarea value={form.medications}
                  onChange={e => set('medications', e.target.value)}
                  placeholder="Liste os remédios que usa (nome e dose, se souber)"
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            )}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">Quais doenças ou condições de saúde você tem?</label>
              <p className="text-xs text-slate-400 mb-2">Ex: diabetes, hipertensão, problemas no coração, asma, etc. Deixe em branco se não tiver nenhuma.</p>
              <textarea value={form.comorbidities}
                onChange={e => set('comorbidities', e.target.value)}
                placeholder="Ex: Diabetes tipo 2, hipertensão arterial..."
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <YesNo label="Usa Monjaro, Ozempic ou outra 'caneta emagrecedora'?"
              hint="Medicamentos injetáveis para emagrecimento ou diabetes tipo 2"
              value={form.uses_monjaro}
              onChange={v => set('uses_monjaro', v)} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-blue-700 uppercase tracking-wide mb-5">Informações Adicionais</h2>
            <YesNo label="Usa prótese dentária (dentadura)?"
              value={form.dental_prosthesis}
              onChange={v => set('dental_prosthesis', v)} />
            <YesNo label="Usa itens estéticos?"
              hint="Unhas em gel, esmalte, apliques de cabelo, piercings, etc."
              value={form.cosmetic_items}
              onChange={v => set('cosmetic_items', v)} />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-4 rounded-xl text-base transition-colors disabled:opacity-60">
            {saving ? 'Enviando...' : 'Enviar Ficha'}
          </button>

          <p className="text-center text-xs text-slate-400 pb-4">
            Seus dados são confidenciais e protegidos. Usados apenas para sua consulta médica.
          </p>
        </form>
      </div>
    </div>
  )
}
