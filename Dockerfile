# ---------------------------------------------------
# 1) Builder stage – install deps & build
# ---------------------------------------------------
    FROM node:20-alpine AS builder

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
    
    # Copy standalone build from builder
    COPY --from=builder /app/.next/standalone .
    COPY --from=builder /app/.next/static ./public/_next/static
    # Copy public static files
    COPY --from=builder /app/public ./public
    
    # Ensure we have minimal dependencies (if any extras)
    # Note: standalone build already includes required node_modules
    
    # Ownership and permissions
    RUN chown -R nextjs:nodejs /app
    USER nextjs
    
    # Configure environment
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV HOST=0.0.0.0
    
    # Expose app port
    EXPOSE 3000
    
    # Start the standalone server built by Next.js
    CMD ["node", "server.js", "--hostname", "0.0.0.0", "--port", "3000"]
    