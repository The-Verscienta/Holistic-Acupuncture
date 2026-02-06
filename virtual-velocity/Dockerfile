# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm ci if lock file exists, otherwise npm install)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source files
COPY . .

# Create data directory for SQLite database
# Note: astro.config.mjs automatically includes db() on Linux (non-Windows-ARM64)
RUN mkdir -p /app/data

# Set database file location for build
ENV ASTRO_DATABASE_FILE=/app/data/astro.db

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 astro

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/data ./data

# Set ownership
RUN chown -R astro:nodejs /app

USER astro

# Expose port
EXPOSE 4321

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
ENV ASTRO_DATABASE_FILE=/app/data/astro.db

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
