// Pre-generated tokens for the 15 MVP testers.
// Each token is also the tenant_id in Supabase.
// Share each unique URL: https://<domain>/?t=<token>
export const TENANT_TOKENS: string[] = [
  'lz_t01_k4rp9',
  'lz_t02_m7xqn',
  'lz_t03_bj3wv',
  'lz_t04_fh8yz',
  'lz_t05_qn2ts',
  'lz_t06_dv6lx',
  'lz_t07_rc1mu',
  'lz_t08_gy5pj',
  'lz_t09_wk0bz',
  'lz_t10_nt4ea',
  'lz_t11_hs8cf',
  'lz_t12_xu7dk',
  'lz_t13_pb3mn',
  'lz_t14_jw6rq',
  'lz_t15_ez9vl',
]

export const VALID_TENANT_IDS = new Set<string>([
  'shared',
  'dev',
  ...TENANT_TOKENS,
])

// Returns the tenant ID to use for DB queries.
// Falls back to the dev tenant in development (env NEXT_PUBLIC_DEV_TENANT).
export function resolveTenantId(cookieValue: string | undefined): string {
  const devTenant = process.env.NEXT_PUBLIC_DEV_TENANT
  if (devTenant && process.env.NODE_ENV !== 'production') return devTenant
  if (cookieValue && VALID_TENANT_IDS.has(cookieValue)) return cookieValue
  return 'dev'
}

export const TENANT_COOKIE = 'lezio_tenant'
