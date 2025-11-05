# Multi-stage build for RB9K API service (cleaned)

ARG NODE_IMAGE=node:22-alpine
ARG API_PORT=4000

FROM ${NODE_IMAGE} AS core-builder
WORKDIR /app
# Copy monorepo package manifests needed for workspace install
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/api/package.json ./packages/api/

# Copy core source and build
COPY packages/core ./packages/core
WORKDIR /app/packages/core
RUN npm ci && npm run build

FROM ${NODE_IMAGE} AS api-builder
WORKDIR /app
# Copy package manifests and built core
COPY package*.json ./
COPY packages/api/package.json ./packages/api/
COPY --from=core-builder /app/packages/core ./packages/core

# Copy API source files and build
COPY packages/api ./packages/api
WORKDIR /app/packages/api
RUN npm ci && \
    mkdir -p ./types && \
    echo 'declare module "better-sqlite3";' > ./types/better-sqlite3.d.ts && \
    echo 'declare module "swagger-ui-express";' > ./types/swagger-ui-express.d.ts && \
    echo 'declare module "swagger-jsdoc";' > ./types/swagger-jsdoc.d.ts && \
    npm run build

FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
RUN mkdir -p /app/packages/core /app/packages/api

# Copy built artifacts and package manifests
COPY --from=api-builder /app/packages/api/dist /app/packages/api/dist
COPY --from=api-builder /app/packages/api/package.json /app/packages/api/package.json
COPY --from=api-builder /app/packages/core/dist /app/packages/core/dist
COPY --from=api-builder /app/packages/core/package.json /app/packages/core/package.json

WORKDIR /app/packages/core
# install production deps for core
RUN npm ci --omit=dev

WORKDIR /app/packages/api
# install production deps for api and link local core
RUN npm ci --omit=dev && npm link ../core || true

EXPOSE ${API_PORT}

WORKDIR /app/packages/api
CMD ["node", "dist/index.js"]
