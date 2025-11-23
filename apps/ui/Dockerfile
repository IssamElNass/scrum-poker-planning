FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY apps/ui/package.json apps/ui/package-lock.json* ./apps/ui/
COPY packages/shared/package.json ./packages/shared/
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --workspace=apps/ui --workspace=packages/shared

# Build the shared package and Next.js app
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/ui/node_modules ./apps/ui/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/ui ./apps/ui
COPY package.json ./

# Build shared package
RUN cd packages/shared && npm run build

# Build Next.js app
WORKDIR /app/apps/ui
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/apps/ui/public ./public
COPY --from=builder /app/apps/ui/.next/standalone ./
COPY --from=builder /app/apps/ui/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/ui/server.js"]

