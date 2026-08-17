# LegalAI — Frontend

A complete, integrated Next.js frontend for LegalAI: landing page, authentication,
and full Citizen + Lawyer workspaces, sharing one design system throughout.

## Run it
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Verified before delivery
- `npm run build` — 27 routes, 0 errors
- `npx eslint src` — 0 errors, 0 warnings
- Every route smoke-tested against a running production server (`npm run start`) — all return 200
- An unknown path (e.g. `/no-such-page`) correctly returns 404, confirming routing isn't silently catching everything
- Every `href` in the sidebar nav (`src/lib/constants.ts`) checked 1:1 against an existing `src/app/**/page.tsx` — no dead links
- No `href="#"` placeholders remain anywhere (footer legal links, forgot-password, lawyer profile CTAs all resolve to real pages)

## Route map

| Area | Route |
|---|---|
| Marketing | `/` |
| Auth | `/login`, `/register`, `/forgot-password` |
| Static | `/privacy`, `/terms`, `/contact` |
| Citizen | `/citizen`, `/citizen/cases`, `/citizen/case-intelligence`, `/citizen/legal-research`, `/citizen/documents`, `/citizen/lawyers` (+ `/citizen/lawyers/[id]`), `/citizen/timeline`, `/citizen/notifications`, `/citizen/settings` |
| Lawyer | `/lawyer`, `/lawyer/cases`, `/lawyer/clients`, `/lawyer/case-intelligence`, `/lawyer/legal-research`, `/lawyer/precedents`, `/lawyer/hearings`, `/lawyer/documents`, `/lawyer/notifications`, `/lawyer/settings` |

## Structure
- `src/app/globals.css` — design-token system (colors, type, easing) for dark + light themes
- `src/components/theme/` — ThemeProvider + toggle (circular reveal via View Transitions API)
- `src/components/ui/` — Button (supports `href` for real navigation), Card, Input — shared primitives, extend rather than duplicate
- `src/components/hero/` — Particles (canvas dust), LightBeam (cursor-reactive), LadyJustice (abstract SVG sculpture), Columns
- `src/components/sections/` — KnowledgeNetwork, FeatureCards, ArchitectureReveal, ModeSplit (landing page)
- `src/components/layout/` — Navbar, Footer, AuthShell, DashboardShell (role-aware sidebar + topbar), StaticPageShell
- `src/components/legal/` — CaseCard, StatusBadge, LawyerCard, CitationCard, HearingCard, ClientCard, CaseIntelligenceView, LegalResearchPanel
- `src/components/documents/` — FileUploader (drag-drop + staged OCR/analysis demo)
- `src/components/ai/` — AnalysisStages (the "Understanding → Finding issues → …" staged loader)
- `src/components/common/` — PageHeader, EmptyState, NotificationList
- `src/services/`, `src/lib/api-client.ts` — central API client; `NEXT_PUBLIC_API_BASE_URL` + `NEXT_PUBLIC_USE_MOCKS` control mock vs real backend, no URLs hardcoded in components
- `src/mocks/` — clearly-separated Demo Data, never presented as real legal information
- `src/types/` — shared TypeScript contracts (marked `TEMPORARY FRONTEND CONTRACT` where the backend isn't finalized)

## Notes
- All motion respects `prefers-reduced-motion` and reduces particle count on mobile.
- Fonts (Fraunces / Manrope / IBM Plex Mono) load via `next/font/google` — needs internet on first build to fetch them, then they're self-hosted automatically.
- Every list/data view supports loading, success, empty, and error states.
- This is a frontend prototype: login/register call a mock auth service (see `NEXT_PUBLIC_USE_MOCKS` in `.env.example`); no real authentication or data persistence happens until it's pointed at a real backend.
