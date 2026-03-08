import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FichaForm } from '@/components/ficha/FichaForm'

export default async function EditarFichaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: record } = await supabase
    .from('anesthesia_records')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!record) notFound()

  return <FichaForm mode="edit" recordId={params.id} initialData={record} />
}
