# Technical Debt & Risk Analysis

This document summarizes individual contributions to the team's technical debt and risk analysis for the Amazon Connect Agent Supervisor Insights project.

### TD-05 Domain Types Defined Inline With No Shared Type Module

**Category:** Architectural Debt

**Description:**
The two core domain types, `Task` and `Schedule`, are defined as private inline interfaces inside the individual components that first happen to use them. `Task` is declared inside `TaskBuilder.tsx` and `Schedule` inside `Scheduler.tsx` — neither is exported or shared. No `src/types/` directory exists. `Task.duration` is typed as `string` despite representing a numeric duration in seconds, meaning arithmetic on it requires an unsafe cast. No types exist for other core entities (`Robot`, `Command`, `RobotStatus`), leaving the data shape of the entire application undefined at the type level.

**Remediation Plan:**
- Create `src/types/index.ts` and move `Task` and `Schedule` interfaces there
- Fix `Task.duration` from `string` to `number` and update the corresponding input handler to use `valueAsNumber`
- Define `RobotStatusData`, `RobotCommand`, and `CommandAction` types in the same module in preparation for API integration
- Update all component imports to reference `src/types/` instead of local declarations
- Enable `"strict": true` in `tsconfig.app.json` after types are centralized so the compiler enforces them going forward



### R-03: Command Injection Risk When Wiring to Real Hardware

**Area:** Security & Ethics

**Summary:**
User-controlled inputs in TaskBuilder and Scheduler have no validation and will eventually be forwarded to robot APIs, enabling malformed or malicious values to reach hardware.

**Evidence:**
- TaskBuilder.tsx:71-76 — duration field uses only min="1", a UI hint not enforced at runtime
- Scheduler.tsx — time and frequency inputs have no validation whatsoever
- package.json — Zod and React Hook Form are installed but applied to neither component

**Impact:**
- Out-of-range durations (zero, negative, Infinity) can cause undefined firmware behavior
- UI constraints are bypassable via browser DevTools or direct API calls
- No server-side guard exists to catch malformed values before they reach the robot

**Likelihood:** High  
**Severity:** High

**Key controls:**
- Define Zod schemas for Task and Schedule and apply via zodResolver
- Restrict duration to a positive integer with a defined max (e.g., 1–300 seconds)
- Restrict action values to the shared RobotCommand allowlist from R-02
- Mirror all validation server-side — never trust client-supplied command parameters

**Trust boundary:**
All user input must be validated against a schema before storage or dispatch — the UI is not a security boundary
