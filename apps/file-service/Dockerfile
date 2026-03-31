FROM lms-deps-base:latest AS builder

COPY nest-cli.json tsconfig.json ./
COPY apps/file-service ./apps/file-service/
COPY libs ./libs/

RUN yarn nest build file-service

FROM node:24.14.0-alpine AS workspace
WORKDIR /app

COPY --from=builder /app/dist/apps/file-service/ ./
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./

COPY --from=builder --parents /app/apps/*/package.json /
COPY --from=builder --parents /app/libs/*/package.json /
COPY --from=builder /app/.yarn ./.yarn/

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

RUN yarn workspaces focus @lms/file-service --production && yarn cache clean

FROM node:24.14.0-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=workspace --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=workspace --chown=nestjs:nodejs /app/apps ./apps
COPY --from=workspace --chown=nestjs:nodejs /app/libs ./libs

USER nestjs

CMD ["node", "apps/file-service/src/main.js"]
