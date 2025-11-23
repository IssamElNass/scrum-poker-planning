# UI Service

Next.js frontend application.

## Environment Variables

Create a `.env.local` file in this directory with:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:5000
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

## Architecture

The UI service communicates with:

- **Backend Service (port 4000)**: REST API calls for data operations
- **WebSocket Service (port 5000)**: Real-time updates via Socket.io

All Server Actions have been replaced with API client calls to the backend service.
