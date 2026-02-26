# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-slim
WORKDIR /app

# Copy the dist folder instead of .output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000
ENV NODE_ENV=production

# Based on your output, we start the server from the dist folder
# Note: If this fails, we may need to check if 'npm run start' 
# or a specific entry point is needed.
CMD ["node", "dist/server/index.js"]