# Build Stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
# Note: npm ci will fail if the 'npm:nitro-nightly' alias isn't in your lockfile
RUN npm install 
COPY . .
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app

# Copy the Nitro output
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Nitro's standard entry point
CMD ["node", ".output/server/index.mjs"]