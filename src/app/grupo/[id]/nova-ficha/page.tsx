'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ClipboardList, Stethoscope } from 'lucide-react'

export default function GrupoNovaFichaPage() {
  const params = useParams()
  const grupoId = params.id as string

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">

        <Link href={`/grupo/${grupoId}/fichas`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar para fichas
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Nova Ficha</h1>
        <p className="text-slate-500 mb-6">Selecione o tipo de ficha que deseja criar</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Ficha Anestésica */}
          <Link href={`/app/fichas/nova?group_id=${grupoId}`}
            className="group bg-white border-2 border-slate-200 hover:border-primary-500 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:shadow-lg">
            <div className="w-16 h-16 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mb-5 transition-colors">
              <ClipboardList className="w-8 h-8 text-primary-700" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Ficha Anestésica</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Registro completo do procedimento anestésico com organograma de PA e FC, descrição e dados financeiros.
            </p>
            <span className="mt-6 inline-block bg-primary-700 text-white text-sm font-medium px-6 py-2 rounded-lg group-hover:bg-primary-800 transition-colors">
              Criar Ficha Anestésica
            </span>
          </Link>

          {/* Consulta Pré-Anestésica */}
          <Link href={`/app/consultas/nova?group_id=${grupoId}`}
            className="group bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center text-center transition-all hover:shadow-lg">
            <div className="w-16 h-16 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center mb-5 transition-colors">
              <Stethoscope className="w-8 h-8 text-emerald-700" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Consulta Pré-Anestésica</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Avaliação pré-anestésica com histórico clínico, exame físico, exames laboratoriais e orientações ao paciente.
            </p>
            <span className="mt-6 inline-block bg-emerald-700 text-white text-sm font-medium px-6 py-2 rounded-lg group-hover:bg-emerald-800 transition-colors">
              Criar Consulta Pré-Anestésica
            </span>
          </Link>

        </div>
      </div>
    </div>
  )
}
