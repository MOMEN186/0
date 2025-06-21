git add Dockerfile
git commit -m "add Dockerfile for deployment"
git pushFROM node:20-alpine AS base
LABEL org.opencontainers.image.title="4RB ANIME" \
  org.opencontainers.image.description="Arabic Anime streaming service UI" \
  org.opencontainers.image.maintainer="admin@4rb-anime.com" \
  org.opencontainers.image.vendor="4rb-anime.com"

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static/ ./.next/static/
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
