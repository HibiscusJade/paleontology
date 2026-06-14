# 中国古生物学会后台管理系统 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete admin backend SPA (PaleontologicalResearchAdminFront) with three-tier role-based access control, two-stage audit workflow, member/conference/branch management, and statistics dashboard — all backed by localStorage for prototype phase.

**Architecture:** Independent Vite + React 19 project at `D:\Paleontology\paleontology-admin-latest\`, sharing design tokens and business constants with the main project via file copy. Single AdminContext provides auth, role resolution, and all business operations. AdminLayout shell (TopBar + Sidebar) wraps role-filtered page routes. All data reads/writes the same `paleo_*` localStorage keys as the main project.

**Tech Stack:** React 19, Vite 7, TypeScript 5.6, Tailwind CSS 4, shadcn/ui (New York), wouter, recharts, react-hook-form + zod, framer-motion, sonner, lucide-react

---

## File Structure

```
paleontology-admin-latest/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── components.json
├── index.html
├── .prettierrc
├── .prettierignore
├── .gitignore
├── shared/
│   ├── constants.ts          # Copied from main project
│   └── const.ts              # Copied from main project
├── client/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css          # Tailwind + design tokens
│       ├── lib/
│       │   └── utils.ts       # cn() utility
│       ├── contexts/
│       │   └── AdminContext.tsx
│       ├── components/
│       │   ├── AdminLayout.tsx
│       │   ├── AdminTopBar.tsx
│       │   ├── AdminSidebar.tsx
│       │   └── ui/            # shadcn/ui (per-component copies)
│       │       ├── button.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── table.tsx
│       │       ├── tabs.tsx
│       │       ├── select.tsx
│       │       ├── badge.tsx
│       │       ├── sheet.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── checkbox.tsx
│       │       ├── separator.tsx
│       │       ├── tooltip.tsx
│       │       ├── avatar.tsx
│       │       ├── form.tsx
│       │       ├── textarea.tsx
│       │       ├── skeleton.tsx
│       │       ├── spinner.tsx
│       │       ├── pagination.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── popover.tsx
│       │       ├── scroll-area.tsx
│       │       └── sonner.tsx
│       └── pages/
│           └── admin/
│               ├── LoginPage.tsx
│               ├── Dashboard.tsx
│               ├── AuditWorkbench.tsx
│               ├── MemberManagement.tsx
│               ├── ConferenceManagement.tsx
│               ├── Statistics.tsx
│               ├── FinanceRecords.tsx
│               ├── BranchManagement.tsx
│               └── NotFound.tsx
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `D:\Paleontology\paleontology-admin-latest\package.json`
- Create: `D:\Paleontology\paleontology-admin-latest\vite.config.ts`
- Create: `D:\Paleontology\paleontology-admin-latest\tsconfig.json`
- Create: `D:\Paleontology\paleontology-admin-latest\tsconfig.node.json`
- Create: `D:\Paleontology\paleontology-admin-latest\components.json`
- Create: `D:\Paleontology\paleontology-admin-latest\index.html`
- Create: `D:\Paleontology\paleontology-admin-latest\.prettierrc`
- Create: `D:\Paleontology\paleontology-admin-latest\.prettierignore`
- Create: `D:\Paleontology\paleontology-admin-latest\.gitignore`
- Create: `D:\Paleontology\paleontology-admin-latest\client\src\main.tsx`
- Create: `D:\Paleontology\paleontology-admin-latest\client\src\index.css`

- [ ] **Step 1: Create project directory structure**

```bash
mkdir -p "D:\Paleontology\paleontology-admin-latest\shared"
mkdir -p "D:\Paleontology\paleontology-admin-latest\client\src\lib"
mkdir -p "D:\Paleontology\paleontology-admin-latest\client\src\contexts"
mkdir -p "D:\Paleontology\paleontology-admin-latest\client\src\components\ui"
mkdir -p "D:\Paleontology\paleontology-admin-latest\client\src\pages\admin"
```

- [ ] **Step 2: Write package.json**

```json
{
  "name": "paleontology-admin",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview --host",
    "check": "tsc --noEmit",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.23.22",
    "lucide-react": "^0.453.0",
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "react-hook-form": "^7.64.0",
    "recharts": "^2.15.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.3.5",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.3",
    "@types/react": "^19.2.1",
    "@types/react-dom": "^19.2.1",
    "@vitejs/plugin-react": "^5.0.4",
    "prettier": "^3.6.2",
    "tailwindcss": "^4.1.14",
    "tw-animate-css": "^1.4.0",
    "typescript": "5.6.3",
    "vite": "^7.1.7"
  }
}
```

