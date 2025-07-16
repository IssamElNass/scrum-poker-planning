# PokerPlanning.org Migration Implementation Guide

This document provides detailed implementation steps and code examples for migrating from React/Rust to Next.js/Convex.

## Part 1: Project Setup

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest pokerplanning-next \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd pokerplanning-next
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install convex

# UI dependencies (matching current project)
npm install @radix-ui/react-alert-dialog @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label \
  @radix-ui/react-select @radix-ui/react-slot \
  @radix-ui/react-switch @radix-ui/react-toast

# Additional dependencies
npm install @xyflow/react lucide-react clsx tailwind-merge \
  sonner zustand

# Dev dependencies
npm install -D @types/node
```

### Step 3: Initialize Convex

```bash
npx convex dev
```

This will:
1. Prompt for authentication (GitHub)
2. Create a new Convex project
3. Generate `convex/` directory
4. Add environment variables to `.env.local`

## Part 2: Convex Schema and Functions

### Step 1: Create Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    name: v.string(),
    votingCategorized: v.boolean(),
    autoCompleteVoting: v.boolean(),
    roomType: v.union(v.literal("classic"), v.literal("canvas")),
    isGameOver: v.boolean(),
    createdAt: v.number(),
    lastActivityAt: v.number(),
  }).index("by_activity", ["lastActivityAt"]),
  
  users: defineTable({
    roomId: v.id("rooms"),
    name: v.string(),
    isSpectator: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_join", ["roomId", "joinedAt"]),
  
  votes: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    cardLabel: v.optional(v.string()),
    cardValue: v.optional(v.number()),
    cardIcon: v.optional(v.string()),
  })
    .index("by_room", ["roomId"])
    .index("by_room_user", ["roomId", "userId"]),
});
```

### Step 2: Room Functions

```typescript
// convex/rooms.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new room
export const create = mutation({
  args: {
    name: v.string(),
    roomType: v.union(v.literal("classic"), v.literal("canvas")),
    votingCategorized: v.optional(v.boolean()),
    autoCompleteVoting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("rooms", {
      name: args.name,
      roomType: args.roomType,
      votingCategorized: args.votingCategorized ?? true,
      autoCompleteVoting: args.autoCompleteVoting ?? false,
      isGameOver: false,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    });
    
    return roomId;
  },
});

// Get room with all related data
export const get = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;
    
    // Get all users in the room
    const users = await ctx.db
      .query("users")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    
    // Get all votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    
    // Hide card values if game is not over
    const sanitizedVotes = votes.map(vote => ({
      ...vote,
      cardLabel: room.isGameOver ? vote.cardLabel : undefined,
      cardValue: room.isGameOver ? vote.cardValue : undefined,
      cardIcon: room.isGameOver ? vote.cardIcon : undefined,
      hasVoted: !!vote.cardLabel,
    }));
    
    return {
      room,
      users,
      votes: sanitizedVotes,
    };
  },
});

// Get rooms for a user
export const getUserRooms = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // This would need to track user sessions differently
    // For now, return empty array
    return [];
  },
});

// Update room activity
export const updateActivity = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
  },
});

// Show cards
export const showCards = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, {
      isGameOver: true,
      lastActivityAt: Date.now(),
    });
  },
});

// Reset game
export const resetGame = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    // Update room
    await ctx.db.patch(args.roomId, {
      isGameOver: false,
      lastActivityAt: Date.now(),
    });
    
    // Delete all votes for this room
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
    
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
  },
});
```

### Step 3: User Functions

```typescript
// convex/users.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const join = mutation({
  args: {
    roomId: v.id("rooms"),
    name: v.string(),
    isSpectator: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Update room activity
    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
    
    // Create user
    const userId = await ctx.db.insert("users", {
      roomId: args.roomId,
      name: args.name,
      isSpectator: args.isSpectator ?? false,
      joinedAt: Date.now(),
    });
    
    return userId;
  },
});

export const edit = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    isSpectator: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    // Update room activity
    await ctx.db.patch(user.roomId, {
      lastActivityAt: Date.now(),
    });
    
    // Update user
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.isSpectator !== undefined) updates.isSpectator = args.isSpectator;
    
    await ctx.db.patch(args.userId, updates);
  },
});

export const leave = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    
    // Delete user's votes
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_room_user", (q) => 
        q.eq("roomId", user.roomId).eq("userId", args.userId)
      )
      .collect();
    
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    
    // Delete user
    await ctx.db.delete(args.userId);
    
    // Update room activity
    await ctx.db.patch(user.roomId, {
      lastActivityAt: Date.now(),
    });
  },
});
```

