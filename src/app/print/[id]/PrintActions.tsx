'use client'

import { ArrowLeft, Printer } from 'lucide-react'
import Link from 'next/link'

export function PrintActions({ recordId, fromGroup }: { recordId: string; fromGroup?: string }) {
  const backHref = fromGroup
    ? `/grupo/${fromGroup}/fichas`
    : `/app/fichas/${recordId}`

  return (
    <div className="flex items-center gap-3">
      <Link href={backHref} className="btn-secondary text-sm flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <button onClick={() => window.print()} className="btn-primary text-sm flex items-center gap-2">
        <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
      </button>
    </div>
  )
}
