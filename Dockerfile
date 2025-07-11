# ---------------------------
# 1. Builder stage
# ---------------------------
    FROM node:20-alpine AS builder

    ARG NEXT_PUBLIC_PROXY_URL
    ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build
    
    # ---------------------------
    # 2. Runner stage
    # ---------------------------
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    RUN apk add --no-cache curl
    
    RUN addgroup -g 1001 -S nodejs \
     && adduser -S nextjs -u 1001 -G nodejs
    
    # Copy only what's needed for the app to run
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    
    # Add healthcheck route manually
    RUN mkdir -p ./app/api/health && \
        echo "export async function GET() { return new Response('OK', { status: 200 }) }" > ./app/api/health/route.js
    
    # Set permissions
    RUN chown -R nextjs:nodejs /app
    USER nextjs
    
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV HOST=0.0.0.0
    
    HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
      CMD curl -f http://localhost:3000/api/health || exit 1
    
    EXPOSE 3000
    CMD ["node", "server.js"]
    