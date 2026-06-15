import { NextRequest, NextResponse } from 'next/server'
import { VALID_TENANT_IDS, TENANT_COOKIE } from '@/lib/tenants'

export function middleware(request: NextRequest) {
  const tokenParam = request.nextUrl.searchParams.get('t')

  if (tokenParam && VALID_TENANT_IDS.has(tokenParam)) {
    const response = NextResponse.next()
    response.cookies.set(TENANT_COOKIE, tokenParam, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/',
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
