# Multi-stage build for RB9K API service

# Stage 1: Build the core package
FROM node:22-alpine AS core-builder
WORKDIR /app
# Copy the monorepo structure (package.json files) for proper npm workspaces
COPY package.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/api/package.json ./packages/api/
# Copy the core package source files
COPY packages/core ./packages/core
# Build the core package
WORKDIR /app/packages/core
RUN npm install && npm run build

# Stage 2: Build the API package
FROM node:22-alpine AS api-builder
WORKDIR /app
# Copy the monorepo structure
COPY package.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/api/package.json ./packages/api/
# Copy built core package
COPY --from=core-builder /app/packages/core ./packages/core
# Copy API source files
COPY packages/api ./packages/api
# Build API
WORKDIR /app/packages/api
RUN npm install && \
    # Create types directory if it doesn't exist
    mkdir -p ./types && \
    # Create type declarations for modules without declaration files
    echo 'declare module "better-sqlite3";' > ./types/better-sqlite3.d.ts && \
    echo 'declare module "swagger-ui-express";' > ./types/swagger-ui-express.d.ts && \
    echo 'declare module "swagger-jsdoc";' > ./types/swagger-jsdoc.d.ts && \
    npm run build

# Stage 3: Runtime
FROM node:22-alpine AS runtime
WORKDIR /app
# Set up directory structure
RUN mkdir -p /app/packages/core /app/packages/api

# Copy the API package
COPY --from=api-builder /app/packages/api/dist /app/packages/api/dist
COPY --from=api-builder /app/packages/api/package.json /app/packages/api/package.json

# Copy the core package
COPY --from=api-builder /app/packages/core/dist /app/packages/core/dist
COPY --from=api-builder /app/packages/core/package.json /app/packages/core/package.json

# Install dependencies
WORKDIR /app/packages/api
RUN npm install --omit=dev && \
    npm link ../core

# Expose the port that the API runs on
EXPOSE 4000

# Start the API service
WORKDIR /app/packages/api

# Use a simple CMD that will keep the container running
CMD ["node", "dist/index.js"]
