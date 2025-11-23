# Scrum Poker Planning - Microservices Architecture

A real-time poker planning application split into 3 microservices for better scalability and maintainability.

## Architecture

```
poker-planning/
├── apps/
│   ├── ui/              # Next.js frontend (port 3000)
│   ├── backend/         # Express REST API (port 4000)
│   └── websocket/       # Socket.io server (port 5000)
├── packages/
│   └── shared/          # Shared types and utilities
└── db/                  # Database schemas and migrations
```

## Services

### 1. UI Service (Port 3000)
- Next.js 15 frontend
- Connects to Backend for data operations
- Connects to WebSocket for real-time updates

### 2. Backend Service (Port 4000)
- Express REST API
- PostgreSQL database access
- Handles all data persistence
- Cron jobs for maintenance

### 3. WebSocket Service (Port 5000)
- Socket.io server
- Optimistic real-time updates
- Instant broadcasts for voting, users, settings
- Asynchronous persistence through Backend

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**

Create `.env` files in each service directory (see README in each service for details):
- `apps/backend/.env`
- `apps/websocket/.env`
- `apps/ui/.env.local`

3. **Set up database:**
```bash
# Create PostgreSQL database
createdb poker_planning

# Run migrations
npm run db:migrate
```

4. **Start all services:**
```bash
npm run dev
```

This starts:
- UI on http://localhost:3000
- Backend on http://localhost:4000
- WebSocket on http://localhost:5000

### Individual Services

Start individual services:
```bash
npm run dev:ui         # UI only
npm run dev:backend    # Backend only
npm run dev:websocket  # WebSocket only
```

## Docker Compose

Run all services with Docker:

```bash
docker-compose up --build
```

This starts:
- PostgreSQL database
- Backend service
- WebSocket service
- UI service

Access the app at http://localhost:3000

## Real-Time Features

The WebSocket service implements optimistic updates for instant UX:

1. **Voting**: Votes appear instantly to all users, then persist asynchronously
2. **User Presence**: Join/leave updates broadcast immediately
3. **Room Settings**: Setting changes visible instantly to all participants
4. **Reactions**: Emoji reactions broadcast in real-time
5. **Timer**: Timer state synced across all users
6. **Canvas**: Node position/content updates instantly

## Development

### Monorepo Structure

This is an npm workspaces monorepo. Key commands:

```bash
# Install dependencies
npm install

# Build all services
npm run build

# Run linting
npm run lint

# Type checking
npm run ts:check
```

### Database Migrations

```bash
npm run db:migrate
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Express, PostgreSQL, Node.js
- **WebSocket**: Socket.io
- **Shared**: TypeScript, Axios

## Environment Variables

### Backend
```env
DATABASE_URL=postgresql://user:password@localhost:5432/poker_planning
PORT=4000
WEBSOCKET_URL=http://localhost:5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ENCRYPTION_KEY=your-key-here
```

### WebSocket
```env
PORT=5000
BACKEND_URL=http://localhost:4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### UI
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:5000
```

## License

MIT

## Author

Issam El Nass
