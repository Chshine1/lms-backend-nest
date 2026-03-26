# ==========================
# Stage 1: Dependencies
# ==========================
FROM node:24.12.0-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps apps/
COPY libs libs/
COPY tsconfig.json nest-cli.json ./

RUN yarn install

# ==========================
# Stage 2: Build
# ==========================
FROM deps AS builder

COPY . .

RUN yarn build gateway

# ==========================
# Stage 3: Runtime
# ==========================
FROM node:24.12.0-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=deps --chown=nestjs:nodejs /app/.yarn ./.yarn
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

USER nestjs

EXPOSE 3000

CMD ["node", "dist/apps/gateway/main"]
