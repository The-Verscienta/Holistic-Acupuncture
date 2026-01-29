# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Enable Astro DB for production build
# Replace the integrations line to include db()
RUN sed -i 's/integrations: \[sitemap(), react()\]/integrations: [sitemap(), react(), db()]/' astro.config.mjs && \
    sed -i 's|// import db from|import db from|' astro.config.mjs

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 astro

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set ownership
RUN chown -R astro:nodejs /app

USER astro

# Expose port
EXPOSE 4321

ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Start the server
CMD ["node", "./dist/server/entry.mjs"]
