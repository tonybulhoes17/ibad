'use client'

import { useState } from 'react'
import { useTemplates } from '@/hooks'
import { ANESTHESIA_TYPES, DEFAULT_TEMPLATES } from '@/constants/anesthesia'
import { BookOpen, Save, Loader2, ChevronDown } from 'lucide-react'

export default function ModelosPage() {
  const { templates, upsert } = useTemplates()
  const [selected, setSelected] = useState<string>(ANESTHESIA_TYPES[0].value)
  const [text, setText] = useState(DEFAULT_TEMPLATES[ANESTHESIA_TYPES[0].value] ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSelect(type: string) {
    setSelected(type)
    const existing = templates.find(t => t.anesthesia_type === type)?.template_text
    setText(existing ?? DEFAULT_TEMPLATES[type] ?? '')
  }

  async function handleSave() {
    setSaving(true)
    await upsert(selected, text)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const selectedLabel = ANESTHESIA_TYPES.find(t => t.value === selected)?.label

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Modelos de Descrição</h1>
        <p className="text-sm text-slate-500">Textos padrão por tipo de anestesia — preenchidos automaticamente na ficha</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de tipos */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tipos
          </div>
          <div className="divide-y divide-slate-50">
            {ANESTHESIA_TYPES.map(t => {
              const hasCustom = templates.some(tp => tp.anesthesia_type === t.value)
              return (
                <button
                  key={t.value}
                  onClick={() => handleSelect(t.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                    selected === t.value ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {t.label}
                  {hasCustom && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-slate-900">{selectedLabel}</h2>
              <p className="text-xs text-slate-400">
                {templates.some(t => t.anesthesia_type === selected) ? '✓ Modelo personalizado' : 'Usando modelo padrão'}
              </p>
            </div>
            <button onClick={handleSave} disabled={saving}
              className={`btn-primary text-sm flex items-center gap-2 ${saved ? '!bg-emerald-600' : ''}`}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          <textarea
            className="form-textarea flex-1 min-h-[300px] font-mono text-xs leading-relaxed"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Digite o modelo de descrição para este tipo de anestesia..."
          />
          <p className="text-xs text-slate-400 mt-2">
            Este texto será carregado automaticamente ao selecionar "{selectedLabel}" em uma nova ficha.
          </p>
        </div>
      </div>
    </div>
  )
}
