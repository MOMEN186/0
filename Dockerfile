# ---------------------------------------------------
# 1. Build stage - install dependencies & build
# ---------------------------------------------------
    FROM node:20-alpine AS builder

    # Copy environment variables for Next.js
    # DOKploy injects runtime env under window.__ENV, but Next needs build-time for public vars
    COPY .env.production .env
    
    WORKDIR /app
    RUN apk add --no-cache --virtual .build-deps git openssh-client
    
    COPY package.json package-lock.json ./
    RUN npm ci
    
    COPY . .
    # INLINE any NEXT_PUBLIC_ vars from .env.production
    RUN npm run build
    
    # ---------------------------------------------------
    # 2. Runner stage - production optimized
    # ---------------------------------------------------
    FROM node:20-alpine AS runner
    WORKDIR /app
    RUN apk add --no-cache curl
    
    # Create non-root user
    RUN addgroup -g 1001 -S nodejs \
        && adduser -S nextjs -u 1001 -G nodejs
    
    # Copy only production artifacts
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/standalone ./.next/standalone
    COPY --from=builder /app/.next/static ./.next/static
    
    # Copy package.json for `next start`
    COPY --from=builder /app/package.json ./
    
    RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app
    USER nextjs
    
    # Expose the port your Next.js app runs on
    ENV NODE_ENV=production
    ENV PORT=3000
    EXPOSE 3000
    
    CMD ["node", ".next/standalone/server.js", "--hostname", "0.0.0.0", "--port", "3000"]
    