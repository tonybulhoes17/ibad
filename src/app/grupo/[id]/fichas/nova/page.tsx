'use client'

import { useParams } from 'next/navigation'
import { FichaForm } from '@/components/ficha/FichaForm'

export default function GrupoNovaFichaAnestesicaPage() {
  const params = useParams()
  const grupoId = params.id as string

  return <FichaForm mode="create" groupId={grupoId} />
}
