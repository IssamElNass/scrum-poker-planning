# WebSocket Service

Socket.io service for real-time communication with optimistic updates.

## Environment Variables

Create a `.env` file in this directory with:

```env
PORT=5000
BACKEND_URL=http://localhost:4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Start

```bash
npm run start
```

## Real-Time Features

This service handles all real-time updates with instant broadcasts:
- Voting (cast, reveal, reset)
- User presence (join, leave, cursor position)
- Room settings updates
- Emoji reactions
- Timer updates
- Canvas updates

All events are broadcast IMMEDIATELY to room participants, then persisted asynchronously to the backend.

