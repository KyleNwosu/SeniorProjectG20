## Domain Types Defined Inline With No Shared Type Module

**Category:** Architectural Debt

**Description:**
The two core domain types, `Task` and `Schedule`, are defined as private inline interfaces inside the individual components that first happen to use them. `Task` is declared inside `TaskBuilder.tsx` and `Schedule` inside `Scheduler.tsx` — neither is exported or shared. No `src/types/` directory exists. `Task.duration` is typed as `string` despite representing a numeric duration in seconds, meaning arithmetic on it requires an unsafe cast. No types exist for other core entities (`Robot`, `Command`, `RobotStatus`), leaving the data shape of the entire application undefined at the type level.

**Remediation Plan:**
- Create `src/types/index.ts` and move `Task` and `Schedule` interfaces there
- Fix `Task.duration` from `string` to `number` and update the corresponding input handler to use `valueAsNumber`
- Define `RobotStatusData`, `RobotCommand`, and `CommandAction` types in the same module in preparation for API integration
- Update all component imports to reference `src/types/` instead of local declarations
- Enable `"strict": true` in `tsconfig.app.json` after types are centralized so the compiler enforces them going forward
