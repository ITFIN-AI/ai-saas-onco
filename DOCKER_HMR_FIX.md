# Docker HMR Auto-Refresh Fix

## Problem
The web app was constantly refreshing every few seconds when running `docker compose up app`. This was caused by misconfigured Hot Module Replacement (HMR) settings in Vite.

## Root Causes

1. **Production HMR Configuration in Development**
   - The `vite.config.ts` was configured with production HMR settings:
     - Host: `oncopomoc.pl`
     - Protocol: `wss` (WebSocket Secure)
     - Port: `443`
   - These settings don't work in local Docker development, causing connection failures and constant refreshing

2. **Docker File Watching Issues**
   - Docker on some systems doesn't properly detect file changes
   - Node modules were being watched unnecessarily
   - Build artifacts were being watched

## Solutions Applied

### 1. Updated Vite Configuration (`apps/web-app/vite.config.ts`)

#### Added Conditional HMR Configuration
```typescript
hmr: process.env.NODE_ENV === 'production' ? {
  host: 'oncopomoc.pl',
  protocol: 'wss',
  clientPort: 443
} : {
  // For local development (Docker)
  host: 'localhost',
  protocol: 'ws',
  port: 3000
}
```

#### Added File Watching with Polling
```typescript
watch: {
  usePolling: process.env.NODE_ENV === 'development',
  interval: 1000, // Poll every 1 second
  ignored: ['**/node_modules/**', '**/dist/**', '**/build/**']
}
```

#### Added localhost to Allowed Hosts
```typescript
allowedHosts: ['oncopomoc.pl', 'localhost']
```

### 2. Updated Docker Compose (`docker-compose.yml`)

#### Excluded node_modules from Volume Watching
Changed from:
```yaml
volumes:
  - .:/app
  - ./node_modules:/app/node_modules
  - ./apps/web-app/node_modules:/app/apps/web-app/node_modules
  ...
```

To:
```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/apps/web-app/node_modules
  - /app/apps/functions/node_modules
  - /app/packages/shared/node_modules
  - /app/apps/web-app/build
  - /app/apps/web-app/.vite
```

This creates anonymous volumes for these directories, preventing Docker from watching changes in:
- node_modules folders (performance improvement)
- build output directories (prevents rebuild loops)
- Vite cache directory (prevents cache-related refreshes)

#### Added Environment Variables for Polling
```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WATCHPACK_POLLING=true
```

These ensure file watchers use polling, which is more reliable in Docker environments.

## How to Apply the Fix

1. **Stop the running containers:**
   ```bash
   docker compose down
   ```

2. **Remove old containers and volumes (optional but recommended):**
   ```bash
   docker compose down -v
   docker system prune -f
   ```

3. **Rebuild the containers:**
   ```bash
   docker compose build app
   ```

4. **Start the app:**
   ```bash
   docker compose up app
   ```

## Expected Behavior After Fix

✅ **Development (Docker):**
- HMR uses WebSocket (ws) on localhost:3000
- File changes trigger HMR without full page refresh
- No constant auto-refreshing
- Polling enabled for reliable file watching

✅ **Production:**
- HMR uses WebSocket Secure (wss) on oncopomoc.pl:443
- Proper SSL/TLS support
- Domain-specific configuration

## Testing the Fix

1. Start the app with `docker compose up app`
2. Open browser to `http://localhost:3000`
3. The app should load without constant refreshing
4. Make a change to a source file (e.g., `Welcome.tsx`)
5. The change should appear without full page reload (HMR)

## Performance Notes

- **Polling Interval:** Set to 1000ms (1 second) for file watching
  - If you want faster updates: reduce to `500` in `vite.config.ts`
  - If you want lower CPU usage: increase to `2000` or `3000`

- **Memory Usage:** Excluding node_modules from volume watching significantly reduces memory usage

## Troubleshooting

### If the app still refreshes constantly:

1. **Check browser console for errors:**
   - Look for WebSocket connection errors
   - Look for HMR connection issues

2. **Verify environment variable:**
   ```bash
   docker compose exec app env | grep NODE_ENV
   ```
   Should show: `NODE_ENV=development`

3. **Check Vite dev server logs:**
   ```bash
   docker compose logs -f app
   ```
   Look for HMR connection messages

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Linux/Windows) or Cmd+Shift+R (Mac)
   - Or open DevTools > Network > Disable cache

5. **Try increasing polling interval:**
   In `vite.config.ts`, change:
   ```typescript
   interval: 2000, // 2 seconds instead of 1
   ```

### If HMR doesn't work at all:

1. **Check if file changes are detected:**
   ```bash
   docker compose exec app ls -la /app/apps/web-app/src/pages/Welcome/
   ```

2. **Restart the container:**
   ```bash
   docker compose restart app
   ```

3. **Check Vite config syntax:**
   ```bash
   docker compose exec app cat /app/apps/web-app/vite.config.ts
   ```

## Additional Resources

- [Vite Server Options](https://vitejs.dev/config/server-options.html)
- [Vite HMR Options](https://vitejs.dev/config/server-options.html#server-hmr)
- [Docker Volume Best Practices](https://docs.docker.com/storage/volumes/)

## Related Files Modified

1. `/apps/web-app/vite.config.ts` - HMR and watch configuration
2. `/docker-compose.yml` - Volume and environment configuration

