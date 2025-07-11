# 1) Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source & build
COPY . .
RUN npm run build

# 2) Runtime
FROM node:20-alpine
WORKDIR /app

# Install production deps only
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy built output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./ 

# Ensure we bind to all interfaces
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Use Next’s built-in start command
CMD ["npm", "start"]
