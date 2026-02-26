# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-slim
WORKDIR /app
# TanStack Start builds to the .output directory
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]