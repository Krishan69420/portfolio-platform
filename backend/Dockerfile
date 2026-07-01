# ─── Stage 1: Chef (dependency planner) ──────────────────────────────────────
FROM rust:1.82-alpine AS chef
RUN apk add --no-cache musl-dev openssl-dev pkgconfig
RUN cargo install cargo-chef --locked
WORKDIR /app

# ─── Stage 2: Planner ────────────────────────────────────────────────────────
FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ─── Stage 3: Builder ────────────────────────────────────────────────────────
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json

# Build dependencies first (cached layer)
RUN cargo chef cook --release --recipe-path recipe.json

# Build the application
COPY . .
RUN cargo build --release --bin portfolio-backend

# ─── Stage 4: Runtime (minimal image) ────────────────────────────────────────
FROM alpine:3.20 AS runtime
RUN apk add --no-cache ca-certificates libgcc curl

# Create non-root user
RUN addgroup -g 1001 -S portfolio && \
    adduser -u 1001 -S portfolio -G portfolio

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/portfolio-backend /app/portfolio-backend

# Copy migrations
COPY --from=builder /app/migrations /app/migrations

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R portfolio:portfolio /app

USER portfolio

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:8080/api/portfolio/personal || exit 1

CMD ["/app/portfolio-backend"]
