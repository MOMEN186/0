# ---------------------------------------------------
# 1. Base image - security hardened
# ---------------------------------------------------
    FROM node:20-alpine AS base
    LABEL org.opencontainers.image.title="4RB ANIME"
    LABEL org.opencontainers.image.description="Arabic Anime streaming service UI"
    LABEL org.opencontainers.image.maintainer="admin@4rb-anime.com"
    LABEL org.opencontainers.image.vendor="4rb-anime.com"
    
    ENV NODE_ENV=production \
        PORT=3000
    
    # Install build tools
    RUN apk add --no-cache --virtual .build-deps \
        git \
        openssh-client
    
    WORKDIR /app
    
    # Copy package manifests
    COPY package.json package-lock.json ./
    
    # Install dependencies with npm
    RUN npm ci --only=production
    
    # Copy source and build
    COPY . .
    RUN npm run build
    
    # ---------------------------------------------------
    # Runner stage
    # ---------------------------------------------------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    # Create non-root user
    RUN addgroup -g 1001 -S nodejs && \
        adduser -S nextjs -u 1001
    
    # Copy built assets
    COPY --from=builder --chown=nextjs:nodejs /app/public ./public
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    
    HEALTHCHECK --interval=30s --timeout=3s \
      CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
    
    EXPOSE 3000
    CMD ["node", "server.js"]