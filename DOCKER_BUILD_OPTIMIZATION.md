# Docker Build Optimization Guide

## Problem
The original Docker build was taking 30+ minutes due to:
1. Double installation logic with OR fallback
2. No Docker layer caching
3. Inefficient dependency installation
4. No `.dockerignore` file
5. Copying unnecessary files

## Solution: Multi-Stage Build with pnpm Fetch

### Key Optimizations

#### 1. **Multi-Stage Build**
Separates dependency installation from the final image:
- `base` stage: Common configuration
- `dependencies` stage: Install all dependencies (cached)
- `development` stage: Copy dependencies + source code

#### 2. **pnpm fetch Command**
```dockerfile
RUN pnpm fetch --ignore-scripts
```
- Downloads all packages to pnpm store
- Cached separately from installation
- Only re-runs when `pnpm-lock.yaml` changes

#### 3. **Efficient Installation**
```dockerfile
RUN pnpm install --frozen-lockfile --prefer-offline --ignore-scripts
```
- `--frozen-lockfile`: Don't update lockfile
- `--prefer-offline`: Use local cache
- `--ignore-scripts`: Skip prepare scripts initially

#### 4. **.dockerignore File**
Prevents copying unnecessary files:
- `node_modules` (will be installed in container)
- Build artifacts (`dist`, `build`, `.vite`)
- Cache directories
- IDE and OS files

#### 5. **Layer Caching Strategy**
```
1. Copy package files only → cached until they change
2. Fetch dependencies → cached until lockfile changes
3. Install dependencies → uses fetched cache
4. Copy source code → only re-runs when code changes
```

## Build Time Comparison

### Before Optimization
```bash
docker compose build app
# Time: 30+ minutes every time
```

### After Optimization

#### First Build (Cold Cache)
```bash
docker compose build app
# Time: 5-10 minutes (downloads all dependencies)
```

#### Subsequent Builds (Warm Cache)
```bash
# If only source code changed
docker compose build app
# Time: 10-30 seconds

# If dependencies changed
docker compose build app
# Time: 2-5 minutes
```

## How to Use

### Clean Build (Recommended First Time)
```bash
# Remove old containers and images
docker compose down -v
docker system prune -f

# Build with optimized Dockerfile
docker compose build app

# Start the app
docker compose up app
```

### Quick Rebuild (After Code Changes)
```bash
# Docker will use cached layers
docker compose build app
docker compose up app
```

### Rebuild with No Cache (If Issues)
```bash
docker compose build --no-cache app
```

## Build Cache Breakdown

### What Gets Cached
✅ **Base image** (node:22-alpine)  
✅ **pnpm installation** (global)  
✅ **Workspace configuration** (package.json, lockfile)  
✅ **Dependency fetch** (pnpm fetch)  
✅ **Dependency installation** (node_modules)  

### What Triggers Rebuild
🔄 **Changes to source code** → Fast (10-30 seconds)  
🔄 **Changes to package.json** → Medium (2-5 minutes)  
🔄 **Changes to pnpm-lock.yaml** → Medium (2-5 minutes)  
🔄 **Changes to Dockerfile** → Full rebuild  

## Advanced: Using BuildKit for Even Faster Builds

### Enable BuildKit
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### Build with BuildKit Cache
```bash
# Build with cache mount (fastest option)
DOCKER_BUILDKIT=1 docker compose build app
```

### BuildKit Benefits
- Parallel build stages
- Better caching
- Faster dependency downloads
- Smart layer skipping

## Dockerfile Structure Explained

### Stage 1: Base
```dockerfile
FROM node:22-alpine AS base
RUN npm install -g pnpm@10.4.1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
```
- Sets up common environment
- Installs pnpm once
- Reused by all other stages

### Stage 2: Dependencies
```dockerfile
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ...
RUN pnpm fetch --ignore-scripts
RUN pnpm install --frozen-lockfile --prefer-offline
```
- Installs all dependencies
- Heavily cached
- Only reruns when dependencies change

### Stage 3: Development
```dockerfile
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY apps ./apps
COPY packages ./packages
```
- Copies installed dependencies
- Adds source code
- Creates final development image

## Troubleshooting

### Build Still Slow?

1. **Check Docker BuildKit is enabled:**
   ```bash
   docker version | grep BuildKit
   ```

2. **Prune old images and cache:**
   ```bash
   docker system prune -a
   docker builder prune -a
   ```

3. **Use build cache mount (BuildKit):**
   ```bash
   DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker compose build app
   ```

4. **Check disk space:**
   ```bash
   docker system df
   ```

### Dependencies Not Installing?

1. **Clear pnpm cache in container:**
   ```bash
   docker compose run --rm app pnpm store prune
   ```

2. **Rebuild without cache:**
   ```bash
   docker compose build --no-cache app
   ```

3. **Check logs:**
   ```bash
   docker compose build app 2>&1 | tee build.log
   ```

### Cache Not Working?

1. **Ensure .dockerignore exists:**
   ```bash
   cat .dockerignore
   ```

2. **Check file timestamps:**
   - Docker cache uses file modification times
   - Git operations can change timestamps

3. **Use consistent file copying order:**
   - The Dockerfile copies files in optimal order for caching

## Performance Tips

### 1. Use BuildKit Cache Mounts
Create a custom Dockerfile with cache mounts:
```dockerfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline
```

### 2. Parallel Builds
Build multiple services in parallel:
```bash
docker compose build --parallel
```

### 3. Regular Cleanup
Clean up old images weekly:
```bash
docker image prune -a --filter "until=168h"
```

### 4. Monitor Build Times
```bash
time docker compose build app
```

## Production Build

For production, create a separate stage:
```dockerfile
FROM base AS production
COPY --from=dependencies /app/node_modules ./node_modules
COPY apps ./apps
COPY packages ./packages
RUN pnpm build
ENV NODE_ENV=production
CMD ["pnpm", "start"]
```

Build for production:
```bash
docker build --target production -t app:prod .
```

## Summary

### Before
- ❌ 30+ minutes build time
- ❌ No caching
- ❌ Reinstalls everything
- ❌ Inefficient layer usage

### After
- ✅ 10-30 seconds for code changes
- ✅ 2-5 minutes for dependency changes
- ✅ 5-10 minutes for first build
- ✅ Efficient layer caching
- ✅ Multi-stage optimization

## Resources
- [pnpm in Docker](https://pnpm.io/docker)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker BuildKit](https://docs.docker.com/build/buildkit/)