- [ ] **Step 3: Write vite.config.ts**

```typescript
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    host: true,
  },
});
```

- [ ] **Step 4: Write tsconfig.json**

```json
{
  "include": ["client/src/**/*", "shared/**/*"],
  "exclude": ["node_modules", "dist"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/typescript/tsbuildinfo",
    "noEmit": true,
    "module": "ESNext",
    "strict": true,
    "lib": ["esnext", "dom", "dom.iterable"],
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

- [ ] **Step 5: Write tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Write components.json**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "client/src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 7: Write index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>中国古生物学会 · 管理后台</title>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&family=Hanken+Grotesk:wght@400;600;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Write config files (.prettierrc, .prettierignore, .gitignore)**

`.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "proseWrap": "preserve"
}
```

`.prettierignore`:
```
node_modules
dist
.git
```

`.gitignore`:
```
node_modules
dist
.vite
*.local
```

- [ ] **Step 9: Write client/src/index.css**

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-strata-blue-deep: #002B49;
  --color-party-red: #C41E3A;
  --color-party-red-dark: #8B0000;
  --color-accent-gold: #D9C5A0;
  --color-paper-bright: #FCFAF7;
  --color-fossil-stone: #E5E1DA;
}

:root {
  --primary: #002B49;
  --primary-foreground: #ffffff;
  --background: #FCFAF7;
  --foreground: #1a1c1e;
  --card: #ffffff;
  --card-foreground: #1a1c1e;
  --popover: #ffffff;
  --popover-foreground: #1a1c1e;
  --secondary: #715a3e;
  --secondary-foreground: #ffffff;
  --muted: #f4f3f6;
  --muted-foreground: #42474d;
  --accent: #fdddba;
  --accent-foreground: #002b49;
  --destructive: #ba1a1a;
  --destructive-foreground: #ffffff;
  --border: #E5E1DA;
  --input: #E5E1DA;
  --ring: #406182;
  --radius: 0.25rem;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased min-h-screen flex flex-col;
  }
}

@layer utilities {
  .party-gradient {
    background: linear-gradient(135deg, #C41E3A 0%, #8B0000 100%);
  }
  .party-card-border {
    border-top: 3px solid #C41E3A;
  }
  .party-text {
    color: #C41E3A;
  }
}
```

- [ ] **Step 10: Write client/src/main.tsx**

```typescript
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

- [ ] **Step 11: Install dependencies**

```bash
cd D:\Paleontology\paleontology-admin-latest && pnpm install
```

Expected: Dependencies install without errors.

- [ ] **Step 12: Commit**

```bash
git add D:\Paleontology\paleontology-admin-latest\package.json D:\Paleontology\paleontology-admin-latest\vite.config.ts D:\Paleontology\paleontology-admin-latest\tsconfig.json D:\Paleontology\paleontology-admin-latest\tsconfig.node.json D:\Paleontology\paleontology-admin-latest\components.json D:\Paleontology\paleontology-admin-latest\index.html D:\Paleontology\paleontology-admin-latest\.prettierrc D:\Paleontology\paleontology-admin-latest\.prettierignore D:\Paleontology\paleontology-admin-latest\.gitignore D:\Paleontology\paleontology-admin-latest\client\src\main.tsx D:\Paleontology\paleontology-admin-latest\client\src\index.css D:\Paleontology\paleontology-admin-latest\pnpm-lock.yaml
git commit -m "feat: scaffold admin project with Vite + React + Tailwind config"
```

---

### Task 2: Copy Shared Code

**Files:**
- Copy: `shared/constants.ts`, `shared/const.ts` from main project
- Create: `client/src/lib/utils.ts`

- [ ] **Step 1: Copy shared files from main project**

```bash
cp "D:\Paleontology\paleontology-website-latest\shared\constants.ts" "D:\Paleontology\paleontology-admin-latest\shared\constants.ts"
cp "D:\Paleontology\paleontology-website-latest\shared\const.ts" "D:\Paleontology\paleontology-admin-latest\shared\const.ts"
```

- [ ] **Step 2: Write client/src/lib/utils.ts**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: copy shared constants and utility functions"
```

---

### Task 3: Copy shadcn/ui Components

**Files:** Copy 22 shadcn/ui `.tsx` files from main project

- [ ] **Step 1: Copy all needed component files**

