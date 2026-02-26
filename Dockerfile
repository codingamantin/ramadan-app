# syntax=docker/dockerfile:1

# ---- deps (all dependencies, incl. dev) ----
FROM node:20-alpine AS deps
WORKDIR /app

# Enable package managers like pnpm/yarn if the repo uses them
RUN corepack enable

# Copy manifest + lockfiles first for better layer caching
COPY package.json ./
COPY package-lock.json* npm-shrinkwrap.json* ./
COPY yarn.lock* ./
COPY pnpm-lock.yaml* ./

# Install dependencies based on whichever lockfile exists
RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then npm ci; \
    else npm install; \
    fi

# ---- build (optional) ----
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run build only if a build script exists
RUN set -eux; \
    if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.build ? 0 : 1)"; then \
        npm run build; \
    else \
        echo "No build script found; skipping build"; \
    fi

# ---- prod-deps (production-only dependencies) ----
FROM node:20-alpine AS prod-deps
WORKDIR /app
RUN corepack enable

COPY package.json ./
COPY package-lock.json* npm-shrinkwrap.json* ./
COPY yarn.lock* ./
COPY pnpm-lock.yaml* ./

RUN set -eux; \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile --prod; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile --production=true; \
    elif [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then npm ci --omit=dev; \
    else npm install --omit=dev; \
    fi

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy production node_modules and app (including any build output)
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app ./

# Use non-root user where possible
USER node

EXPOSE 3000

# Assumes your package.json defines a "start" script
CMD ["npm", "run", "start"]