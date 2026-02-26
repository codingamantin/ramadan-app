# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

# Copy package files first to leverage Docker caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the TanStack Start / Vinxi app
RUN npm run build

# Stage 2: Run
FROM node:20-slim
WORKDIR /app

# Copy the build output from the builder stage
# TanStack Start defaults to .output
COPY --from=builder /app/.output ./.output

# Optional: Copy package.json if your runtime needs it
COPY --from=builder /app/package.json ./

EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", ".output/server/index.mjs"]