```bash
SRC="D:\Paleontology\paleontology-website-latest\client\src\components\ui"
DST="D:\Paleontology\paleontology-admin-latest\client\src\components\ui"
for f in button input label card dialog table tabs select badge sheet dropdown-menu checkbox separator tooltip avatar form textarea skeleton pagination alert-dialog popover scroll-area sonner; do
  cp "$SRC/$f.tsx" "$DST/$f.tsx"
done
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: copy shadcn/ui components from main project"
```

---

### Task 4: AdminContext Types (full file)

**Files:**
- Create: `D:\Paleontology\paleontology-admin-latest\client\src\contexts\AdminContext.tsx`

This is the central context file (~500 lines). Write the complete file with:
- All type definitions (AdminUser, AdminRole, ReviewItem, MemberRecord, ConferenceRecord, BranchRecord, DashboardStats, etc.)
- Built-in admin accounts
- Route permission matrix
- Full AdminProvider with auth, permissions, audit, member management, conference management, statistics, branch management, finance records, notifications

Commit after writing.

---

### Task 5: AdminLayout Components

**Files:**
- Create: `client/src/components/AdminTopBar.tsx`
- Create: `client/src/components/AdminSidebar.tsx`
- Create: `client/src/components/AdminLayout.tsx`

`AdminTopBar.tsx` — Top bar with logo "中国古生物学会 · 管理后台", notification bell (red badge for unread), user avatar dropdown (role label, logout). Height h-14, bg-strata-blue-deep, white text.

`AdminSidebar.tsx` — 56px-wide sidebar with: admin info card (avatar initial, name, role badge), nav menu items filtered by role (active item shows gold left border + gold text), logout button at bottom.

`AdminLayout.tsx` — Full-screen layout: AdminTopBar on top, AdminSidebar + scrollable main content below. Guards: redirect to /admin/login if not logged in, redirect to /admin/dashboard if no route access.

---

### Task 6: LoginPage

**Files:**
- Create: `client/src/pages/admin/LoginPage.tsx`

Centered card on deep blue background. Logo + "中国古生物学会 · 管理后台" heading. Email + password form using react-hook-form + zod. No registration link. Login fails → toast error. Login succeeds → navigate to /admin/dashboard. If already logged in, redirect to /admin/dashboard.

---

### Task 7: Dashboard Page

**Files:**
- Create: `client/src/pages/admin/Dashboard.tsx`

Three role-based views:

**Super admin:** 4 stat cards (total members, active members, pending reviews, active conferences) + recent reviews table (5 rows) + branch member count bar chart (recharts BarChart).

**Branch admin:** 3 stat cards (branch conferences, registrations, pending reviews) + branch member count card.

**Finance reviewer:** 4 stat cards (pending voucher, pending invoice, processed today, overdue) + pie chart (pass rates) + recent reviews.

Stat cards use framer-motion for entrance animation. Charts use recharts with Strata & Heritage colors.

---

### Task 8: AuditWorkbench Page

**Files:**
- Create: `client/src/pages/admin/AuditWorkbench.tsx`

Two tabs: "凭证初审" (voucher review) and "发票终审" (invoice review).

Each tab has:
- Summary stats row
- Action bar: Select All, Batch Approve, Batch Reject buttons
- Data table: checkbox | user | name | type | amount | submit time | file preview | status | actions

Voucher tab actions: Approve / Reject (with reason dialog)
Invoice tab actions: Approve / Reject (with reason dialog) / Extend Deadline (date picker + reason dialog)
Batch operations call AdminContext batch functions.

File preview: clickable thumbnail opens shadcn Dialog with full-size image.

---

### Task 9: MemberManagement Page

**Files:**
- Create: `client/src/pages/admin/MemberManagement.tsx`

Search/filter bar: text search (email/name), status dropdown (9 statuses), branch dropdown.

Member table: email | name | unit | status badge | branch | expiry | actions.
Status badges use the same 9-color system as the main project.
Pagination with shadcn Pagination component.

Actions: [View Detail] opens Sheet with full profile + payment history + notifications. [Disable/Enable] toggle with AlertDialog confirmation. [Manual Activate] button for non-member/expired members.

---

### Task 10: ConferenceManagement Page

**Files:**
- Create: `client/src/pages/admin/ConferenceManagement.tsx`

Conference cards grid (super admin sees all, branch admin sees own branch only).
Each card: name, branch, status badge (draft/published), registration count, action buttons.

