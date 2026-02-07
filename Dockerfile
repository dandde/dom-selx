# --- Frontend Build Stage ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY slex-frontend/package.json slex-frontend/package-lock.json ./
RUN npm ci
COPY slex-frontend ./
RUN npm run build

# --- Backend Build Stage ---
FROM rust:alpine AS backend-builder
WORKDIR /usr/src/slex-proxy
RUN apk add --no-cache musl-dev openssl-dev
COPY slex-proxy/Cargo.toml slex-proxy/Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
COPY slex-proxy/src ./src
RUN touch src/main.rs
RUN cargo build --release

# --- Runtime Stage ---
FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache libgcc

# Copy Backend Binary
COPY --from=backend-builder /usr/src/slex-proxy/target/release/slex-proxy .

# Copy Frontend Assets
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 3001
CMD ["./slex-proxy"]
