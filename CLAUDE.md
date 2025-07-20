# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

PokerPlanning.org is an open-source online planning poker tool for Scrum teams. It features real-time collaboration with a Rust/GraphQL backend and React/TypeScript frontend.

The application features a modern whiteboard-style interface with endless canvas, floating navigation, and advanced collaboration features.

## Development Commands

### Frontend (Client)

```bash
cd client
npm install                 # Install dependencies
npm run dev                 # Start development server (http://localhost:5173)
npm run build              # Production build
npm run lint               # Check for linting errors
npm run lint:fix           # Fix linting errors
npm run checkTs            # TypeScript type checking
npm test                   # Run unit tests with Vitest
npm run codegen            # Generate GraphQL types from schema
npm run test:e2e           # Run Playwright end-to-end tests
npm run test:e2e:ui        # Run Playwright tests with UI
npm run test:e2e:headless   # Run Playwright tests in headless mode
```

### Backend (Server)

```bash
cd server
cargo build                # Build the project
cargo run                  # Run the server
cargo watch -x run         # Run with auto-reload (requires cargo-watch)
cargo check                # Check for compilation errors
cargo test                 # Run tests
```

## Architecture Overview

### Frontend Architecture

- **Framework**: React 19 with TypeScript in strict mode
- **Routing**: TanStack Router with file-based routing in `/routes`
- **State Management**: Apollo Client for GraphQL state, React Context for auth
- **UI Components**: Custom components using shadcn/ui and Radix UI primitives
- **Styling**: Tailwind CSS 4 with custom theme configuration
- **Real-time**: GraphQL subscriptions via WebSocket

### Backend Architecture

- **Framework**: Actix Web with async-graphql
- **Pattern**: Domain-driven design with models in `/domain`
- **Real-time**: SimpleBroker for pub/sub messaging
- **Configuration**: Environment-based YAML configs (base, local, production)

### Key Patterns

1. **GraphQL Operations**: All GraphQL queries/mutations/subscriptions are in `client/src/api/operations.graphql`
2. **Type Generation**: Run `npm run codegen` after modifying GraphQL operations
3. **Component Structure**: Components are self-contained with their own directories
4. **Error Handling**: Use toast notifications for user-facing errors
5. **Authentication**: User context stored in AuthContext, persisted to localStorage

## Testing Strategy

### Unit Tests

- Use Vitest with Testing Library for React components
- Test files co-located with components (\*.test.tsx)
- Run specific test: `npm test -- path/to/test`

### E2E Tests

- Playwright tests in `/client/tests/`
- Test real user flows: creating rooms, joining, voting
- Must have both frontend and backend running
- **IMPORTANT**: Always run e2e tests in headless mode: `npm run test:e2e:headless`

## Common Development Tasks

### Adding a New GraphQL Operation

1. Add query/mutation/subscription to `client/src/api/operations.graphql`
2. Run `npm run codegen` to generate types
3. Import and use generated hooks from `src/api/operations.generated.ts`

### Creating a New Component

1. Create directory under `client/src/components/`
2. Follow existing patterns (see card, player, room, mode-toggle, etc. components)
3. Export from `index.tsx` and re-export from `src/components/index.ts`

### Key Components

- `RoomCanvas`: Main room component using React Flow for endless canvas
- `CanvasNavigation`: Floating toolbar for room controls

### Adding a New Route

1. Create file in `src/routes/` following naming convention
2. Use `.lazy.tsx` suffix for code splitting
3. Route params available via `useParams()` hook

### Room Features

The application uses a modern canvas-based interface:

- **Canvas Room** (`/room/:roomId`)
  - Uses `RoomCanvas` component with React Flow
  - Endless canvas with pan and zoom capabilities
  - Floating navigation bar with game controls
  - Full-screen mode support
  - Players can be repositioned on the canvas

Room creation flow:

1. User clicks "Start New Game"
2. Room is created and user is redirected to `/room/:roomId`

## Deployment

The app deploys to DigitalOcean App Platform:

- Frontend: Static site build
- Backend: Dockerized Rust server
- Configuration: `spec.yaml` in root directory

## Important Notes

- Node.js version must be >=20 (check `client/.nvmrc`)
- Frontend proxies `/graphql` requests to backend in development
- WebSocket endpoint for subscriptions: `ws://localhost:8000/graphql`
- All environment variables in frontend must be prefixed with `VITE_`

## UI Component Management

### Installing shadcn/ui Components

When you encounter missing shadcn/ui components (e.g., `Module not found: Can't resolve '@/components/ui/[component]'`), always use the shadcn CLI to install them:

```bash
npx shadcn@latest add [component-name]
```

Examples:
- `npx shadcn@latest add button`
- `npx shadcn@latest add dialog`
- `npx shadcn@latest add separator`
- `npx shadcn@latest add tooltip`

**IMPORTANT**: Never manually create shadcn/ui components. Always use the CLI to ensure:
- Proper styling and theme integration
- Correct TypeScript types
- Consistency with the project's design system
- All required dependencies are installed