[New Conference] button opens Dialog form: name, branch select, dates, location, member price, non-member price (auto = member × 1.1), payment deadline, abstract deadline, sessions (dynamic add/remove), status (draft/published).

Edit button opens same form pre-filled.

---

### Task 11: Statistics Page

**Files:**
- Create: `client/src/pages/admin/Statistics.tsx`

Super admin view:
- Membership fee stats: current year paid count/amount/transactions, cumulative
- Branch binding bar chart + pie chart (recharts)
- Conference fee stats table by branch × conference
- Two-stage audit stats: pass rate, avg review time, overdue recovery rate

Branch admin view (filtered to own branch):
- Branch conference registration stats
- Branch binding trend

Export buttons (placeholder: toast "导出功能将在第二期实现").

---

### Task 12: FinanceRecords Page

**Files:**
- Create: `client/src/pages/admin/FinanceRecords.tsx`

Filter bar: type (membership/conference), status, date range.

Payment records table: record ID | user | type | amount | status | voucher submit time | invoice submit time | audit time | actions.

Actions: [View Detail] shows full audit trail + file links. Manual deadline extension entry point.

---

### Task 13: BranchManagement Page

**Files:**
- Create: `client/src/pages/admin/BranchManagement.tsx`

11 branch cards in a grid. Each card: name, description, member count, disabled status badge.

Edit button opens Dialog: edit name, description, upload logo (placeholder), assign branch admin email.

Toggle Disable/Enable with AlertDialog confirmation.

---

### Task 14: NotFound Page + App.tsx + main.tsx Wiring

**Files:**
- Create: `client/src/pages/admin/NotFound.tsx`
- Create: `client/src/App.tsx`

`NotFound.tsx` — Simple 404 page with "页面未找到" message and "返回仪表盘" button.

`App.tsx` — Providers wrapping (ErrorBoundary → AdminProvider → TooltipProvider → Toaster → Router) with routes:

```typescript
import { Router, Route, Switch } from "wouter";
import { AdminProvider } from "@/contexts/AdminContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import AdminLayout from "@/components/AdminLayout";
import LoginPage from "@/pages/admin/LoginPage";
import Dashboard from "@/pages/admin/Dashboard";
import AuditWorkbench from "@/pages/admin/AuditWorkbench";
import MemberManagement from "@/pages/admin/MemberManagement";
import ConferenceManagement from "@/pages/admin/ConferenceManagement";
import Statistics from "@/pages/admin/Statistics";
import FinanceRecords from "@/pages/admin/FinanceRecords";
import BranchManagement from "@/pages/admin/BranchManagement";
import NotFound from "@/pages/admin/NotFound";

function App() {
  return (
    <AdminProvider>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Switch>
            <Route path="/admin/login" component={LoginPage} />
            <Route path="/admin/dashboard">
              <AdminLayout><Dashboard /></AdminLayout>
            </Route>
            <Route path="/admin/audit">
              <AdminLayout><AuditWorkbench /></AdminLayout>
            </Route>
            <Route path="/admin/members">
              <AdminLayout><MemberManagement /></AdminLayout>
            </Route>
            <Route path="/admin/conferences">
              <AdminLayout><ConferenceManagement /></AdminLayout>
            </Route>
            <Route path="/admin/statistics">
              <AdminLayout><Statistics /></AdminLayout>
            </Route>
            <Route path="/admin/finance">
              <AdminLayout><FinanceRecords /></AdminLayout>
            </Route>
            <Route path="/admin/branches">
              <AdminLayout><BranchManagement /></AdminLayout>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Router>
      </TooltipProvider>
    </AdminProvider>
  );
}

export default App;
```

`main.tsx` already written in Task 1. Verify it imports App and index.css correctly.

---

### Task 15: Final Verification

- [ ] **Step 1: Type check**

```bash
cd D:\Paleontology\paleontology-admin-latest && pnpm check
```

Expected: No TypeScript errors.

- [ ] **Step 2: Dev server smoke test**

```bash
cd D:\Paleontology\paleontology-admin-latest && pnpm dev
```

Open browser to http://localhost:3001/admin/login. Verify:
- Login with admin@paleontology.org.cn / admin123 → see full super admin menu
- Login with branch@gjzdw.org.cn / admin123 → see branch admin menu (3 items)
- Login with finance@paleontology.org.cn / admin123 → see finance reviewer menu (3 items)
- Each page renders without console errors
- Audit operations update localStorage correctly

- [ ] **Step 3: Final commit**

```bash
git add -A && git commit -m "feat: complete admin backend MVP implementation"
```

