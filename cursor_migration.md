# Cursor Migration: Lovable → Local Development

This document gives an overview of the **informal-chat-tool** codebase and step-by-step instructions to run it as a fully local project with no Lovable.dev dependencies.

---

## Codebase Overview

### What This App Is

**RoboControl** — A consumer robotics interface with:

- **Dashboard** — Robot status, battery, connectivity, and a direct control panel
- **Control** — Dedicated control view (same status + control panel)
- **Tasks** — Task builder for defining robot tasks
- **Schedule** — Scheduler for planned actions

The UI is tab-based (Dashboard, Control, Tasks, Schedule) with shared components across views.

### Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Build        | Vite 5                              |
| Language     | TypeScript                          |
| UI           | React 18                            |
| Styling      | Tailwind CSS + shadcn/ui (Radix)    |
| Routing      | React Router v6                     |
| Data/Forms   | TanStack Query, React Hook Form, Zod|
| Icons        | Lucide React                        |

### Project Structure

```
informal-chat-tool/
├── index.html              # Entry HTML (meta tags, root div, script to main.tsx)
├── vite.config.ts          # Vite config (port 8080, @ alias, React SWC)
├── tailwind.config.ts      # Tailwind + theme (CSS variables)
├── postcss.config.js       # PostCSS (Tailwind + Autoprefixer)
├── tsconfig.json           # TypeScript (paths @/* → ./src/*)
├── components.json         # shadcn/ui config (aliases, style)
├── public/
│   ├── robots.txt
│   └── placeholder.svg
└── src/
    ├── main.tsx            # React root (createRoot, App, index.css)
    ├── App.tsx             # App shell: QueryClient, TooltipProvider, Toaster, Router, Routes
    ├── index.css           # Global styles + Tailwind
    ├── vite-env.d.ts       # Vite client types
    ├── lib/
    │   └── utils.ts        # cn() and other helpers
    ├── hooks/
    │   ├── use-toast.ts    # Toast hook
    │   └── use-mobile.tsx  # Mobile breakpoint hook
    ├── pages/
    │   ├── Index.tsx       # Main page: header + tabs (Dashboard, Control, Tasks, Schedule)
    │   └── NotFound.tsx    # 404 route
    └── components/
        ├── RobotStatus.tsx   # Status card (Active, Battery, Connectivity)
        ├── ControlPanel.tsx  # Direct control (arrows, play/pause, etc.)
        ├── TaskBuilder.tsx   # Task creation UI
        ├── Scheduler.tsx     # Schedule UI
        └── ui/               # shadcn/ui primitives (button, card, tabs, etc.)
```

### Key Files

- **`src/App.tsx`** — Wraps app with `QueryClientProvider`, `TooltipProvider`, toasters, and `BrowserRouter`. Defines routes: `/` → `Index`, `*` → `NotFound`.
- **`src/pages/Index.tsx`** — Single-page layout: header (“RoboControl”), then tabs with `RobotStatus`, `ControlPanel`, `TaskBuilder`, `Scheduler`.
- **`vite.config.ts`** — Dev server on port 8080, `@` → `./src`, React SWC plugin. (Lovable’s `lovable-tagger` has been removed.)
- **`components.json`** — shadcn/ui schema (style, Tailwind paths, `@/components`, `@/lib`, etc.). No Lovable reference.

### Path Aliases

- `@/*` → `./src/*` (from `tsconfig.json` and `vite.config.ts`)
- Used for imports like `@/components/...`, `@/lib/utils`, `@/hooks/...`, `@/pages/...`.

---

## Lovable Dependencies (Removed)

The project was generated/edited on Lovable.dev. These were the only Lovable-specific pieces:

| Location        | What it was | Purpose |
| --------------- | ----------- | ------- |
| `vite.config.ts`| `lovable-tagger` plugin | Injected component tagging in dev for Lovable’s editor integration |
| `package.json`  | Dev dependency `lovable-tagger` | NPM package for the plugin above |
| `index.html`    | Meta tags (description, author, og:*, twitter:*) | “Lovable Generated Project”, Lovable URLs and branding |

No other files (e.g. `App.tsx`, router, or app logic) depended on Lovable. The app is standard Vite + React + shadcn.

---

## Step-by-Step: Disconnect Lovable & Run Locally

Follow these steps to ensure the project has no Lovable dependencies and runs in a local development environment.

### 1. Remove the Lovable Vite plugin

- **File:** `vite.config.ts`
- **Change:** Remove the `lovable-tagger` import and the `componentTagger()` plugin. Use a plain `defineConfig({ ... })` (no `mode`-based plugin array).
- **Result:** Config should only use `react()` and your existing `server` / `resolve` settings.

### 2. Remove the Lovable npm package

- **File:** `package.json`
- **Change:** In `devDependencies`, delete the line `"lovable-tagger": "^1.1.11"` (and the comma that belonged to the previous dependency).
- **Result:** No references to `lovable-tagger` in the project.

### 3. Update HTML meta tags (optional but recommended)

- **File:** `index.html`
- **Change:** Replace Lovable-specific meta tags:
  - `description` / `og:description`: e.g. “RoboControl - Consumer Robotics Interface”
  - `author`: set to your name or leave empty
  - Remove `og:image` and `twitter:image` if they pointed to lovable.dev, or point them to your own image.
  - Remove or change `twitter:site` if it was `@lovable_dev`.
- **Result:** No Lovable branding or URLs in the HTML.

### 4. Install dependencies and run

From the project root:

```sh
# Install dependencies (updates lockfile after removing lovable-tagger)
npm install

# Start the development server (Vite, port 8080)
npm run dev
```

- **Expected:** App runs at `http://localhost:8080` (or the URL Vite prints) with no Lovable plugin or runtime dependency.

### 5. Verify

- Open the app in the browser; use all four tabs (Dashboard, Control, Tasks, Schedule).
- Confirm there are no console errors and no network requests to Lovable.
- Optional: run `npm run build` and `npm run preview` to confirm production build works.

---

## Quick Reference: Local Development

| Command           | Purpose                    |
| ----------------- | -------------------------- |
| `npm install`     | Install dependencies       |
| `npm run dev`     | Start dev server (port 8080) |
| `npm run build`   | Production build           |
| `npm run preview` | Preview production build   |
| `npm run lint`    | Run ESLint                 |

**Requirements:** Node.js and npm (or use nvm for install/version management).

---

## Optional: Update README

The current `README.md` is Lovable-centric (project URL, “Use Lovable”, “Share → Publish”, custom domain via Lovable). You can replace or trim it to describe:

- Project name and purpose (e.g. RoboControl / informal-chat-tool)
- Local setup: `npm install` and `npm run dev`
- Tech stack (Vite, React, TypeScript, shadcn, Tailwind)
- How to build and deploy on your own (e.g. static host, or your backend)

That keeps the repo self-contained and independent of Lovable.

---

*This migration was applied so the app runs fully in a local development environment and in Cursor with no Lovable dependencies.*
