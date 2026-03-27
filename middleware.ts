import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Rotas protegidas — exige autenticação
  if (path.startsWith('/app') || path.startsWith('/grupo')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))

    // Verifica aceitação dos termos (exceto na própria página de termos)
    if (!path.startsWith('/app/termos')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('terms_accepted_version')
        .eq('id', user.id)
        .single()

      const { data: currentTerm } = await supabase
        .from('terms_of_use')
        .select('version')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (currentTerm && profile?.terms_accepted_version !== currentTerm.version) {
        return NextResponse.redirect(new URL('/app/termos', request.url))
      }
    }
  }

  if ((path === '/auth/login' || path === '/auth/register') && user) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/app/:path*', '/grupo/:path*', '/auth/login', '/auth/register', '/onboarding'],
}
