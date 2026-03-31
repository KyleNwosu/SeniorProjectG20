# Requirements Traceability Matrix (RTM)

**Project:** Kinova Gen3 Robot Arm Control Interface  
**Repository:** KyleNwosu/SeniorProjectG20  
**Last Updated:** March 2026

---

## Functional Requirements


| Req ID | Requirement                                                                    | Priority | Sprint Item | Status    | Implemented In                                                                               | Tested?   |
| ------ | ------------------------------------------------------------------------------ | -------- | ----------- | --------- | -------------------------------------------------------------------------------------------- | --------- |
| FR-01  | System shall display real-time robot operational status (idle, moving, error)  | High     | Pre-sprint  | Completed | `src/components/RobotStatus.tsx`, `src/store/useRobotStore.ts`                               | Manual    |
| FR-02  | System shall display robot battery level                                       | High     | Pre-sprint  | Completed | `src/components/RobotStatus.tsx`                                                             | Manual    |
| FR-03  | System shall show robot connection state (connected, disconnected, connecting) | High     | Pre-sprint  | Completed | `src/components/RobotStatus.tsx`, `src/hooks/useRobotTelemetry.ts`                           | Manual    |
| FR-04  | System shall allow 6-DOF manual control (translate + rotate)                   | High     | Pre-sprint  | Completed | `src/components/ControlPanel.tsx`, `src/constants/robotCommands.ts`                          | Manual    |
| FR-05  | System shall send twist commands to the robot arm via the FastAPI bridge       | High     | Pre-sprint  | Completed | `src/services/robotApi.ts`, `backend/routes/commands.py`                                     | Manual    |
| FR-06  | System shall provide a Home command to return the arm to its home position     | High     | Pre-sprint  | Completed | `src/components/ControlPanel.tsx`, `backend/robot/commands.py`                               | Manual    |
| FR-07  | System shall provide an emergency Stop command                                 | High     | Pre-sprint  | Completed | `src/components/ControlPanel.tsx`, `backend/robot/commands.py`                               | Manual    |
| FR-08  | System shall support gripper open/close control                                | High     | Pre-sprint  | Completed | `src/components/ControlPanel.tsx`, `backend/robot/commands.py`                               | Manual    |
| FR-09  | System shall allow users to build task sequences (action + duration steps)     | Medium   | Pre-sprint  | Completed | `src/components/TaskBuilder.tsx`, `src/store/useTaskStore.ts`                                | Manual    |
| FR-10  | System shall execute task sequences on the robot via the backend               | Medium   | Pre-sprint  | Completed | `src/components/TaskBuilder.tsx`, `backend/routes/sequences.py`, `backend/robot/commands.py` | Manual    |
| FR-11  | System shall persist task sequences in local storage                           | Medium   | Pre-sprint  | Completed | `src/store/useTaskStore.ts` (Zustand persist, key: `task-storage`)                           | Manual    |
| FR-12  | System shall allow users to create, edit, and delete scheduled tasks           | Medium   | Pre-sprint  | Completed | `src/components/Scheduler.tsx`, `src/store/useScheduleStore.ts`                              | Manual    |
| FR-13  | System shall persist schedules in local storage                                | Medium   | Pre-sprint  | Completed | `src/store/useScheduleStore.ts` (Zustand persist, key: `schedule-storage`)                   | Manual    |
| FR-14  | System shall stream live telemetry from robot via WebSocket                    | High     | Pre-sprint  | Completed | `src/hooks/useRobotTelemetry.ts`, `backend/routes/websocket.py`                              | Manual    |
| FR-15  | System shall auto-reconnect WebSocket after disconnection                      | Medium   | Pre-sprint  | Completed | `src/hooks/useRobotTelemetry.ts` (3s retry)                                                  | Manual    |
| FR-16  | System shall display ROS joint states in the dashboard                         | Medium   | SP-01       | Completed | `src/pages/Index.tsx`, `src/hooks/useRosConnection.ts`, `src/services/rosApi.ts`             | Manual    |
| FR-17  | System shall proxy API requests in dev mode to avoid CORS issues               | Low      | SP-02       | Completed | `vite.config.ts`, `.env.example` (`VITE_DEV_PROXY`)                                          | Manual    |
| FR-18  | System shall persist schedules to the backend server                           | Medium   | SP-03       | Completed | `src/components/Scheduler.tsx`, `backend/routes/schedules.py`                                | Manual    |
| FR-19  | System shall have automated unit tests for state stores                        | Medium   | SP-04       | Completed | `*.test.ts`, `vitest.config.ts`                                                              | Automated |
| FR-20  | System shall return proper HTTP errors for unknown sequence actions            | Medium   | SP-05       | Completed | `backend/robot/commands.py`, `backend/routes/sequences.py`                                   | Manual    |
| FR-21  | System shall display a themed 404 page for unknown routes                      | Low      | SP-05       | Completed | `src/pages/NotFound.tsx`                                                                     | Manual    |
| FR-22  | System shall show specific error messages when commands fail                   | Medium   | SP-05       | Completed | `src/hooks/useRobotCommandDispatcher.ts`                                                     | Manual    |
| FR-23  | System shall report real battery levels from the robot                         | Medium   | Backlog     | Pending   | `backend/routes/status.py` (currently hardcoded to 100)                                      | --        |
| FR-24  | System shall support play/pause during sequence execution                      | Low      | Backlog     | Pending   | Not yet implemented                                                                          | --        |
| FR-25  | System shall have end-to-end tests for critical user flows                     | Low      | Backlog     | Pending   | Not yet implemented                                                                          | --        |


