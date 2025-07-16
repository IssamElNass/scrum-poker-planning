# PokerPlanning.org Migration Plan: React/Rust to Next.js/Convex

## Executive Summary

This document outlines the complete migration strategy for PokerPlanning.org from its current React (Vite) + Rust backend architecture to a modern Next.js + Convex stack. The migration will be executed as a single phase to minimize complexity and downtime.

## Current Architecture Analysis

### Frontend

- **Framework**: React 19 with TypeScript (strict mode)
- **Build Tool**: Vite 7 with React Compiler
- **Routing**: TanStack Router (file-based)
- **State Management**: Apollo Client for GraphQL + React Context for auth
- **UI**: Tailwind CSS 4, Radix UI, shadcn/ui components
- **Real-time**: GraphQL subscriptions via WebSocket

### Backend

- **Framework**: Actix Web 4 (Rust)
- **API**: async-graphql 7
- **Storage**: In-memory HashMap (no persistence)
- **Real-time**: SimpleBroker pub/sub
- **Data Privacy**: Card values hidden until game reveal

### Key Characteristics

- All data is ephemeral (lost on server restart)
- Canvas room positions calculated client-side
- No authentication system (trust-based)
- Designed for temporary planning sessions

## Target Architecture

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI**: Same component library (Tailwind CSS, Radix UI, shadcn/ui)
- **Real-time**: Convex reactive queries (automatic updates)

### Backend

- **Platform**: Convex (TypeScript functions)
- **Database**: Convex document store
- **Real-time**: Built-in reactivity
- **Persistence**: 5-day retention for inactive rooms
- **Scheduled Jobs**: Automatic cleanup via cron

## Migration Benefits

1. **Simplified Stack**: Single language (TypeScript) across frontend and backend
2. **Persistence**: Data survives server restarts with automatic 5-day cleanup
3. **Better DX**: End-to-end type safety, hot reload for backend functions
4. **Cost Effective**: Serverless pricing, no infrastructure management
5. **Performance**: Faster initial loads with Next.js SSR/SSG

## Data Schema Design

### Convex Tables

```typescript
// rooms table
{
  name: string
  votingCategorized: boolean
  autoCompleteVoting: boolean
  roomType: "classic" | "canvas"
  isGameOver: boolean
  createdAt: number
  lastActivityAt: number  // For cleanup tracking
}

// users table
{
  roomId: Id<"rooms">
  name: string
  isSpectator: boolean
  joinedAt: number
}

// votes table
{
  roomId: Id<"rooms">
  userId: Id<"users">
  cardLabel?: string
  cardValue?: number
  cardIcon?: string
}
```

## Migration Strategy

### Phase 1: Project Setup (Days 1-2)

1. Create new Next.js 15 project with TypeScript and App Router
2. Install core dependencies (Convex, UI libraries)
3. Set up Convex backend with schema
4. Configure environment variables

### Phase 2: Backend Implementation (Days 3-5)

1. Implement Convex functions for:
   - Room CRUD operations
   - User management
   - Voting mechanics
   - Game state transitions
2. Set up cron job for 5-day cleanup
3. Implement data privacy (hide cards until reveal)

### Phase 3: Frontend Migration (Days 6-10)

1. Migrate routing from TanStack Router to Next.js App Router
2. Replace Apollo Client with Convex hooks
3. Port all React components
4. Update state management patterns
5. Maintain Canvas room layout calculations

### Phase 4: Testing & Deployment (Days 11-15)

1. Port and update E2E tests for new architecture
2. Performance testing and optimization
3. Set up deployment pipeline (Vercel + Convex)
4. DNS migration strategy

## Technical Implementation Details

### Routing Migration Map

```
TanStack Router              →  Next.js App Router
/                           →  app/page.tsx
/about                      →  app/about/page.tsx
/room/:roomId              →  app/room/[roomId]/page.tsx
/classic-room/:roomId      →  app/classic-room/[roomId]/page.tsx
```

### State Management Changes

- Remove Apollo Client and GraphQL subscriptions
- Replace with Convex `useQuery` and `useMutation` hooks
- Automatic real-time updates (no manual subscription management)

### Authentication Updates

- Keep simple user system in localStorage
- Add user ID validation against Convex database
- Maintain session across page refreshes

### Real-time Features

- All updates automatic via Convex reactivity
- No WebSocket configuration needed
- Optimistic updates built-in

## Risk Mitigation

1. **Zero Downtime Migration**

   - Deploy new system to staging URL
   - Run comprehensive tests
   - Switch DNS when verified

2. **Rollback Strategy**

   - Keep old system running on subdomain
   - Quick DNS switch if issues arise
   - No data migration needed (ephemeral)

3. **Testing Plan**
   - Update all E2E tests before go-live
   - Load testing with multiple concurrent rooms
   - Cross-browser compatibility checks

## Timeline

### Week 1: Foundation

- Days 1-2: Project setup and configuration
- Days 3-5: Backend implementation

### Week 2: Frontend

- Days 6-8: Core component migration
- Days 9-10: Room functionality completion

### Week 3: Launch

- Days 11-12: Testing and bug fixes
- Days 13-14: Deployment preparation
- Day 15: Go-live and monitoring

## Success Metrics

1. **Functional Requirements**

   - All existing features working
   - Real-time updates < 100ms latency
   - 5-day data retention working correctly

2. **Performance Targets**

   - Initial page load < 2 seconds
   - Time to interactive < 3 seconds
   - 99.9% uptime

3. **Developer Experience**
   - Single `npm run dev` to start
   - Hot reload for all code changes
   - Full TypeScript coverage

## Post-Migration Enhancements

Once migration is complete, we can leverage the new architecture for:

1. **User Features**

   - Room history (last 5 days)
   - Rejoin previous sessions
   - Export game results

2. **Analytics**

   - Usage patterns
   - Popular card values
   - Session duration metrics

3. **Collaboration**
   - Team workspaces
   - Recurring game templates
   - Integration possibilities

## Conclusion

This migration represents a significant modernization of the PokerPlanning.org stack. By moving to Next.js and Convex, we achieve:

- Simplified architecture with single-language development
- Improved reliability with data persistence
- Better performance with modern web optimizations
- Foundation for future feature development

The migration can be completed in 3 weeks with minimal risk due to the ephemeral nature of the current system.
