# Multi-Stage Dockerfile for TravelSphere Platform
# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy application source code
COPY . .

# Run linter and production build
RUN npm run lint
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built dist files and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./

# Install production dependencies for server
RUN npm ci --only=production

EXPOSE 3000
EXPOSE 5000

# Default entry command runs the API server
CMD ["node", "server/server.js"]
