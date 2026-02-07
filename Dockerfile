# Build Stage
FROM rust:alpine AS builder

WORKDIR /usr/src/slex-proxy

# Install build dependencies (openssl-dev, libc-dev for alpine)
RUN apk add --no-cache musl-dev openssl-dev

# Copy manifests first for improved caching
COPY slex-proxy/Cargo.toml slex-proxy/Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

# Copy actual source code
COPY slex-proxy/src ./src

# Touch main.rs to force rebuild
RUN touch src/main.rs
RUN cargo build --release

# Runtime Stage
FROM alpine:3.19

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libgcc

# Copy binary from builder
COPY --from=builder /usr/src/slex-proxy/target/release/slex-proxy .

EXPOSE 3001

CMD ["./slex-proxy"]
