'use client'

import { useParams } from 'next/navigation'
import { ConsultaForm } from '@/components/consulta/ConsultaForm'

export default function GrupoNovaConsultaPage() {
  const params = useParams()
  const grupoId = params.id as string

  return <ConsultaForm mode="create" groupId={grupoId} />
}
