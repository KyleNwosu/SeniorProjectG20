## R-02: Inconsistent Command Semantics Across Components — Kyle

**Area:** Reliability / Hallucination

### Summary
`ControlPanel` and `TaskBuilder` use two different naming conventions for robot commands with no shared schema, making future AI edits likely to introduce mismatches.

### Evidence
- `ControlPanel.tsx` uses natural language: `"moving forward"`, `"turning left"`, `"stopped"`.
- `TaskBuilder.tsx` uses kebab-case: `"move-forward"`, `"turn-left"`, `"wait"`.
- No shared enum, constant, or type links the two command sets.

### Impact
- Both components cannot be wired to the same API endpoint without guessing the convention.
- AI edits may introduce new variants or typos that only fail at runtime.
- Command vocabularies don't match — `"wait"` and `"paused"` exist in only one component each.

### Likelihood
High

### Severity
Medium

### Key controls
- Create `src/types/commands.ts` with a single `RobotCommand` enum (or string union).
- Replace all raw command strings in both components with imports from that module.
- Validate command values with Zod before dispatching to any backend.

### Trust boundary
All robot command strings must reference the shared enum — no raw string literals in command handlers.

---

## TD-01: Hardcoded Robot Data & Simulated Command Handling — Kyle

**Category:** Architectural Debt

**Description:** Robot status is static, and control actions only trigger toast notifications. There is no backend, API layer, or device abstraction. `ControlPanel`, `TaskBuilder`, and `Scheduler` act only on local UI state and never send real commands.

**Remediation Plan:** Introduce an API (REST) for robot communication. Replace hardcoded status with data from that layer. Centralize command handling in a `RobotService` or `CommandService` that the UI calls instead of showing toasts directly.

