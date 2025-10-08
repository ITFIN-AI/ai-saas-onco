FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Set working directory
WORKDIR /app

# Copy essential files for the build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/functions/package.json ./apps/functions/
COPY apps/web-app/package.json ./apps/web-app/
COPY packages/shared/package.json ./packages/shared/

# Copy scripts folder needed for prepare hook
COPY scripts ./scripts
COPY .husky ./.husky
COPY turbo.json ./turbo.json

# Make the prepare-docker script executable
RUN chmod +x scripts/prepare-docker.js scripts/approve-builds.js

# Approve build scripts automatically
ENV PNPM_AUTOAPPROVESCRIPTS=true
# Use our Docker-safe prepare script
ENV npm_config_prepare_script="prepare-docker"

# Create .husky directory if it doesn't exist
RUN mkdir -p .husky

# Copy the rest of the code
COPY . .

# Install dependencies only if node_modules is not mounted
RUN if [ ! -d "/app/node_modules" ]; then \
    pnpm install --unsafe-perm || pnpm run approve-builds && pnpm install --unsafe-perm; \
fi

## Build the project
#RUN pnpm build

# Expose ports
EXPOSE 3000 5000 9099 8080 4400 4500 9199

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "dev"]
