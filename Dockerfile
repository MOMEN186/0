# ---------------------------------------------------
# 1. Build stage - install dependencies & build
# ---------------------------------------------------
    
    ARG CACHE_BUST=1
    FROM node:20-alpine AS builder
    LABEL org.opencontainers.image.title="4RB ANIME"
    LABEL org.opencontainers.image.description="Arabic Anime streaming service UI"
    LABEL org.opencontainers.image.maintainer="admin@4rb-anime.com"
    LABEL org.opencontainers.image.vendor="4rb-anime.com"
    
    # Set working directory
    WORKDIR /app
    
    RUN apk add --no-cache curl
    # Install build tools and dependencies
    RUN apk add --no-cache --virtual .build-deps \
        git \
        openssh-client
    
    # Copy manifests and install all dependencies
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # Copy source and build application
    COPY  . . 
    RUN npm run build
    
    # ---------------------------------------------------
    # 2. Runner stage - production optimized
    # ---------------------------------------------------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    # Create non-root user
    RUN addgroup -g 1001 -S nodejs \
        && adduser -S nextjs -u 1001 -G nodejs
    
    # Copy built assets from builder
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/standalone .next/standalone
    COPY --from=builder /app/.next/static ./.next/static
    
    # Switch to unprivileged user
    RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next
    USER nextjs
    
    # Healthcheck
    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1
    
    EXPOSE 3000
    CMD ["node", ".next/standalone/server.js"]