
# Adapted from https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# Install dependencies only when needed
FROM node:lts-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --force

# Rebuild the source code only when needed
FROM node:lts-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma generate
RUN npm run build --force

# Production image, copy all the files and run next
FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs ./prisma ./prisma
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME 192.168.0.12
CMD ["node", "server.js"]