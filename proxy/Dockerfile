# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Download dependencies first for better caching
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Copy source code
COPY . .

# Build arguments
ARG TARGETOS=linux
ARG TARGETARCH=amd64

# Build application
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -ldflags="-w -s -X main.Version=$(git describe --tags --always)" \
    -o /app/server cmd/main.go

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Metadata
LABEL org.opencontainers.image.title="M3U8 Proxy" \
      org.opencontainers.image.description="High-performance M3U8 proxy server" \
      org.opencontainers.image.maintainer="dovakiin0@kitsunee.online" \
      org.opencontainers.image.source="https://github.com/dovakiin0/proxy-m3u8.git" \
      org.opencontainers.image.vendor="kitsunee.online"

# Install runtime dependencies
RUN apk --no-cache add \
    ca-certificates \
    tzdata \
    && update-ca-certificates

# Copy built binary
COPY --from=builder /app/server /app/server

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --quiet --tries=1 --spider http://localhost:4040/health || exit 1

# Expose port
EXPOSE 4040

# Run the application
ENTRYPOINT ["/app/server"]
CMD ["--port", "4040"]