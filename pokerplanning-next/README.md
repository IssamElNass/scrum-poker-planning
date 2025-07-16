# PokerPlanning.org - Next.js + Convex Migration

This is the migrated version of PokerPlanning.org, rebuilt with Next.js and Convex for improved performance, persistence, and developer experience.

## Architecture

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless TypeScript functions)
- **Real-time**: Built-in Convex reactivity
- **Database**: Convex document store with 5-day retention for inactive rooms

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Convex

Run the following command to set up your Convex backend:

```bash
npx convex dev
```

This will:
- Prompt you to log in with GitHub
- Create a new Convex project
- Generate the necessary type files
- Start the Convex development server

### 3. Configure Environment Variables

Copy the `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then update the `NEXT_PUBLIC_CONVEX_URL` with the URL provided by `npx convex dev`.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Key Features

- **Two Room Types**: Classic (circular table) and Canvas (whiteboard-style)
- **Real-time Updates**: Automatic synchronization across all clients
- **Data Persistence**: Rooms persist for 5 days of inactivity
- **No Registration Required**: Simple username-based system
- **Spectator Mode**: Join rooms without voting

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── room/[roomId]/     # Canvas room page
│   └── classic-room/[roomId]/ # Classic room page
├── components/            # React components
│   ├── auth/             # Authentication context
│   ├── room/             # Room-specific components
│   └── ui/               # Shared UI components
└── lib/                  # Utilities

convex/                   # Backend functions
├── schema.ts            # Database schema
├── rooms.ts             # Room operations
├── users.ts             # User management
├── votes.ts             # Voting logic
├── cleanup.ts           # Scheduled cleanup
└── crons.ts             # Cron job configuration
```

## Migration Status

### Completed ✅
- Next.js project setup
- Convex backend implementation
- Database schema and functions
- Basic UI components
- Authentication flow
- Room creation and joining
- Real-time data synchronization
- 5-day cleanup cron job

### TODO 📝
- Migrate all UI components from original project
- Implement React Flow for Canvas room
- Add toast notifications (replace alerts)
- Port E2E tests
- Add error boundaries
- Implement proper loading states
- Add room sharing functionality
- Optimize for production

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_DEPLOY_KEY` (from Convex dashboard)
4. Deploy

### Convex Production

```bash
npx convex deploy --prod
```

## Notes

- The application requires Convex to be running (`npx convex dev` in development)
- All data is automatically synced in real-time
- Rooms are automatically deleted after 5 days of inactivity
- No data migration needed from the old system (ephemeral data)
