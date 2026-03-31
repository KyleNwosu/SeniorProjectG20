# Module 5: Sprint Execution - AI-Augmented Agile Sprint Deliverable

**Project:** Kinova Gen3 Robot Arm Control Interface  
**Repository:** KyleNwosu/SeniorProjectG20  
**Team Members:** Femi | Majeed | Kyle | Valentine | Mahalet  
**Sprint Date:** March 2026

---

## 1. Sprint Summary

This sprint focused on closing key gaps identified in the Kinova Gen3 Robot Arm Control Interface. The team executed one complete sprint cycle following Agile practices, with task assignments managed through the GitHub Projects board. AI tools (Cursor AI) were used in the implementation of all five backlog items.

### Sprint Goal

Improve system integration, developer experience, and code reliability by wiring unused subsystems (ROS joint states, dev proxy), connecting the scheduler to the backend, adding test coverage, and hardening error handling across the stack.

---

## 2. Completed Items

| ID | Task | Assignee | Description | AI Used? |
|----|------|----------|-------------|----------|
| SP-01 | Display ROS Joint States in UI | Femi | Wired the existing `useRosConnection` hook outputs (`rosStatus`, `jointStates`) into the Dashboard tab. Added a ROS connection status badge and a joint-state table showing real-time joint angles. | Yes (Cursor AI) |
| SP-02 | Implement Vite Dev Proxy | Majeed | Added a conditional proxy configuration in `vite.config.ts` that routes `/api`, `/health`, and `/ws` requests to the bridge URL when `VITE_DEV_PROXY=true`. Resolves cross-origin issues during local development. | Yes (Cursor AI) |
| SP-03 | Wire Scheduler to Backend | Kyle | Created a `POST /api/schedules` endpoint in FastAPI to persist schedules server-side. Updated the Scheduler component to sync with the backend and linked the Custom Sequence option to saved task sequences. | Yes (Cursor AI) |
| SP-04 | Add Unit Tests for Stores & Hooks | Valentine | Integrated Vitest as the test framework. Wrote unit tests for `useRobotStore`, `useTaskStore`, and `useScheduleStore`. Added a `test` script to `package.json`. | Yes (Cursor AI) |
| SP-05 | Improve Error Handling & 404 Page | Mahalet | Updated backend sequence execution to return proper HTTP errors for unknown actions instead of silently skipping. Restyled `NotFound.tsx` to match the app theme. Improved `useRobotCommandDispatcher` to show specific error messages on failure. | Yes (Cursor AI) |

---

## 3. Incomplete Items

All five sprint items were completed within the sprint window. No items remain incomplete. The following items have been identified as candidates for the next sprint:

- Real battery level integration (currently hardcoded to 100% in the backend)
- Play/pause functionality for sequence execution
- E2E tests with Playwright or Cypress
- Update README to reflect current architecture and backend structure

---

## 4. AI Tool Usage Summary

AI tools were used responsibly during implementation as required by the assignment. The team primarily used Cursor AI (Agent mode and Ask mode) for code generation, debugging, and codebase exploration.

| Task ID | Member | AI Tool | How AI Was Used |
|---------|--------|---------|-----------------|
| SP-01 | Femi | Cursor AI | Used to scaffold the joint-state visualization component and wire `rosStatus` into the Dashboard layout. |
| SP-02 | Majeed | Cursor AI | Used to generate the Vite proxy configuration and understand the env variable patterns. |
| SP-03 | Kyle | Cursor AI | Used to generate the FastAPI schedule endpoint and update the Zustand store to sync with the backend. |
| SP-04 | Valentine | Cursor AI | Used to set up Vitest configuration and generate initial test scaffolding for Zustand stores. |
| SP-05 | Mahalet | Cursor AI | Used to identify error handling gaps and generate improved error responses in backend routes. |

---

## 5. Requirements Traceability Matrix (RTM)

The table below maps each project requirement to the sprint backlog item that addresses it, its implementation status, and the source file(s) where the implementation lives.

| Req ID | Requirement | Sprint Item | Status | Implemented In |
|--------|-------------|-------------|--------|----------------|
| REQ-01 | System shall display real-time robot status | SP-01 | Completed | `RobotStatus.tsx`, `useRobotTelemetry.ts` |
| REQ-02 | System shall allow 6-DOF manual control | Pre-sprint | Completed | `ControlPanel.tsx`, `robotCommands.ts` |
| REQ-03 | System shall display ROS joint states | SP-01 | Completed | `Index.tsx`, `useRosConnection.ts` |
| REQ-04 | System shall support dev proxy for local development | SP-02 | Completed | `vite.config.ts` |
| REQ-05 | System shall persist and execute schedules | SP-03 | Completed | `Scheduler.tsx`, `backend/routes/schedules.py` |
| REQ-06 | System shall have automated test coverage | SP-04 | Completed | `*.test.ts` files, `vitest.config.ts` |
| REQ-07 | System shall handle errors gracefully | SP-05 | Completed | `NotFound.tsx`, `commands.py`, `robotApi.ts` |
| REQ-08 | System shall support task sequence building | Pre-sprint | Completed | `TaskBuilder.tsx`, `sequences.py` |
| REQ-09 | System shall report real battery levels | Backlog | Pending | `status.py` (hardcoded at 100) |
| REQ-10 | System shall support play/pause for sequences | Backlog | Pending | Not yet implemented |

**Full RTM:** [RTM.md](RTM.md) (also at https://github.com/KyleNwosu/SeniorProjectG20/blob/main/RTM.md once pushed)

---

## 6. GitHub Project Board

*(Insert screenshot of the GitHub Projects board below showing tasks in their final sprint state)*

