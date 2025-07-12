# 1) Builder stage
FROM node:20-alpine AS builder
ARG NEXT_PUBLIC_PROXY_URL
ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
WORKDIR /app
RUN apk add --no-cache --virtual .build-deps git openssh-client
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
ENV NEXT_PUBLIC_PROXY_URL=${NEXT_PUBLIC_PROXY_URL}
RUN chown -R nextjs:nodejs /app
USER nextjs
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js", "--hostname", "0.0.0.0", "--port", "3000"]