### Step 4: Voting Functions

```typescript
// convex/votes.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const pickCard = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    cardLabel: v.string(),
    cardValue: v.number(),
    cardIcon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Update room activity
    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
    
    // Check if vote exists
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_room_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", args.userId)
      )
      .first();
    
    if (existing) {
      // Update existing vote
      await ctx.db.patch(existing._id, {
        cardLabel: args.cardLabel,
        cardValue: args.cardValue,
        cardIcon: args.cardIcon,
      });
    } else {
      // Create new vote
      await ctx.db.insert("votes", {
        roomId: args.roomId,
        userId: args.userId,
        cardLabel: args.cardLabel,
        cardValue: args.cardValue,
        cardIcon: args.cardIcon,
      });
    }
  },
});

export const removeCard = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Update room activity
    await ctx.db.patch(args.roomId, {
      lastActivityAt: Date.now(),
    });
    
    // Find and delete vote
    const vote = await ctx.db
      .query("votes")
      .withIndex("by_room_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", args.userId)
      )
      .first();
    
    if (vote) {
      await ctx.db.delete(vote._id);
    }
  },
});
```

### Step 5: Cleanup Cron Job

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at 3 AM UTC
crons.daily(
  "cleanup-inactive-rooms",
  { hourUTC: 3, minuteUTC: 0 },
  internal.cleanup.removeInactiveRooms
);

export default crons;
```

```typescript
// convex/cleanup.ts
import { internalMutation } from "./_generated/server";

