<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Best practices for agents working in this repo

Lezio is a Tauri desktop app (Next.js frontend, local SQLite via the Tauri SQL
plugin). UI language is German; the domain terms (Klasse, Fach, Thema,
Lernziel, Prüfung/Lernzielkontrolle, RILZ, bVSA) are used verbatim in code.

## Architecture

- **Data flow:** `DataContext` is a write-through cache — React state is the
  UI's source of truth, every mutation also persists to SQLite. Mutations live
  in `src/hooks/data/*`; read/write queries in `src/actions/`. Data loads
  **asynchronously after mount** (see React rules below).
- **File layout:** a page file in `src/app/**/page.tsx` contains only its page
  component. Subcomponents live in `src/components/<domain>/` (klassen,
  lernziele, berichte, analytics, lernkontrolle, beurteilung, pruefungen).
  `src/components/shared/` holds cross-domain building blocks,
  `src/components/ui/` the primitives. Keep it that way: new helpers go into
  `src/lib/`, new subcomponents get their own file — don't grow page files.
- Domain types live in `src/types/domain.ts`.

## Reuse before you write — these helpers already exist

Check these before re-implementing logic; duplicating them is the most common
mistake in this codebase's history:

| Need | Use |
| --- | --- |
| Today as `YYYY-MM-DD` | `todayISO()` from `lib/dates` — **never** `new Date().toISOString().slice(0, 10)`; that is UTC and yields yesterday before ~2:00 local time |
| Format an ISO date | `formatDateCH(iso, opts?)` from `lib/dates` (parses timezone-safe, `de-CH`) |
| Status → 1 / 0.5 / 0 | `sv()` from `lib/utils` |
| Avg % over statuses / counts | `statusAvgPct(statuses)` / `weightedPct(reached, partial, total)` from `lib/utils` |
| Color for a progress % | `scoreColor` (text), `scoreBarColor` (bg), `scoreChipClasses` (chip) — all use the canonical **75 / 25** thresholds; do not invent new ones |
| "Vorname Nachname" | `fullName(s)` from `lib/utils` |
| RILZ skip rule / adjusted score / KPIs | `isLZSkipped`, `adjustedLZScore`, `computeStudentKpis`, `computeKlasseStats`, `isSpecialStudent`, `competencyPct` from `lib/student-kpis` |
| PDF/ZIP report download | `downloadBerichte`, `sanitizeFilename` from `lib/berichtUtils` |
| Lezio file import flow | `useLezioImport()` hook + `<LezioImportModal imp={…}/>` — never re-implement the parse/Zuordnung/feedback pipeline |
| Status cycle cell | `StatusCell` / `nextStatus` from `components/shared/StatusCell` |
| Modal dropdown option list | `ModalOptionList` (inside `ModalRow`) |
| Lernziel add/edit/delete step | `LernzielEditSection` (used by both Thema edit modals) |
| Analytics tiles/bars/filters | `components/analytics/shared.tsx` (KpiTile, LZStatusBar, FilterBar, …) |
| Segmented/stacked progress bar | `ProgressBar` from `components/shared/ProgressBar` (segments API) |

## React rules (the ESLint config enforces these as errors)

- **No `setState` inside effect bodies** and **no components defined during
  render** — derive values at render time instead. Example pattern used here:
  a "choice with default" is stored as `chosenX` state initialized to `null`
  and resolved at render (`const x = chosenX ?? data[0]?.id ?? null`).
- **Data is empty on first render.** Never seed `useState` initializers from
  context data (`useState(pruefungen[0]?.id)` stays stale forever) — derive
  the fallback at render or key the component so it remounts.
- Don't read `ref.current` during render; bind refs to DOM elements via a
  plain local variable (destructure first if the ref arrives inside an object).
- Prefer arrow functions (`const x = () => {}`) everywhere.

## Workflow

- **Files may change under you.** Parallel sessions and editor
  format-on-save are common here. Re-check a file's current content right
  before editing; don't trust reads from earlier in the session. Quote style
  is per-file (some files are prettier-formatted with double quotes +
  semicolons, others use single quotes) — match the file you're in.
- **Verify with:** `npx tsc --noEmit`, `npx eslint <changed files>`, and
  `npm run build` for the final check. Lint has some pre-existing errors
  (setState-in-effect in old modal reset effects, unescaped quotes in German
  text) — don't add new ones, but don't block on the legacy ones either.
- A plain `next dev` browser preview shows the load-error state because data
  comes from the Tauri SQLite plugin; real smoke tests need
  `npm run tauri:dev`.
- `src/app/klassen/schueler/` and `src/app/klassen/schueler/bericht/` are
  unlinked legacy pages (see their TODO headers) — leave them alone unless
  asked.
