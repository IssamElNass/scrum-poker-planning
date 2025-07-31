# Technology Steering Document

## Core Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Canvas**: @xyflow/react for whiteboard functionality
- **Package Manager**: npm

### Backend
- **Platform**: Convex (serverless TypeScript functions)
- **Real-time**: Built-in Convex reactivity
- **Database**: Convex's document database
- **Deployment**: Convex cloud infrastructure

### Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript compiler
- **Testing**: Playwright for e2e tests
- **Build**: Next.js with Turbopack

## Architecture Decisions

### State Management
- **Server State**: Convex reactive queries (no Redux/Zustand needed)
- **Client State**: React Context for auth, local component state
- **Real-time Updates**: Automatic via Convex subscriptions

### Data Flow
1. User actions trigger Convex mutations
2. Convex updates database and notifies subscribers
3. React components re-render with new data automatically
4. Canvas state persisted to enable room persistence

### Canvas Architecture
- React Flow for node-based canvas rendering
- Custom node types for different room elements
- Debounced position updates to minimize server calls
- Viewport state tracked per user

## Technical Constraints
- **Browser Support**: Latest versions of Chrome, Firefox, Safari, Edge
- **Performance**: No specific requirements currently
- **Security**: Standard web security practices
- **Compliance**: None required

## Integration Points
### Current
- Convex for all backend operations
- React Flow for canvas functionality

### Planned
- Payment provider for future subscription model
- Analytics service (privacy-respecting)
- Export service for session data

## Development Practices

### Code Quality
- TypeScript for type safety
- ESLint for code consistency
- Automated formatting with Prettier (if configured)
- Component-based architecture

### Testing Strategy
- E2E tests with Playwright for all features
- Focus on user journeys over unit tests
- Visual regression testing for UI components (future)

### Performance Considerations
- Lazy loading for route-based code splitting
- Debounced canvas updates
- Optimistic UI updates where appropriate
- Image optimization via Next.js

## Security Considerations
- No sensitive data storage
- Room IDs as non-guessable identifiers
- Client-side validation + server-side enforcement
- HTTPS everywhere via hosting platforms

## Deployment Strategy
- **Frontend**: Vercel/Netlify or similar
- **Backend**: Convex managed deployment
- **Environments**: Development, Production
- **CI/CD**: GitHub Actions for automated testing

## Future Technology Considerations
- WebSocket fallbacks for restrictive networks
- PWA capabilities for offline support
- WebRTC for potential video integration
- Webhooks for third-party integrations