# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev             # Start Vite dev server on port 3000 with --host
pnpm build           # Build client (vite) + bundle server (esbuild ESM) into dist/
pnpm build:singlefile # Single-file build with hash routing (VITE_HASH_ROUTING=true)
pnpm start           # Production: NODE_ENV=production node dist/index.js
pnpm preview         # Vite preview server for the built client
pnpm check           # TypeScript type-checking (tsc --noEmit)
pnpm format          # Prettier format all files
```

- Package manager: **pnpm** (v10.4.1).
- There are no test files despite `vitest` being in devDependencies.
- `pnpm build:singlefile` sets `VITE_HASH_ROUTING=true` — this switches routing to hash-based (`useHashLocation`) for `file://` protocol use. The unused branch (pushState routing) is tree-shaken at build time.

## Architecture

This is a **static SPA** for the Paleontological Society of China (中国古生物学会). Stack: React 19, Vite 7, Tailwind CSS 4, shadcn/ui (New York style), wouter for routing, Express for production serving.

### Two-site structure in one codebase

The app serves two conceptual "sub-sites" from a single React app:

1. **Society Main Portal** (学会主站) — public-facing pages: Home (`/`), Intro (`/intro`), Structure (`/structure`), History (`/history`), Gallery (`/gallery`), Announcements (`/society-announcements`), International (`/international`), Downloads (`/downloads-center`), Regulations (`/regulations`), Services (`/services`), Branches (`/branches`), Personal Center (`/personal-center`).
2. **Party Culture Sub-system** (党建文化) — internal party-building pages under `/party`, plus 12 sub-pages: announcements, organizations, committees, work, activities, team-building, theory-study, dynamics, special-topics, exemplars, reporting, downloads.

### Route layout rules (defined in `PartyLayout.tsx`)

- **Society Home (`/`)** and **Services (`/services`)** render full-width with no sidebar.
- **Party pages** (everything under `/party` plus its 12 child routes) render with a **two-column layout**: left sidebar navigation (shows party nav items) + right main content area.
- **All other pages** (intro, structure, history, gallery, personal-center, etc.) render full-width with breadcrumbs.
- PartyLayout is the shell for **all pages** — it provides the top nav bar, hero banner, breadcrumbs, sidebar (when applicable), and global footer.

The `isFullWidthPage` check in PartyLayout determines the layout — pages matching specific paths render without the party sidebar. Any new page that should be full-width must be added to that check.

### State: MembershipContext

`MembershipContext` (`client/src/contexts/MembershipContext.tsx`) is the central state hub. It manages:

- **Authentication**: register/login/logout against a mock user DB persisted in `localStorage` under `paleo_user_db`. Demo accounts exist (see `MOCK_USER_DB`). Login/register dialog is `LoginJoinDialog.tsx`.
- **Dual-path membership** (会员双路径): all users start as `regular` (普通用户). On first login, `MembershipChoiceDialog` forces a choice between two paths:
  - **Path A — Non-member** (非会员, `userType = "non_member"`): no payment required. Can immediately bind branches and register for conferences at **non-member pricing** (member price × 1.1).
  - **Path B — Formal member** (正式会员, `userType = "member"`): must complete the two-stage payment flow (voucher upload → review → invoice upload → review → `status = "active"`). Once active, can bind branches and register at **member pricing**.
  - Non-members can upgrade to member at any time via the member services page.
  - `userType` and `membershipChoiceMade` are stored in `localStorage` under `paleo_user_type_{email}` and `paleo_choice_made_{email}`.
- **Society membership**: two-stage payment flow (voucher upload → review → invoice upload → review → approved). Only meaningful when `userType === "member"`.
- **Branch binding**: bind/unbind to professional branches (e.g., Vertebrate Paleontology, Palynology). Non-members and active members can both bind; `regular` users cannot.
- **Conference registrations**: two-stage conference fee flow → submit forms → upload abstracts. Conference fees are user-type-aware via `getConferenceFee(confId)` — returns member or non-member price automatically.
- **Notifications**: system notification bell in the top nav, with read/unread tracking.
- All state is persisted per-user in `localStorage` using `paleo_*` prefixed keys.

### Shared constants (`shared/constants.ts`)

Source of truth for domain data shared between pages and context — do NOT hardcode these values elsewhere:

- `VALID_BRANCH_IDS` / `BRANCH_MAP` — valid branch IDs and their Chinese names
- `CONFERENCE_BRANCH_MAP` — maps conference IDs to their parent branch IDs
- `USER_TYPE` / `UserType` / `USER_TYPE_LABEL` — three-tier user identity: `regular` (普通用户, initial), `non_member` (非会员, path A), `member` (正式会员, path B)
- `MEMBERSHIP_STATUS` / `CONFERENCE_STATUS` — two-stage payment/review status enums (unpaid → voucher_submitted → invoice_pending → ... → confirmed/active)
- `MEMBERSHIP_FEE_CONFIG` — membership fee amounts (standard: ¥200, student: ¥100, corporate: ¥5000)
- `CONFERENCE_FEE_MEMBER` — member-price map per conference ID; non-member price is auto-computed as member × 1.1 via `getConferenceFee(confId, userType)`
- Status label/color maps (`CONFERENCE_STATUS_LABEL`, `MEMBERSHIP_STATUS_LABEL`, etc.) for consistent UI rendering
- `INVOICE_GRACE_PERIOD_WORKDAYS` / `INVOICE_DEADLINE_WARNING_DAYS` — invoice deadline constants

