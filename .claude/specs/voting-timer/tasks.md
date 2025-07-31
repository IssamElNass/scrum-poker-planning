# Implementation Plan

## Task Overview

The voting timer implementation will be executed in atomic tasks that progressively transform the existing local-only TimerNode into a real-time synchronized component. Each task focuses on a specific file or small set of related files, ensuring clear boundaries and testable outcomes.

## Steering Document Compliance

- **File Naming**: All new files follow kebab-case convention (e.g., `use-timer-sync.ts`)
- **Component Location**: Timer components remain in `src/components/room/nodes/`
- **Convex Organization**: Timer functions in `convex/timer.ts` with model logic in `convex/model/timer.ts`
- **Import Order**: Tasks maintain standard import hierarchy as specified in structure.md
- **Testing**: E2E tests created for all user journeys per testing requirements

## Atomic Task Requirements

**Each task must meet these criteria for optimal agent execution:**

- **File Scope**: Touches 1-3 related files maximum
- **Time Boxing**: Completable in 15-30 minutes
- **Single Purpose**: One testable outcome per task
- **Specific Files**: Must specify exact files to create/modify
- **Agent-Friendly**: Clear input/output with minimal context switching

## Task Format Guidelines

- Use checkbox format: `- [ ] Task number. Task description`
- **Specify files**: Always include exact file paths to create/modify
- **Include implementation details** as bullet points
- Reference requirements using: `_Requirements: X.Y, Z.A_`
- Reference existing code to leverage using: `_Leverage: path/to/file.ts, path/to/component.tsx_`
- Focus only on coding tasks (no deployment, user testing, etc.)
- **Avoid broad terms**: No "system", "integration", "complete" in task titles

## Tasks

- [x] 1. Create timer types in src/components/room/types.ts

  - File: src/components/room/types.ts (modify existing)
  - Update TimerNodeData interface with server timestamp fields
  - Add `startedAt`, `pausedAt`, `elapsedSeconds`, `lastUpdatedBy`, `lastAction`
  - Keep existing fields for backward compatibility
  - Purpose: Define TypeScript types for synchronized timer state
  - _Leverage: existing types in src/components/room/types.ts_
  - _Requirements: 1.1, 2.1_

- [x] 2. Create timer model functions in convex/model/timer.ts

  - File: convex/model/timer.ts (create new)
  - Implement `updateTimerState` function for start/pause/reset actions
  - Add `calculateCurrentTime` helper using server timestamps
  - Include validation for timer state transitions
  - Purpose: Server-side timer logic and state management
  - _Leverage: convex/model/canvas.ts patterns_
  - _Requirements: 2.1, 2.2_

- [x] 3. Create timer Convex mutations in convex/timer.ts

  - File: convex/timer.ts (create new)
  - Create `startTimer`, `pauseTimer`, `resetTimer` mutations
  - Each mutation calls corresponding model function
  - Add roomId and userId validation
  - Purpose: API endpoints for timer control actions
  - _Leverage: convex/canvas.ts mutation patterns_
  - _Requirements: 2.1, 2.2, 3.1_

- [x] 4. Add timer query function in convex/timer.ts

  - File: convex/timer.ts (modify existing from task 3)
  - Create `getTimerState` query function
  - Calculate current seconds based on server time
  - Return formatted timer state for client consumption
  - Purpose: Reactive query for real-time timer updates
  - _Leverage: convex/canvas.ts query patterns_
  - _Requirements: 2.1, 2.5_

- [x] 5. Create useTimerSync hook in src/components/room/hooks/use-timer-sync.ts

  - File: src/components/room/hooks/use-timer-sync.ts (create new)
  - Implement hook using Convex useQuery and useMutation
  - Handle local timer display with server sync
  - Export timer state and control functions
  - Purpose: Client-side timer synchronization logic
  - _Leverage: src/components/room/hooks/useCanvasNodes.ts patterns_
  - _Requirements: 2.1, 2.2_

