import { createServerClient } from '@/lib/supabase/server'

export default async function ViewConsultaPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('consultation_records')
    .select('*, institutions(*), insurance_plans(*)')
    .eq('id', params.id)
    .maybeSingle()

  return (
    <div style={{ padding: 20 }}>
      <h1>Teste relacionamento institutions + insurance_plans</h1>
      <p><strong>ID:</strong> {params.id}</p>

      <h2>Error</h2>
      <pre>{JSON.stringify(error, null, 2)}</pre>

      <h2>Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}