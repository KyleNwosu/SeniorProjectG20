## TD-02: No Shared State or Persistence Layer — Mahlet

**Category:** Architectural Debt

**Description:** `TaskBuilder` and `Scheduler` use only component-local `useState`. Tasks and schedules are lost on navigation or refresh. `RobotStatus` does not share state with `ControlPanel`, so the status cannot reflect control actions. TanStack Query is installed but not used.

**Remediation Plan:** Introduce a shared state store for robot status, tasks, and schedules. Use `QueryClient` and TanStack Query for data fetching and mutations so the UI reflects and persists state across sessions.

---

## R-04: Shadcn/Radix Version Sensitivity and AI Pattern Drift — Mahlet

**Area:** Dependency Risk

### Summary
Vendored shadcn/ui components have no version tracking, and 25+ Radix packages have no pinned versions, making AI-assisted upgrades likely to introduce silent breaking changes.

### Evidence
- `src/components/ui/` contains 40+ vendored shadcn component files with no version record.
- `package.json` lists 25+ `@radix-ui/*` packages without pinned versions.
- `components.json` locks component aliases but does not track the shadcn snapshot date.

### Impact
- AI-generated component additions may use a newer shadcn API incompatible with vendored files.
- An uncoordinated Radix upgrade can silently break multiple components at once.
- No compiler error is produced — failures appear only at runtime.

### Likelihood
Medium

### Severity
Medium

### Key controls
- Document the shadcn snapshot date and version set in the `README`.
- Always use `npx shadcn@latest add` to add or update components — never copy components directly from AI output.
- Pin Radix UI versions and upgrade them as a deliberate coordinated action.
- Treat `src/components/ui/` as generated output — do not hand-edit or patch via AI.

### Trust boundary
UI component changes require CLI-driven updates, not manual or AI-generated edits.

