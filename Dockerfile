# ---------------------------------------------------
# 1) Builder stage – install deps & build
# ---------------------------------------------------
    FROM node:20-alpine AS builder

    # Build-time proxy URL arg (only used at build)
    ARG NEXT_PUBLIC_PROXY_URL
    ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
    
    WORKDIR /app
    
    # Install dev & production deps
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # Copy source & build
    COPY . .
    RUN npm run build
    
    # ---------------------------------------------------
    # 2) Runner stage – production
    # ---------------------------------------------------
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    # Pull in only production deps
    COPY package.json package-lock.json ./
    RUN npm ci --production
    
    # Copy built output from builder
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/next.config.mjs ./
    
    # Bind to all interfaces
    ENV NODE_ENV=production
    ENV HOST=0.0.0.0
    ENV PORT=3000
    
    EXPOSE 3000
    
    # Start with Next.js built‑in server
    CMD ["node", "server.js", "--hostname", "0.0.0.0", "--port", "3000"]
    