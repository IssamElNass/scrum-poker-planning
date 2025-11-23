FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY apps/backend/package.json apps/backend/package-lock.json* ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --workspace=apps/backend --workspace=packages/shared

# Build the shared package
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
COPY package.json ./

# Build shared package
RUN cd packages/shared && npm run build

# Build backend
RUN cd apps/backend && npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/scripts ./apps/backend/scripts
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Copy database files
COPY db ./db

EXPOSE 4000

CMD ["node", "apps/backend/dist/index.js"]

