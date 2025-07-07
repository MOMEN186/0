#!/bin/sh
# Wait for Redis to be ready
echo "Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."

until nc -z "$REDIS_HOST" "$REDIS_PORT"; do
  sleep 1
done

echo "Redis is ready, starting proxy..."
exec /app/server
