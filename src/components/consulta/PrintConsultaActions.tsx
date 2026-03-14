'use client'

export function PrintConsultaActions() {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => window.print()}
        className="btn-primary text-sm px-4 py-2"
      >
        🖨️ Imprimir
      </button>
    </div>
  )
}
