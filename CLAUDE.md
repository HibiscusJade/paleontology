# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for the **Paleontological Society of China** (中国古生物学会) web presence. It contains two independent frontend SPAs, design docs, and an agentic-coding process directory. There is no backend — all data is managed via `localStorage` with seed demo data.

```
paleontology-admin-latest/     # Admin backend SPA (管理后台)
paleontology-website-latest/   # Member/public-facing SPA (学会主站 + 党建文化)
agentic/                       # Agentic-coding workflow artifacts (specs, reviews, docs by phase)
docs/                          # PRD/MRD documents and prototypes
html/                          # Sample HTML prototypes
```

Both projects share the same tech stack: **React 19, Vite 7, Tailwind CSS 4, shadcn/ui (New York style), wouter, pnpm**. The admin project has its own `shared/` directory that mirrors the website's `shared/` — they are **not** symlinked; updates to shared constants must be done in both places.

> **Note on ARCHITECTURE-DECISIONS.md**: Section 三 of that document describes a git-submodule topology that is **outdated**. The current repo is a flat monorepo — both `paleontology-admin-latest/` and `paleontology-website-latest/` are committed directly, not as submodules. The rest of that document (business rules, privacy constraints, data conventions) remains accurate.

- See `paleontology-website-latest/CLAUDE.md` for detailed website architecture (routes, MembershipContext, layout rules, design system).
- See `agentic/ARCHITECTURE-DECISIONS.md` for business rules, privacy constraints, and architecture decisions.

## Commands

Package manager is **pnpm** (v10.4.1). Run all commands from within the respective project directory.

### Website (`paleontology-website-latest/`)

```bash
pnpm dev              # Vite dev server on port 3000 with --host
pnpm build            # Client build (vite) + server bundle (esbuild ESM) → dist/
pnpm build:singlefile # Single-file HTML with hash routing for file:// protocol
pnpm start            # Production: NODE_ENV=production node dist/index.js
pnpm preview          # Vite preview server
pnpm check            # TypeScript type-check (tsc --noEmit)
pnpm format           # Prettier format all files
```

### Admin (`paleontology-admin-latest/`)

```bash
pnpm dev              # Vite dev server on port 3001 with --host
pnpm build            # Client build (vite) → dist/
pnpm build:singlefile # Single-file HTML with hash routing for file:// protocol
pnpm preview          # Vite preview server
pnpm check            # TypeScript type-check (tsc --noEmit)
pnpm format           # Prettier format all files
```

- The admin project has **no Express server** — it is a pure static SPA. The website includes a minimal Express server for production serving.
- `build:singlefile` sets `VITE_HASH_ROUTING=true` at build time, switching wouter to `useHashLocation` for `file://` protocol compatibility. The unused branch (pushState routing) is tree-shaken.
- There are no automated tests in either project.

### Website-specific dependency notes

- The website has a **patched `wouter@3.7.1`** (`patches/wouter@3.7.1.patch`) — this patch is applied automatically by pnpm during install. The `pnpm.overrides` pins `tailwindcss>nanoid` to `3.3.7`.
- The website's `build:singlefile` also runs `npx tsx scripts/download-fonts.ts` before the vite build to bundle Google Fonts into the single HTML file.

## High-Level Architecture

### Two-site design with shared patterns

Both projects follow the same architecture patterns:

| Pattern | Website | Admin |
|---------|---------|-------|
| **State management** | `MembershipContext` (auth, dual-path membership, branch binding, conferences, notifications) | `AdminContext` (auth, 3 roles, review queues, member/conference/branch CRUD, audit log) |
| **Layout shell** | `PartyLayout` (top nav, hero, breadcrumbs, optional sidebar, footer) | `AdminLayout` (top bar, sidebar, main content area) |
| **Routing** | wouter `Switch`/`Route`, hash routing for singlefile builds | Same pattern |
| **Auth guard** | Optional — public pages render freely; personal center checks login | Mandatory — `AdminLayout` redirects to `/admin/login` if not authenticated |
| **Data persistence** | `localStorage` with `paleo_*` prefixed keys, per-user scoping | `localStorage` with `paleo_admin_*` prefixed keys, seed demo data on first load |
| **Design system** | "Strata & Heritage" (Strata Deep Blue `#002B49`, Party Red `#C41E3A`, Accent Gold `#D9C5A0`) | Same design system and CSS custom properties |

### Admin routes

The admin SPA serves these pages, all under `/admin/`:

| Route | Page | Access |
|-------|------|--------|
| `/admin/login` | LoginPage | Public (unauthenticated) |
| `/admin/dashboard` | Dashboard | All roles |
| `/admin/audit` | AuditWorkbench | `super_admin`, `finance_reviewer` |
| `/admin/users/members` | MemberManagement | `super_admin`, `branch_admin` |
| `/admin/users/non-members` | NonMemberManagement | `super_admin`, `branch_admin` |
| `/admin/conferences` | ConferenceManagement | `super_admin`, `branch_admin` |
| `/admin/statistics` | Statistics | All roles |
| `/admin/finance` | FinanceRecords | `super_admin`, `finance_reviewer` |
| `/admin/branches` | BranchManagement | `super_admin` |
| `*` | NotFound (404) | Public |