export const removeInactiveRooms = internalMutation({
  handler: async (ctx) => {
    const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
    
    // Find inactive rooms
    const inactiveRooms = await ctx.db
      .query("rooms")
      .withIndex("by_activity", (q) => q.lt("lastActivityAt", fiveDaysAgo))
      .collect();
    
    console.log(`Found ${inactiveRooms.length} inactive rooms to clean up`);
    
    for (const room of inactiveRooms) {
      // Delete all votes for this room
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }
      
      // Delete all users in this room
      const users = await ctx.db
        .query("users")
        .withIndex("by_room", (q) => q.eq("roomId", room._id))
        .collect();
      
      for (const user of users) {
        await ctx.db.delete(user._id);
      }
      
      // Delete the room
      await ctx.db.delete(room._id);
      
      console.log(`Cleaned up room ${room.name} (${room._id})`);
    }
    
    return { roomsDeleted: inactiveRooms.length };
  },
});
```

## Part 3: Next.js Frontend Setup

### Step 1: App Layout and Providers

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planning Poker for Teams | PokerPlanning.org",
  description: "Free online planning poker tool for agile teams. Real-time collaboration, no registration required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

```typescript
// src/components/providers.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AuthProvider } from "./auth/auth-provider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ConvexProvider>
  );
}
```

### Step 2: Authentication Context

```typescript
// src/components/auth/auth-provider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  id: Id<"users">;
  name: string;
  roomId: Id<"rooms">;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("poker-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Save user to localStorage
    if (user) {
      localStorage.setItem("poker-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("poker-user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

### Step 3: Homepage

```typescript
// src/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoomTypeSelector } from "@/components/room/room-type-selector";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const createRoom = useMutation(api.rooms.create);
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showRoomTypeSelector, setShowRoomTypeSelector] = useState(false);

  const handleCreateRoom = async (roomType: "classic" | "canvas") => {
    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    setIsCreating(true);
    try {
      const roomId = await createRoom({
        name: roomName,
        roomType,
      });

      const route = roomType === "classic" 
        ? `/classic-room/${roomId}`
        : `/room/${roomId}`;
      
      router.push(route);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">PokerPlanning.org</h1>
          <p className="text-muted-foreground">
            Free online planning poker for agile teams
          </p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && roomName.trim()) {
                setShowRoomTypeSelector(true);
              }
            }}
          />
          
          <Button
            onClick={() => setShowRoomTypeSelector(true)}
            disabled={!roomName.trim() || isCreating}
            className="w-full"
          >
            Start New Game
          </Button>
        </div>
      </div>

      <RoomTypeSelector
        open={showRoomTypeSelector}
        onClose={() => setShowRoomTypeSelector(false)}
        onSelect={handleCreateRoom}
      />
    </div>
  );
}
```

### Step 4: Room Pages

```typescript
// src/app/room/[roomId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RoomCanvas } from "@/components/room/room-canvas";
import { JoinRoomDialog } from "@/components/room/join-room-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Id } from "@/convex/_generated/dataModel";

export default function CanvasRoomPage() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;
  const { user } = useAuth();
  const roomData = useQuery(api.rooms.get, { roomId });

  // Check if user is in this room
  const isInRoom = user?.roomId === roomId;

  if (!roomData) {
    return <div>Loading...</div>;
  }

  if (!roomData.room) {
    return <div>Room not found</div>;
  }

  if (!isInRoom) {
    return <JoinRoomDialog roomId={roomId} roomName={roomData.room.name} />;
  }

  return <RoomCanvas roomData={roomData} />;
}
```

```typescript
// src/app/classic-room/[roomId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Room } from "@/components/room/room";
import { JoinRoomDialog } from "@/components/room/join-room-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Id } from "@/convex/_generated/dataModel";

export default function ClassicRoomPage() {
  const params = useParams();
  const roomId = params.roomId as Id<"rooms">;
  const { user } = useAuth();
  const roomData = useQuery(api.rooms.get, { roomId });

  // Check if user is in this room
  const isInRoom = user?.roomId === roomId;

  if (!roomData) {
    return <div>Loading...</div>;
  }

  if (!roomData.room) {
    return <div>Room not found</div>;
  }

  if (!isInRoom) {
    return <JoinRoomDialog roomId={roomId} roomName={roomData.room.name} />;
  }

  return <Room roomData={roomData} />;
}
```

## Part 4: Component Migration Examples

### Join Room Dialog

```typescript
// src/components/room/join-room-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface JoinRoomDialogProps {
  roomId: Id<"rooms">;
  roomName: string;
}

export function JoinRoomDialog({ roomId, roomName }: JoinRoomDialogProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const joinRoom = useMutation(api.users.join);
  
  const [userName, setUserName] = useState("");
  const [isSpectator, setIsSpectator] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsJoining(true);
    try {
      const userId = await joinRoom({
        roomId,
        name: userName,
        isSpectator,
      });

      setUser({
        id: userId,
        name: userName,
        roomId,
      });

      // Router will automatically re-render and show the room
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-card p-6 rounded-lg border">
        <div>
          <h2 className="text-2xl font-bold">Join Room</h2>
          <p className="text-muted-foreground">{roomName}</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="spectator"
              checked={isSpectator}
              onCheckedChange={setIsSpectator}
            />
            <Label htmlFor="spectator">Join as spectator</Label>
          </div>

          <Button
            onClick={handleJoin}
            disabled={!userName.trim() || isJoining}
            className="w-full"
          >
            Join Room
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Part 5: Deployment

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Environment Variables

Add to Vercel:
- `NEXT_PUBLIC_CONVEX_URL` - From Convex dashboard
- `CONVEX_DEPLOY_KEY` - For production deployments

### Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

## Migration Checklist

- [ ] Create Next.js project structure
- [ ] Set up Convex backend
- [ ] Implement all Convex functions
- [ ] Create authentication context
- [ ] Migrate homepage component
- [ ] Migrate room components
- [ ] Migrate canvas components
- [ ] Set up routing
- [ ] Configure deployment
- [ ] Test all features
- [ ] Run E2E tests
- [ ] Deploy to staging
- [ ] Final production deployment

## Testing Considerations

1. **Unit Tests**: Update to use Convex mocks
2. **E2E Tests**: Update selectors and flows
3. **Load Testing**: Test with multiple concurrent rooms
4. **Real-time Testing**: Verify sub-100ms updates

This implementation guide provides the concrete steps needed to execute the migration plan successfully.