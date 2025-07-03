# ---------------------------------------------------
# 1. Base image with labels - security hardened
# ---------------------------------------------------
FROM node:20-alpine AS base
LABEL org.opencontainers.image.title="4RB ANIME" \
      org.opencontainers.image.description="Arabic Anime streaming service UI" \
      org.opencontainers.image.maintainer="admin@4rb-anime.com" \
      org.opencontainers.image.vendor="4rb-anime.com"

# Set production environment and default port
ENV NODE_ENV=production \
    PORT=3000

# Install essential build tools and enable pnpm
RUN apk add --no-cache --virtual .build-deps \
    git \
    openssh-client && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

# ---------------------------------------------------
# 2. Deps stage: minimal dependencies
# ---------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy only dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------
# 3. Builder stage: optimized build process
# ---------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application files with proper permissions
COPY --chown=node:node . .

# Set required build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090 \
    NEXT_PUBLIC_PROXY_URL=http://localhost:4040

# Build application (uses the script from package.json which includes --no-lint)
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Clean build dependencies
RUN apk del .build-deps

# ---------------------------------------------------
# 4. Runner stage: production-optimized image
# ---------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user with strict permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built assets with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to unprivileged user
USER nextjs

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

EXPOSE 3000

# Start the server
CMD ["node", "server.js"]