`shared/const.ts` is a minimal companion file with `COOKIE_NAME` and `ONE_YEAR_MS`.

### Design system: "Strata & Heritage"

The visual identity is documented in `ideas.md` and implemented in `index.css`:

- **Primary**: Strata Deep Blue `#002B49` — nav bar, headers
- **Party Red**: `#C41E3A` — accent borders, buttons, sidebar active states
- **Accent Gold**: `#D9C5A0` — highlights, footer headings
- **Paper Bright**: `#FCFAF7` — page background
- **Fossil Stone**: `#E5E1DA` — borders, card edges
- Custom utilities: `.party-gradient`, `.party-card-border` (3px red top border), `.party-text`, `.xingkai-script` (cursive Chinese font for the logo)
- `border-radius: 0.25rem` (straight, academic edges — not rounded)
- Theme is fixed to `light` mode (not switchable) per `App.tsx`

### Component organization

- `client/src/components/ui/` — shadcn/ui primitives (button, card, dialog, select, table, etc.). Do NOT duplicate — extend these.
- `client/src/components/PartyLayout.tsx` — global layout shell used by all pages. Integrates `MembershipChoiceDialog` on first login.
- `client/src/components/LoginJoinDialog.tsx` — auth modal (login/register/forgot-password tabs)
- `client/src/components/MembershipChoiceDialog.tsx` — first-login modal: user must choose "成为正式会员" (path B, payment required) or "作为非会员继续" (path A, no payment, higher conference fees)
- `client/src/components/Map.tsx` — Google Maps via Manus proxy (no API key needed). Provides `MapView` with `onMapReady` callback. Full Maps JS API (markers, places, geocoding, geometry, directions, layers) available through the proxy at `VITE_FRONTEND_FORGE_API_URL/v1/maps/proxy`.
- `client/src/components/ManusDialog.tsx` — debug/runtime dialog
- `client/src/components/ErrorBoundary.tsx` — class-based React error boundary
- `client/src/contexts/ThemeContext.tsx` — light/dark theme toggle (currently forced to light)
- `client/src/hooks/usePersistFn.ts` — stable function reference hook (alternative to useCallback)
- `client/src/hooks/useMobile.tsx` — mobile breakpoint detection via `use-mobile` pattern
- `client/src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)

### Key patterns and rules

- **Routing**: wouter `Switch`/`Route` in `App.tsx`. Use `<Link href="...">` for navigation. Never nest `<a>` inside `<Link>` — Link already renders an anchor.
- **Hash routing**: `VITE_HASH_ROUTING=true` enables `useHashLocation` for singlefile/`file://` builds. The unused branch is tree-shaken at compile time.
- **Icons**: Material Symbols (`material-symbols-outlined` class) for UI chrome; `lucide-react` for component icons.
- **Toasts**: `sonner` only — never add react-toastify or @radix-ui/react-toast.
- **Markdown rendering**: `Streamdown` component from the `streamdown` package.
- **Forms**: `react-hook-form` with `zod` resolvers (`@hookform/resolvers`).
- **Animations**: `framer-motion` for React animations; `tw-animate-css` + `tailwindcss-animate` for CSS animation utilities.
- **Charts**: `recharts` when data visualization is needed.
- **Carousels**: `embla-carousel-react`.
- **Google Fonts**: Add `<link>` tags in `client/index.html` (not via CSS @import).
- **Images/media**: Must be uploaded externally via the Manus CLI; never store large files in `client/public/`. Static assets in `client/public/` are served at root (`/`).
- **`.container`**: Auto-centers + responsive padding (overrides Tailwind default). Use directly — no need for `mx-auto px-*`.
- **`.flex`**: Has `min-width:0` and `min-height:0` by default.
- **Select.Item**: Every `<Select.Item>` must have a non-empty `value` prop.

### Server (production only)

Minimal Express server (`server/index.ts`) that serves the built static files from `dist/public/` and falls back to `index.html` for client-side routing. Port: `PORT` env var or 3000.

### Vite dev server plugins

The Vite config (`vite.config.ts`) includes several custom plugins:

- **Manus Runtime** (`vite-plugin-manus-runtime`): injects the Manus runtime bridge.
- **JSX Loc** (`@builder.io/vite-plugin-jsx-loc`): adds `data-*` location attributes to JSX elements for debugging.
- **Debug Collector**: POST to `/__manus__/logs` from the browser to capture console logs, network requests, and session replays — written to `.manus-logs/` on disk. Auto-trims files at 1MB. Production builds skip the collector script injection.
- **Storage Proxy**: proxied at `/manus-storage/*` — forwards requests to the Forge API's presigned URL endpoint. Requires `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` env vars. Used at dev time to serve remotely stored assets without CORS issues.

### Path aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`
