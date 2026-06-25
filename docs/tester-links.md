# Tester-Links

20 individuelle Links für die MVP-Testnutzer. Jeder Link gehört zu einer eigenen
`tenant_id` (= Token). Daten, die ein Tester anlegt, sieht **nur dieser Tester**.
Jeder Tester startet mit einer **eigenen, vollständigen Kopie** der Basisdaten
(Klassen 5a/5b samt Bibliothek). Diese Kopien sind voneinander isoliert: Hinzufügen,
Bearbeiten und Löschen wirkt ausschliesslich im eigenen Tenant. Lediglich die
Lehrpersonen-Identitäten (`tenant_id = 'shared'`) sind geteilte Referenz.

## So funktioniert es

- Der `?t=<token>`-Parameter setzt einmalig das Cookie `lezio_tenant`
  (90 Tage gültig). Danach genügt die Basis-URL `https://lezio.vercel.app/…`.
- Jeder Tester bekommt **genau einen** der untenstehenden Links.
- Tokens/Tenants sind in [src/lib/tenants.ts](../src/lib/tenants.ts) definiert
  und werden über [scripts/seed.ts](../scripts/seed.ts) in `dim_tenants` angelegt.

## Die 20 Links

| Tester | Link |
|--------|------|
| Tester 1  | https://lezio.vercel.app/klassen?t=lz_t01_k4rp9 | Bettina
| Tester 2  | https://lezio.vercel.app/klassen?t=lz_t02_m7xqn | Lena
| Tester 3  | https://lezio.vercel.app/klassen?t=lz_t03_bj3wv | Rebecca
| Tester 4  | https://lezio.vercel.app/klassen?t=lz_t04_fh8yz | Nicole
| Tester 5  | https://lezio.vercel.app/klassen?t=lz_t05_qn2ts | Larissa
| Tester 6  | https://lezio.vercel.app/klassen?t=lz_t06_dv6lx | Maya
| Tester 7  | https://lezio.vercel.app/klassen?t=lz_t07_rc1mu | Carla
| Tester 8  | https://lezio.vercel.app/klassen?t=lz_t08_gy5pj | Daniel
| Tester 9  | https://lezio.vercel.app/klassen?t=lz_t09_wk0bz | Beatrice
| Tester 10 | https://lezio.vercel.app/klassen?t=lz_t10_nt4ea | Sibylle Kaegi
| Tester 11 | https://lezio.vercel.app/klassen?t=lz_t11_hs8cf | Eva 
| Tester 12 | https://lezio.vercel.app/klassen?t=lz_t12_xu7dk | Fanny
| Tester 13 | https://lezio.vercel.app/klassen?t=lz_t13_pb3mn | Adrian
| Tester 14 | https://lezio.vercel.app/klassen?t=lz_t14_jw6rq | Sibylle Inaebnit
| Tester 15 | https://lezio.vercel.app/klassen?t=lz_t15_ez9vl | Sibylla Leiser
| Tester 16 | https://lezio.vercel.app/klassen?t=lz_t16_a3wmq | 
| Tester 17 | https://lezio.vercel.app/klassen?t=lz_t17_t8kpz | 
| Tester 18 | https://lezio.vercel.app/klassen?t=lz_t18_r5ndx | 
| Tester 19 | https://lezio.vercel.app/klassen?t=lz_t19_c2vhf | 
| Tester 20 | https://lezio.vercel.app/klassen?t=lz_t20_y7bqs | 
