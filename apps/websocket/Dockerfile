FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY apps/websocket/package.json apps/websocket/package-lock.json* ./apps/websocket/
COPY packages/shared/package.json ./packages/shared/
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --workspace=apps/websocket --workspace=packages/shared

# Build the shared package
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/websocket/node_modules ./apps/websocket/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/websocket ./apps/websocket
COPY package.json ./

# Build shared package
RUN cd packages/shared && npm run build

# Build websocket
RUN cd apps/websocket && npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/websocket/dist ./apps/websocket/dist
COPY --from=builder /app/apps/websocket/package.json ./apps/websocket/
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 5000

CMD ["node", "apps/websocket/dist/index.js"]

