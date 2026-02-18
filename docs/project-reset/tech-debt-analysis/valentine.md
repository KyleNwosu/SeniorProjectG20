## TD-06. Minimal Inline Documentation and Inconsistent Project Identity

**Category:** Documentation Debt

**Description:** Core components have little or no JSDoc or inline documentation. `cursor_migration.md` refers to "informal-chat-tool" while `README.md` calls the project "RoboControl," causing inconsistent project identity.

**Remediation Plan:** Add JSDoc to public components and key functions. Standardize the project name to "RoboControl" in all docs. Document design decisions and non-obvious logic for future maintainers.

---

## R-01: No Verification of AI-Generated Behavior

**Area:** Reliability / Hallucination

### Summary
The entire codebase is AI-generated with no automated tests, meaning hallucinated or incorrect logic goes undetected until manual review or failure.

### Evidence
- `package.json` has no test script and no testing library installed.
- `README.md` lists a manual click-through checklist as the only QA process.
- All four feature components were scaffolded by Lovable.dev with zero test coverage.

### Impact
- Bugs in AI-generated state logic go undetected until runtime.
- No regression safety when modifying or extending components.
- No CI gate to block broken code from reaching `main`.

### Likelihood
High

### Severity
High

### Key controls
- Install Vitest and `@testing-library/react`, add a `test` script.
- Write unit tests for `TaskBuilder` and `Scheduler` state logic (add/remove/update items, input validation, edge cases).
- Add a GitHub Actions workflow to run tests on every push / pull request.
- Treat all AI-generated code as untrusted until test-covered and reviewed (minimum: smoke tests + targeted unit tests for new changes).

### Trust boundary
All AI-generated components require human test authorship before being considered verified.

