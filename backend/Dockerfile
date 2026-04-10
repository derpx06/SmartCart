# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Sharp (Cloudinary dependency): prebuild download can fail in Docker (timeout/network).
# libvips + build chain allow the install script to compile when prebuild aborts.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libvips-dev \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

ENV NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_TIMEOUT=120000

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Runtime libs if sharp was built against system libvips (harmless if unused).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libvips42 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]