- [x] 6. Update TimerNode component to use synchronized state

  - File: src/components/room/nodes/TimerNode.tsx (modify existing)
  - Replace local state with useTimerSync hook
  - Update click handlers to use Convex mutations
  - Maintain existing UI structure and styling
  - Purpose: Connect timer UI to synchronized backend
  - _Leverage: existing TimerNode.tsx UI code_
  - _Requirements: 1.1, 1.3, 5.1_

- [x] 7. Remove timer node old data in convex/model/canvas.ts

  - File: convex/model/canvas.ts (modify existing)
  - Purpose: Remove old timer data from canvas nodes
  - Remove old timer data from `src/components/room/types.ts`
  - _Leverage: existing canvas.ts functions_
  - _Requirements: 2.4, 2.5_

- [ ] 8. Integrate timer reset with game reset in convex/model/rooms.ts

  - File: convex/model/rooms.ts (modify existing)
  - Modify `resetRoomGame` to reset timer state
  - Query and update timer node data to initial state
  - Maintain transaction consistency
  - Purpose: Reset timer when game resets
  - _Leverage: existing resetRoomGame function_
  - _Requirements: 4.2_

- [ ] 9. Add timer permission tracking in convex/model/timer.ts

  - File: convex/model/timer.ts (modify existing from task 2)
  - Add `lastUpdatedBy` tracking to all timer mutations
  - Store user action history for future features
  - Include in timer state updates
  - Purpose: Track which user performed timer actions
  - _Leverage: existing user tracking patterns_
  - _Requirements: 3.4_

- [x] 10. Implement timer visual feedback in TimerNode.tsx

  - File: src/components/room/nodes/TimerNode.tsx (modify existing from task 6)
  - Ensure pulsing indicator shows when timer is running
  - Verify hover states on all controls
  - Add disabled state styling for reset button
  - Purpose: Clear visual indicators of timer state
  - _Leverage: existing UI classes and animations_
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 11. Add debounced timer updates in use-timer-sync.ts

  - File: src/components/room/hooks/use-timer-sync.ts (modify existing from task 5)
  - Implement client-side timer ticking with requestAnimationFrame
  - Sync with server state periodically
  - Handle reconnection scenarios gracefully
  - Purpose: Smooth timer display without excessive server calls
  - _Leverage: debounce patterns from useCanvasLayout.ts_
  - _Requirements: 2.1, NFR-Performance_

- [x] 12. Create timer E2E test in tests/timer.spec.ts

  - File: tests/timer.spec.ts (create new)
  - Test timer controls (play/pause/reset) work correctly
  - Verify synchronization between multiple browser instances
  - Test timer persistence on page refresh
  - Purpose: Ensure timer functionality works end-to-end
  - _Leverage: tests/room.spec.ts patterns_
  - _Requirements: All functional requirements_

- [ ] 13. Add timer reset E2E test in tests/timer.spec.ts

  - File: tests/timer.spec.ts (modify existing from task 12)
  - Test timer resets when game resets
  - Verify timer continues running during card reveal
  - Test simultaneous control actions from different users
  - Purpose: Validate timer integration with voting flow
  - _Leverage: existing room test utilities_
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 14. Handle timer node errors in convex/model/timer.ts

  - File: convex/model/timer.ts (modify existing)
  - Add validation for timer data structure
  - Implement safe fallback for corrupted timer state
  - Log errors for monitoring
  - Purpose: Graceful error handling for timer operations
  - _Leverage: error handling patterns from other models_
  - _Requirements: NFR-Reliability_

- [ ] 15. Add mobile touch support verification in TimerNode.tsx
  - File: src/components/room/nodes/TimerNode.tsx (modify existing)
  - Ensure touch targets meet mobile size requirements
  - Verify timer display at different zoom levels
  - Test on actual mobile viewport
  - Purpose: Ensure timer works well on mobile devices
  - _Leverage: existing mobile-friendly patterns_
  - _Requirements: NFR-Usability_
