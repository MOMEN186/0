# ---------------------------------------------------
# 1) Builder stage – install deps & build
# ---------------------------------------------------
    FROM node:20-alpine AS builder

    # Accept build-time environment variables for public Next.js vars
    ARG NEXT_PUBLIC_PROXY_URL
    ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
    
    WORKDIR /app
    RUN apk add --no-cache --virtual .build-deps git openssh-client
    
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
    RUN apk add --no-cache curl
    
    # Create non-root user
    RUN addgroup -g 1001 -S nodejs \
     && adduser -S nextjs -u 1001 -G nodejs
    
    # Copy standalone artifacts
    COPY --from=builder /app/.next/standalone .
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    # Pass through the public env into runtime (if needed)
    ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
    
    # Set ownership & permissions
    RUN chown -R nextjs:nodejs /app
    USER nextjs
    
    # Runtime env
    ENV NODE_ENV=production
    ENV PORT=3000
    EXPOSE 3000
    
    # Start the standalone server
    CMD ["node", "server.js", "--hostname", "0.0.0.0", "--port", "3000"]
    