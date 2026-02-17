## Technical Debt Identification (Part 1)

### TD-01: Hardcoded Robot Data & Simulated Command Handling — Kyle

- **Category:** Architectural Debt  
- **Description:** Robot status is static, and control actions only trigger toast notifications. There is no backend, API layer, or device abstraction. `ControlPanel`, `TaskBuilder`, and `Scheduler` act only on local UI state and never send real commands.  
- **Remediation Plan:** Introduce an API (REST) for robot communication. Replace hardcoded status with data from that layer. Centralize command handling in a `RobotService` or `CommandService` that the UI calls instead of showing toasts directly.

---

### TD-02: No Shared State or Persistence Layer — Mahlet

- **Category:** Architectural Debt  
- **Description:** `TaskBuilder` and `Scheduler` use only component-local `useState`. Tasks and schedules are lost on navigation or refresh. `RobotStatus` does not share state with `ControlPanel`, so the status cannot reflect control actions. TanStack Query is installed but not used.  
- **Remediation Plan:** Introduce a shared state store for robot status, tasks, and schedules. Use `QueryClient` for data fetching and mutations so UI reflects and persists state across sessions.

---

### TD-03: No Automated Test Suite — Majeed

- **Category:** Test Debt  
- **Description:** There is no test script in `package.json`, and no unit or integration tests. Testing is limited to the manual checklist in the `README`. There is no automated validation of AI-generated components.  
- **Remediation Plan:** Add Vitest and React Testing Library. Add unit tests for `ControlPanel`, `TaskBuilder`, `Scheduler`, and `RobotStatus`. Add a `test` script (and CI run) to verify behavior and reduce risk when changing AI-generated code.

---

### TD-04: No Traceability to Agile Requirements — Majeed

- **Category:** Documentation Debt  
- **Description:** There are no user story IDs, requirement references, or backlog links in code or comments. Features like Dashboard, Control, Tasks, and Schedule cannot be traced back to their Agile requirements.  
- **Remediation Plan:** Add requirement IDs in JSDoc or comments. Maintain a simple requirements map (markdown or JSON) that links each feature to its source requirement.

---

### TD-05: Scattered Domain Types and Missing Type Module — Femi

- **Category:** Documentation Debt / Architectural Debt  
- **Description:** Tasks and schedules are defined inline in `TaskBuilder` and `Scheduler`. There is no shared domain model for Robot, Command, Task, Schedule, or Status. Types are not centralized and may diverge.  
- **Remediation Plan:** Add `src/types/` (or `src/models/`) with shared domain types. Replace inline interfaces with imports from this module to keep types consistent and reusable.

---

### TD-06: Minimal Inline Documentation and Inconsistent Project Identity — Valentine

- **Category:** Documentation Debt  
- **Description:** Core components have little or no JSDoc or inline documentation. `cursor_migration.md` refers to "informal-chat-tool" while `README.md` calls the project "RoboControl," causing inconsistent project identity.  
- **Remediation Plan:** Add JSDoc to public components and key functions. Standardize the project name to "RoboControl" in all docs. Document design decisions and non-obvious logic for future maintainers.

---

## Part 2: AI & System Risk Assessment

### R-01: No Verification of AI-Generated Behavior — Valentine

- **Area:** Reliability  
- **Description:** The codebase comes from Lovable.dev and is edited with Cursor. There are no automated tests. If the agents hallucinate or misimplement logic, there is nothing to detect it until manual testing or production.  
- **Severity:** High  
- **Mitigation (High):** Add automated tests and ensure critical flows (control commands, task execution, scheduler) are covered. Treat AI-generated code as untrusted until verified by tests and code review.

---

### R-02: Inconsistent Command Semantics — Kyle

- **Area:** Reliability  
- **Description:** `ControlPanel` uses labels like "moving forward", "turning left", "stopped", while `TaskBuilder` uses values like "move-forward", "turn-left". There is no shared enum or schema. Future AI edits may introduce more variants or typos that only appear at runtime.  
- **Severity:** Medium  
- **Mitigation (Medium):** Introduce a shared command taxonomy (e.g., `src/types/commands.ts`) and use it in both components. Validate command values with Zod or similar before they reach any backend or robot interface.

---

### R-03: Command Injection When Wiring to Real Robots — Femi

- **Area:** Security  
- **Description:** `TaskBuilder` and `Scheduler` accept user input (task names, durations, schedules) that could later be forwarded to robot APIs or devices. Without validation and sanitization, crafted input could cause unexpected or dangerous robot behavior.  
- **Severity:** High  
- **Mitigation (High):** Apply strict validation on all user input before it is stored or sent to a robot backend. Restrict actions and parameters to an allowlist. Treat any user-supplied data as untrusted.

---

### R-04: Shadcn/Radix Version Sensitivity — Mahlet

- **Area:** Dependency  
- **Description:** There are 25+ Radix UI packages and shadcn conventions. shadcn components often depend on specific Radix versions and structure. AI-generated or copied components may use outdated patterns and break after upgrades.  
- **Severity:** Medium  
- **Mitigation (Low):** Pin Radix and related UI versions and upgrade intentionally. Use `components.json` and the shadcn CLI to add/update components where possible. Avoid manual edits that diverge from shadcn’s intended usage.

