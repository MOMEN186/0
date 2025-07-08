#!/bin/sh
# Use Unix line endings (LF)

# Wait until Redis is accepting connections
while ! nc -z "$REDIS_HOST" "$REDIS_PORT"; do
  echo "Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."
  sleep 1
done

# Redis is up, starting proxy server
echo "Redis is up - starting proxy server"

# Start the proxy server
exec /app/server