import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usa service_role — nunca expor no client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  try {
    // 1. Busca todos os perfis
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, crm, created_at')
      .order('created_at', { ascending: false })

    if (profilesError || !profiles) {
      return NextResponse.json({ error: 'Erro ao buscar perfis' }, { status: 500 })
    }

    // 2. Busca emails da auth.users
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
    const emailMap: Record<string, string> = {}
    authData?.users?.forEach(u => { emailMap[u.id] = u.email ?? '—' })

    // 3. Para cada usuário, busca contagens e última atividade
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const users = await Promise.all(
      profiles.map(async (p) => {
        const [
          { count: anesthesia_count },
          { count: consultation_count },
          { count: shift_count },
        ] = await Promise.all([
          supabaseAdmin.from('anesthesia_records').select('*', { count: 'exact', head: true }).eq('user_id', p.id),
          supabaseAdmin.from('consultation_records').select('*', { count: 'exact', head: true }).eq('user_id', p.id),
          supabaseAdmin.from('shifts').select('*', { count: 'exact', head: true }).eq('user_id', p.id),
        ])

        // Última atividade
        const [{ data: lastAnest }, { data: lastConsult }, { data: lastShift }] = await Promise.all([
          supabaseAdmin.from('anesthesia_records').select('created_at').eq('user_id', p.id).order('created_at', { ascending: false }).limit(1),
          supabaseAdmin.from('consultation_records').select('created_at').eq('user_id', p.id).order('created_at', { ascending: false }).limit(1),
          supabaseAdmin.from('shifts').select('created_at').eq('user_id', p.id).order('created_at', { ascending: false }).limit(1),
        ])

        const dates = [
          lastAnest?.[0]?.created_at,
          lastConsult?.[0]?.created_at,
          lastShift?.[0]?.created_at,
        ].filter(Boolean) as string[]

        const last_activity = dates.length > 0 ? dates.sort().reverse()[0] : null
        const is_active = last_activity ? new Date(last_activity) >= thirtyDaysAgo : false

        const a = anesthesia_count ?? 0
        const c = consultation_count ?? 0
        const s = shift_count ?? 0

        return {
          id: p.id,
          full_name: p.full_name,
          email: emailMap[p.id] ?? '—',
          crm: p.crm ?? '—',
          created_at: p.created_at,
          anesthesia_count: a,
          consultation_count: c,
          shift_count: s,
          total_count: a + c + s,
          last_activity,
          is_active,
        }
      })
    )

    return NextResponse.json({ users })
  } catch (err) {
    console.error('Admin API error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
