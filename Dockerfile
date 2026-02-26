# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
# Run the build and list files to verify where the output went
RUN pnpm run build && ls -la

# Stage 2: Run
FROM node:20-slim
WORKDIR /app

# Match the output folder from the 'ls -la' step above
# Usually TanStack Start/Nitro is .output
COPY --from=builder /app/.output ./.output

EXPOSE 3000
# Ensure this path matches the entry point
CMD ["node", ".output/server/index.mjs"]