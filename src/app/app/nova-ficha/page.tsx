'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, Stethoscope, AlertTriangle, Building2, Shield } from 'lucide-react'
import { useInstituicoes, usePlanos } from '@/hooks'

export default function EscolhaFichaPage() {
  const { instituicoes, loading: loadingInst } = useInstituicoes()
  const { planos, loading: loadingPlanos } = usePlanos()

  const loading = loadingInst || loadingPlanos
  const hasInstitution = instituicoes.length > 0
  const hasPlan = planos.length > 0
  const canCreate = hasInstitution && hasPlan

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Verificando cadastros...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">

        {/* Voltar */}
        <Link href="/app/fichas" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar para fichas
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Nova Ficha</h1>
        <p className="text-slate-500 mb-6">Selecione o tipo de ficha que deseja criar</p>

        {/* Aviso bloqueante */}
        {!canCreate && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Cadastro incompleto</h3>
                <p className="text-sm text-amber-700">
                  Para lançar uma ficha é necessário ter pelo menos uma <strong>Instituição</strong> e um <strong>Plano de Saúde</strong> cadastrados. Complete os cadastros abaixo para continuar.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!hasInstitution && (
                <Link href="/app/instituicoes"
                  className="flex items-center gap-2 bg-white border border-amber-300 text-amber-800 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-amber-50 transition-colors">
                  <Building2 className="w-4 h-4" />
                  Cadastrar Instituição
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">obrigatório</span>
                </Link>
              )}
              {!hasPlan && (
                <Link href="/app/planos"
                  className="flex items-center gap-2 bg-white border border-amber-300 text-amber-800 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-amber-50 transition-colors">
                  <Shield className="w-4 h-4" />
                  Cadastrar Plano de Saúde
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">obrigatório</span>
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Ficha Anestésica */}
          {canCreate ? (
            <Link href="/app/fichas/nova"
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
          ) : (
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-8 flex flex-col items-center text-center opacity-40 cursor-not-allowed">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
                <ClipboardList className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-500 mb-2">Ficha Anestésica</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Registro completo do procedimento anestésico com organograma de PA e FC, descrição e dados financeiros.
              </p>
              <span className="mt-6 inline-block bg-slate-200 text-slate-400 text-sm font-medium px-6 py-2 rounded-lg">
                Cadastro incompleto
              </span>
            </div>
          )}

          {/* Consulta Pré-Anestésica */}
          {canCreate ? (
            <Link href="/app/consultas/nova"
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
          ) : (
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-8 flex flex-col items-center text-center opacity-40 cursor-not-allowed">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
                <Stethoscope className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-500 mb-2">Consulta Pré-Anestésica</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Avaliação pré-anestésica com histórico clínico, exame físico, exames laboratoriais e orientações ao paciente.
              </p>
              <span className="mt-6 inline-block bg-slate-200 text-slate-400 text-sm font-medium px-6 py-2 rounded-lg">
                Cadastro incompleto
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
