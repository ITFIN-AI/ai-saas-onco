FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.4.1

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_AUTOAPPROVESCRIPTS=true

WORKDIR /app

# ============================================
# Dependencies stage - for better caching
# ============================================
FROM base AS dependencies

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files
COPY apps/functions/package.json ./apps/functions/
COPY apps/web-app/package.json ./apps/web-app/
COPY packages/shared/package.json ./packages/shared/

# Copy shared package source (required for workspace dependencies)
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json

# Copy scripts needed for installation
COPY scripts ./scripts
RUN mkdir -p .husky

# Install dependencies
# For development, we allow lockfile updates if packages changed
# --no-frozen-lockfile allows updating lockfile if needed
# --prefer-offline uses cache when possible
RUN pnpm install --no-frozen-lockfile --prefer-offline --ignore-scripts || \
    pnpm install --no-frozen-lockfile --ignore-scripts

# Run any necessary prepare scripts
RUN pnpm run approve-builds || true

# ============================================
# Development stage
# ============================================
FROM base AS development

# Copy installed dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/functions/node_modules ./apps/functions/node_modules
COPY --from=dependencies /app/apps/web-app/node_modules ./apps/web-app/node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY scripts ./scripts
RUN mkdir -p .husky

# Copy all source code
COPY apps ./apps
COPY packages ./packages
COPY firebase.json firestore.rules firestore.indexes.json storage.rules database.rules.json ./

# Expose ports
EXPOSE 3000 5000 9099 8080 4400 4500 9199

# Set environment for development
ENV NODE_ENV=development

# Start the application
CMD ["pnpm", "dev"]
