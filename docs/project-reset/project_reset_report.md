# Project Reset Report

**Project:** RoboControl
**Date:** February 3, 2026
**Team:**  G20

---

## Architecture Diagram

![Architecture Diagram](Swark%20Architecture.png)

---

## Architecture Explanation

The system is a client-only React application built around a single-page tabbed interface for robot monitoring and control. The entry point (main.tsx) renders App.tsx, which wraps the application in BrowserRouter, QueryClientProvider, TooltipProvider, Toaster, and Sonner providers. Routes resolve to either Index.tsx (the main dashboard) or a NotFound page. The dashboard presents four feature tabs — RobotStatus, ControlPanel, TaskBuilder, and Scheduler — each implemented as an independent component with its own local state. Shared UI is provided by vendored shadcn/ui components (Button, Input, Select, Label, Badge, Card) built on Radix primitives. User feedback is handled through a useToast hook backed by a ToastReducer, ToastState, and ToastActions chain. A utility module (utils.ts) provides common helpers. QueryClientProvider is mounted but TanStack Query is not used by any component. There is no backend API, no shared state store, and no data persistence — all robot data is hardcoded and all commands terminate at toast notifications.

---

## Technical Debt & Risk List (Summary)

### Critical

**TD-01 Hardcoded Robot Data & Simulated Command Handling:** Robot status is static and control actions only trigger toast notifications. No backend, API layer, or device abstraction exists. ControlPanel, TaskBuilder, and Scheduler act only on local UI state.

**TD-02 No Shared State or Persistence Layer:** TaskBuilder and Scheduler use only component-local useState. Tasks and schedules are lost on navigation or refresh. RobotStatus does not share state with ControlPanel. TanStack Query is installed but unused.

**TD-03 No Automated Test Suite:** No test script in package.json, no unit or integration tests. Testing is limited to a manual checklist. No automated validation of AI-generated components.

### High

**TD-04 No Traceability to Agile Requirements:** No user story IDs, requirement references, or backlog links in code or comments. Features cannot be traced back to their Agile requirements.

**TD-05 Scattered Domain Types and Missing Type Module:** Task and Schedule types are defined inline in individual components. No shared domain model exists for Robot, Command, Task, Schedule, or Status. Types may diverge.

### Medium

**TD-06 Minimal Inline Documentation and Inconsistent Project Identity:** Core components have no JSDoc or inline documentation. cursor_migration.md refers to "informal-chat-tool" while README uses "RoboControl," causing identity confusion.

---

## AI & System Risk Assessment

**R-01: No Verification of AI-Generated Behavior** — Likelihood: High | Severity: High
*Area: Reliability / Hallucination*
The entire codebase is AI-generated with no automated tests, meaning hallucinated or incorrect logic goes undetected until manual review or runtime failure. All four feature components were scaffolded by Lovable.dev with zero test coverage.
*Key controls:* Install Vitest and @testing-library/react. Write unit tests for TaskBuilder and Scheduler state logic. Add CI workflow to run tests on every push. Treat all AI-generated code as untrusted until test-covered and reviewed.

**R-02: Inconsistent Command Semantics Across Components** — Likelihood: High | Severity: Medium
*Area: Reliability / Hallucination*
ControlPanel uses natural language strings ("moving forward", "turning left") while TaskBuilder uses kebab-case ("move-forward", "turn-left"). No shared enum or type links the two sets, making future AI edits likely to introduce mismatches.
*Key controls:* Create src/types/commands.ts with a shared RobotCommand enum. Replace all raw command strings with imports from that module. Validate command values with Zod before dispatching.

**R-03: Command Injection Risk When Wiring to Real Hardware** — Likelihood: High | Severity: High
*Area: Security & Ethics*
User-controlled inputs in TaskBuilder and Scheduler have no validation. Duration uses only a min="1" HTML hint not enforced at runtime. Zod and React Hook Form are installed but applied to neither component. Malformed values could reach hardware when an API layer is introduced.
*Key controls:* Define Zod schemas for Task and Schedule. Restrict duration to a positive integer with a defined max. Restrict action values to a shared allowlist. Mirror all validation server-side.

