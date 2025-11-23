# Backend Service

Express REST API service with database access.

## Environment Variables

Create a `.env` file in this directory with:

```env
DATABASE_URL=postgresql://poker_user:poker_password@localhost:5432/poker_planning
PORT=4000
WEBSOCKET_URL=http://localhost:5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ENCRYPTION_KEY=your-encryption-key-here
```

Generate encryption key with: `openssl rand -base64 32`

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

