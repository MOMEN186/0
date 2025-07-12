# ---------------------------------------------------
# 1) Builder stage - install deps & build
# ---------------------------------------------------
    FROM node:20-alpine AS builder

    # Accept proxy URL at build-time
    ARG NEXT_PUBLIC_PROXY_URL
    ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
    
    WORKDIR /app
    RUN apk add --no-cache --virtual .build-deps git openssh-client
    
    COPY package.json package-lock.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build
    
    # ---------------------------------------------------
    # 2) Runner stage - production optimized
    # ---------------------------------------------------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    # Install curl for healthchecks
    RUN apk add --no-cache curl
    
    # Create non-root user
    RUN addgroup -g 1001 -S nodejs \
     && adduser -S nextjs -u 1001 -G nodejs
    
    # Copy build artifacts
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    # Set proxy URL for runtime
    ARG NEXT_PUBLIC_PROXY_URL
    ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
    
    # Set permissions
    RUN chown -R nextjs:nodejs /app
    USER nextjs
    
    # Configure runtime
    ENV NODE_ENV=production
    ENV PORT=3000
    EXPOSE 3000
    
    # Start server
    CMD ["node", "server.js", "--hostname", "0.0.0.0", "--port", "3000"]