**R-04: Shadcn/Radix Version Sensitivity and AI Pattern Drift** — Likelihood: Medium | Severity: Medium
*Area: Dependency Risk*
40+ vendored shadcn component files have no version record. 25+ @radix-ui packages have no pinned versions. AI-generated component additions may use a newer shadcn API incompatible with vendored files, with failures appearing only at runtime.
*Key controls:* Document the shadcn snapshot date. Always use the CLI to add/update components — never copy from AI output. Pin Radix versions and upgrade as a coordinated action.

---

## Backlog Health & Readiness Assessment

### Evidence of Review

- Technical debt items are explicitly identified and categorized (Architectural, Test, Documentation) with individual ownership assigned to team members (Kyle, Mahlet, Majeed, Femi, Valentine).
- Each debt item includes a detailed remediation plan with specific actions, file paths, and tool recommendations (Vitest, Zod, Zustand, TanStack Query).
- Risk items are assessed with structured fields — area, evidence citing exact file lines, impact analysis, likelihood/severity ratings, key controls, and trust boundaries.
- Cross-references exist between related items (e.g., R-02 command semantics links to TD-05 shared types; R-01 testing links to TD-03 test suite).

### Gaps / Risks

- No explicit dependency sequencing between debt items — for example, TD-05 (shared types) should be resolved before TD-01 (API layer) to avoid defining API contracts against divergent inline types, but this ordering is not documented.
- Risk items (R-01–R-04) are documented separately and not linked back to the backlog items or epics they block — a developer picking up a feature task would not see the associated risks.
- No priority or sprint fields are attached to any debt or risk item, making sprint planning dependent on tribal knowledge rather than backlog metadata.
- Acceptance criteria are implied in remediation plans but not written as testable checklists — for example, TD-02's remediation describes introducing a shared store but does not define what "done" looks like (e.g., "tasks persist across tab navigation").
- The two versions of each debt item (short-form and GitHub-detailed) are maintained separately, creating a risk of documentation drift as work progresses.

### Recommendations

- Add explicit dependency chains to debt items: TD-05 (shared types) → TD-01 (API layer) → TD-02 (shared state + persistence), so the team resolves foundational issues before building on them.
- Link each risk item to the backlog items it affects — e.g., tag R-03 (command injection) on any TaskBuilder or Scheduler feature work so validation is addressed before new inputs are added.
- Add priority labels (P0/P1/P2) and sprint targets to all debt and risk items so they can be scheduled alongside feature work rather than deferred indefinitely.
- Convert remediation plans into Definition of Done checklists with testable acceptance criteria — e.g., for TD-03: "Vitest installed, test script in package.json, ≥1 unit test per feature component, CI workflow passes on push to main."
- Consolidate the short-form and GitHub-detailed versions of each debt item into a single source of truth to prevent documentation drift as remediation progresses.

---

## Initial Senior Project II Priorities

1. **Establish test foundation (TD-03)**
   Set up Vitest + Testing Library, add test scripts, and cover core component logic and state behavior.

2. **Introduce service abstraction layer (TD-01)**
   Define a robotApi service module, refactor toast-only handlers into useMutation calls, and add API stubs to enable backend integration.

3. **Centralize shared state and persistence (TD-02)**
   Introduce a shared state store (Zustand or Context) for robot status, tasks, and schedules. Wire TanStack Query for data fetching once the API layer is in place.

4. **Consolidate domain types (TD-05)**
   Create src/types/ with shared interfaces for Robot, Command, Task, Schedule, and Status. Replace inline type definitions across components.

5. **Add CI quality gates (TD-03 + TD-05)**
   Add a GitHub Actions workflow running lint, build, and test on every push to main. Require passing checks before merge.
