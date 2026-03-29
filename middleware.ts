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

  // Rotas que exigem autenticação
  if (path.startsWith('/app') || path.startsWith('/grupo') || path === '/termos') {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if ((path === '/auth/login' || path === '/auth/register') && user) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Protege rotas autenticadas e libera explicitamente arquivos estáticos,
     * manifest.json e OneSignalSDKWorker.js (CRÍTICO para PWA funcionar)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icons|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.json$|.*\\.js$|.*\\.ico$|OneSignalSDKWorker\\.js).*)',
    '/app/:path*',
    '/grupo/:path*',
    '/termos',
    '/auth/login',
    '/auth/register',
    '/onboarding',
  ],
}
