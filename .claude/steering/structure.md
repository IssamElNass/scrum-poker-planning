# Structure Steering Document

## Project Organization

### Directory Structure

```
/
├── src/                      # Application source code
│   ├── app/                  # Next.js App Router pages
│   │   ├── (routes)/         # Route groups for organization
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── [feature]/        # Feature-specific components
│   │   ├── ui/               # shadcn/ui components (never edit directly)
│   │   └── *.tsx             # Shared components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   └── utils/                # Helper functions
├── convex/                   # Backend functions
│   ├── _generated/           # Auto-generated types (never edit)
│   ├── model/                # Domain logic and types
│   ├── schema.ts             # Database schema
│   └── *.ts                  # API endpoints
├── public/                   # Static assets
└── tests/                    # Test files
    └── e2e/                  # Playwright tests
```

## Naming Conventions

### Files

- **Components**: kebab-case (e.g., `room-canvas.tsx`)
- **Hooks**: kebab-case with 'use' prefix (e.g., `use-canvas-layout.ts`)
- **Utils**: kebab-case (e.g., `copy-text-to-clipboard.ts`)
- **Convex Functions**: kebab-case (e.g., `rooms.ts`)
- **Routes**: kebab-case directories (e.g., `/room/[roomId]`)

### Code

- **Interfaces/Types**: PascalCase with descriptive names
- **Functions**: camelCase, verb-based (e.g., `handleCreateRoom`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **CSS Classes**: Tailwind 4.x utility classes, custom classes in kebab-case

## Component Organization

### Feature-Based Structure

Each feature gets its own directory with:

```
components/
└── [feature]/
    ├── index.ts              # Public exports
    ├── [feature-name].tsx     # Main component
    ├── components/           # Sub-components
    ├── hooks/                # Feature-specific hooks
    └── types.ts              # Feature types
```

### Component Guidelines

1. One component per file
2. Co-locate related components
3. Export through index files for clean imports
4. Keep components focused and single-purpose

## Convex Organization

### API Structure

```
convex/
├── [resource].ts             # Resource-based API files
└── model/
    └── [resource].ts         # Business logic and complex queries
```

### Convex Patterns

1. Simple CRUD in main files
2. Complex logic in model/ directory
3. Shared types in model files
4. Validation at function boundaries

## Canvas Node Types

Each node type is a separate component:

```
components/room/nodes/
├── PlayerNode.tsx            # Individual player representation
├── SessionNode.tsx           # Session control center
├── VotingCardNode.tsx        # Voting interface
├── ResultsNode/              # Complex node with sub-components
├── TimerNode.tsx             # Timer functionality
└── StoryNode.tsx             # Story/task display
```

## Import Organization

1. External packages
2. Convex imports (`@/convex/_generated/api`)
3. Components (`@/components/`)
4. Hooks (`@/hooks/`)
5. Utils (`@/lib/`, `@/utils/`)
6. Types
7. Relative imports

Example:

```typescript
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useCanvasLayout } from "@/hooks/useCanvasLayout";
import { cn } from "@/lib/utils";
import type { RoomData } from "./types";
```

## Adding New Features

### Process

1. Create feature directory in appropriate location
2. Implement component with proper types
3. Add to parent component/page
4. Create Convex functions if needed
5. Write E2E tests covering the feature
6. Update any affected documentation

### Checklist

- [ ] TypeScript types defined
- [ ] Component follows existing patterns
- [ ] Imports organized correctly
- [ ] E2E tests written
- [ ] Responsive design considered
- [ ] Error states addressed

## Testing Structure

```
tests/
  ├── [feature].spec.ts     # Feature-specific tests
  └── fixtures/             # Shared test utilities
```

### Test Guidelines

- Test user journeys, not implementation
- Cover happy paths and edge cases
- Use data-testid for reliable selectors
- Keep tests independent and atomic

## Common Patterns

### Real-time Data

```typescript
const data = useQuery(api.resource.getItem, { id });
const updateItem = useMutation(api.resource.updateItem);
```

### Canvas Updates

```typescript
// Debounce position updates
const debouncedUpdate = useMemo(
  () => debounce(updateNodePosition, 100),
  [updateNodePosition]
);
```

### Error Handling

```typescript
try {
  await mutation(args);
  toast.success("Success message");
} catch (error) {
  toast.error("User-friendly error");
  console.error("Detailed error:", error);
}
```
