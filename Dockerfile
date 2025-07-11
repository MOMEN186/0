# ---------------------------------------------------
# 1) Builder stage – install deps & build
# ---------------------------------------------------
    FROM node:20-alpine AS builder

    # Build-time arg for proxy URL
    ARG NEXT_PUBLIC_PROXY_URL
    ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
    
    WORKDIR /app
    
    # Install dependencies
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # Copy source & build
    COPY . .
    RUN npm run build
    
    # ---------------------------------------------------
    # 2) Runner stage – production optimized
    # ---------------------------------------------------
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    # Create non-root user
    RUN addgroup -g 1001 -S nodejs \
     && adduser -S nextjs -u 1001 -G nodejs
    
    # Copy built standalone output
    COPY --from=builder /app/.next/standalone /app
    # Copy static assets
    COPY --from=builder /app/public ./public
    
    # Switch to non-root
    USER nextjs
    
    # Environment
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV HOST=0.0.0.0
    
    # Healthcheck (optional)
    # HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    #   CMD curl -f http://localhost:3000/api/health || exit 1
    
    EXPOSE 3000
    
    # Start the standalone server
    CMD ["node", "server.js", "--hostname", "0.0.0.0", "--port", "3000"]
    