`AdminLayout` wraps every page except LoginPage. It checks `canAccess(path)` on mount — if the role lacks access it shows an error toast and redirects to `/admin/dashboard`. If not logged in at all, it redirects to `/admin/login`. The layout shell consists of `AdminTopBar` + `AdminSidebar` + scrollable `<main>` content area.

**Key difference from website routing**: The admin App.tsx *always* wraps routes in `<Router>`, whereas the website returns bare routes (no Router wrapper) for non-hash builds. This is because the website also needs a router-free mode for its Express server SSR.

### Admin permissions model

Three built-in admin roles with route-level access control (`ROUTE_PERMISSIONS` in `AdminContext.tsx`):

| Role | Built-in account | Access |
|------|-----------------|--------|
| `super_admin` | `admin@paleontology.org.cn` / `admin123` | All routes (dashboard, audit, users, conferences, statistics, finance, branches) |
| `branch_admin` | `branch@gjzdw.org.cn` / `admin123` | Dashboard, conferences (scoped to their branch), statistics |
| `finance_reviewer` | `finance@paleontology.org.cn` / `admin123` | Dashboard, audit workbench, finance records |

`canAccess(path)` checks the route table; `getAllowedMenuItems()` returns only permitted sidebar items. Both are consumed by `AdminLayout` on every navigation.

### Cross-app navigation (combined deployment)

The two SPAs can be deployed together as a single app served from one origin. Cross-app links use simple `<a href>` tags (not wouter `<Link>`) to navigate between the admin and main site. Both apps support hash routing (`build:singlefile`), which is required for this combined mode to work from a `file://` protocol or a single Express server.

When deploying combined: build both projects with `build:singlefile`, serve from the website's Express server (or any static server), and use hash-based URLs for cross-app links (e.g., `/#/admin/login` → admin; `/#/` → main site).

### Shared constants (`shared/constants.ts`)

Both projects have a `shared/constants.ts` that is the source of truth for domain enums and maps. Each project's version has a slightly different `localStorage` key prefix (`paleo_` vs `paleo_admin_`) but otherwise identical structure:

- `BRANCH_MAP` / `VALID_BRANCH_IDS` — professional branch IDs and Chinese names
- `CONFERENCE_STATUS` / `MEMBERSHIP_STATUS` — two-stage payment/review status enums
- `CONFERENCE_FEE_MEMBER` — member-price map; non-member = member × 1.1
- `USER_TYPE` / `USER_TYPE_LABEL` — `regular` → `non_member` | `member`
- `MEMBERSHIP_FEE_CONFIG` — standard ¥200, student ¥100, corporate ¥5000

When modifying constants, update **both** projects' `shared/constants.ts`.

### Path aliases

Both projects use the same alias pattern in `vite.config.ts` and `tsconfig.json`:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

## Key Development Rules

- **Never** nest `<a>` inside `<Link>` — Link already renders an anchor.
- **Icons**: Material Symbols (`material-symbols-outlined` class) for UI chrome; `lucide-react` for component icons.
- **Toasts**: `sonner` only — never add react-toastify or @radix-ui/react-toast.
- **Select.Item**: Every `<Select.Item>` must have a non-empty `value` prop.
- **Fonts**: Add Google Font `<link>` tags in `client/index.html`, not via CSS `@import`.
- **Images/media**: Upload externally via Manus CLI; never store large files in `client/public/`.
- Both projects use `components.json` for shadcn/ui configuration.

## Agentic Workflow (`agentic/`)

The `agentic/` directory follows a structured phased development process:

```
agentic/
├── 00-mrd/           # Raw requirements, interview notes
├── 00-progress/      # Cross-session task progress snapshots
├── 01-prd/           # Structured PRDs and acceptance criteria
├── 02-design/        # Design docs (human high-fidelity + AI technical)
├── 03-api-docs/      # API documentation (for future backend work)
├── 04-code-changes/  # Code change records
├── 05-unit-test/     # Test cases and results
├── 06-code-review/   # Code review reports
├── 07-summary/       # Delivery summaries, knowledge base
├── 08-self-evolution/ # Process improvement retrospectives
├── AGENTIC-CODING-SPEC.md  # Full process specification
└── ARCHITECTURE-DECISIONS.md # Architecture decisions and business rules
```

When implementing features, reference the relevant phase documents and update them as work progresses.

## MCP Configuration

The project has a Stitch (Google) MCP server configured in `.mcp.json` providing `generate_screen_from_text` and `get_screen` for design-to-code generation. **Note**: This file contains a committed API key — treat it as a shared credential. Runtime permissions are set in `.claude/settings.local.json`.
