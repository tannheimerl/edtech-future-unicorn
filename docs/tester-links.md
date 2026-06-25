# Tester-Links

15 individuelle Links für die MVP-Testnutzer. Jeder Link gehört zu einer eigenen
`tenant_id` (= Token). Daten, die ein Tester anlegt, sieht **nur dieser Tester**.
Die geteilte Basisklasse 5a/5b (`tenant_id = 'shared'`) ist für alle als
read-only Referenz sichtbar.

## So funktioniert es

- Der `?t=<token>`-Parameter setzt einmalig das Cookie `lezio_tenant`
  (90 Tage gültig). Danach genügt die Basis-URL `https://lezio.vercel.app/…`.
- Jeder Tester bekommt **genau einen** der untenstehenden Links.
- Tokens/Tenants sind in [src/lib/tenants.ts](../src/lib/tenants.ts) definiert
  und werden über [scripts/seed.ts](../scripts/seed.ts) in `dim_tenants` angelegt.

## Die 15 Links

| Tester | Link |
|--------|------|
| Tester 1  | https://lezio.vercel.app/klassen?t=lz_t01_k4rp9 |
| Tester 2  | https://lezio.vercel.app/klassen?t=lz_t02_m7xqn |
| Tester 3  | https://lezio.vercel.app/klassen?t=lz_t03_bj3wv |
| Tester 4  | https://lezio.vercel.app/klassen?t=lz_t04_fh8yz |
| Tester 5  | https://lezio.vercel.app/klassen?t=lz_t05_qn2ts |
| Tester 6  | https://lezio.vercel.app/klassen?t=lz_t06_dv6lx |
| Tester 7  | https://lezio.vercel.app/klassen?t=lz_t07_rc1mu |
| Tester 8  | https://lezio.vercel.app/klassen?t=lz_t08_gy5pj |
| Tester 9  | https://lezio.vercel.app/klassen?t=lz_t09_wk0bz |
| Tester 10 | https://lezio.vercel.app/klassen?t=lz_t10_nt4ea |
| Tester 11 | https://lezio.vercel.app/klassen?t=lz_t11_hs8cf |
| Tester 12 | https://lezio.vercel.app/klassen?t=lz_t12_xu7dk |
| Tester 13 | https://lezio.vercel.app/klassen?t=lz_t13_pb3mn |
| Tester 14 | https://lezio.vercel.app/klassen?t=lz_t14_jw6rq |
| Tester 15 | https://lezio.vercel.app/klassen?t=lz_t15_ez9vl |