---

## Non-Functional Requirements


| Req ID | Requirement                                                                   | Priority | Status    | Notes                                                                  |
| ------ | ----------------------------------------------------------------------------- | -------- | --------- | ---------------------------------------------------------------------- |
| NFR-01 | UI shall be responsive and work on tablet-sized screens                       | Medium   | Partial   | `use-mobile.tsx` hook exists but not widely used in layouts            |
| NFR-02 | UI shall use a consistent design system                                       | High     | Completed | shadcn/ui + Tailwind CSS + Radix primitives throughout                 |
| NFR-03 | Backend shall connect to the Kinova arm on startup and disconnect on shutdown | High     | Completed | `backend/main.py` (lifespan), `backend/robot/session.py`               |
| NFR-04 | Backend shall support CORS for frontend dev server                            | High     | Completed | `backend/main.py` (`allow_origins=["*"]`)                              |
| NFR-05 | System shall use environment variables for all configurable endpoints         | High     | Completed | `.env.example`, `vite.config.ts`, `backend/robot/session.py`           |
| NFR-06 | WebSocket telemetry shall update at ~500ms intervals                          | Medium   | Completed | `backend/routes/websocket.py`                                          |
| NFR-07 | System shall use TypeScript for type safety across the frontend               | High     | Completed | `tsconfig.json`, `src/types/index.ts`                                  |
| NFR-08 | State management shall be centralized via Zustand stores                      | High     | Completed | `src/store/useRobotStore.ts`, `useTaskStore.ts`, `useScheduleStore.ts` |


---

## Traceability: Sprint Items to Requirements


| Sprint Item                              | Requirements Covered |
| ---------------------------------------- | -------------------- |
| SP-01: Display ROS Joint States in UI    | FR-16                |
| SP-02: Implement Vite Dev Proxy          | FR-17                |
| SP-03: Wire Scheduler to Backend         | FR-18                |
| SP-04: Add Unit Tests for Stores & Hooks | FR-19                |
| SP-05: Improve Error Handling & 404 Page | FR-20, FR-21, FR-22  |


---

## Traceability: Requirements to Source Files


| Req ID | Frontend Files                                                                   | Backend Files                                              |
| ------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| FR-01  | `src/components/RobotStatus.tsx`, `src/store/useRobotStore.ts`                   | `backend/routes/status.py`                                 |
| FR-02  | `src/components/RobotStatus.tsx`                                                 | `backend/routes/status.py`                                 |
| FR-03  | `src/components/RobotStatus.tsx`, `src/hooks/useRobotTelemetry.ts`               | `backend/routes/websocket.py`                              |
| FR-04  | `src/components/ControlPanel.tsx`, `src/constants/robotCommands.ts`              | `backend/routes/commands.py`, `backend/robot/commands.py`  |
| FR-05  | `src/services/robotApi.ts`, `src/hooks/useRobotCommandDispatcher.ts`             | `backend/routes/commands.py`                               |
| FR-06  | `src/components/ControlPanel.tsx`                                                | `backend/robot/commands.py`                                |
| FR-07  | `src/components/ControlPanel.tsx`                                                | `backend/robot/commands.py`                                |
| FR-08  | `src/components/ControlPanel.tsx`                                                | `backend/robot/commands.py`                                |
| FR-09  | `src/components/TaskBuilder.tsx`, `src/store/useTaskStore.ts`                    | --                                                         |
| FR-10  | `src/components/TaskBuilder.tsx`, `src/services/robotApi.ts`                     | `backend/routes/sequences.py`, `backend/robot/commands.py` |
| FR-11  | `src/store/useTaskStore.ts`                                                      | --                                                         |
| FR-12  | `src/components/Scheduler.tsx`, `src/store/useScheduleStore.ts`                  | --                                                         |
| FR-13  | `src/store/useScheduleStore.ts`                                                  | --                                                         |
| FR-14  | `src/hooks/useRobotTelemetry.ts`                                                 | `backend/routes/websocket.py`                              |
| FR-15  | `src/hooks/useRobotTelemetry.ts`                                                 | --                                                         |
| FR-16  | `src/pages/Index.tsx`, `src/hooks/useRosConnection.ts`, `src/services/rosApi.ts` | --                                                         |
| FR-17  | `vite.config.ts`                                                                 | --                                                         |
| FR-18  | `src/components/Scheduler.tsx`                                                   | `backend/routes/schedules.py`                              |
| FR-19  | `*.test.ts`                                                                      | --                                                         |
| FR-20  | --                                                                               | `backend/robot/commands.py`, `backend/routes/sequences.py` |
| FR-21  | `src/pages/NotFound.tsx`                                                         | --                                                         |
| FR-22  | `src/hooks/useRobotCommandDispatcher.ts`                                         | --                                                         |


