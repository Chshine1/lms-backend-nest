FROM node:24.14.0-alpine AS deps
WORKDIR /app

ENV YARN_CACHE_FOLDER=/yarn-cache

COPY package.json yarn.lock .yarnrc.yml ./
COPY --parents apps/*/package.json ./
COPY --parents libs/*/package.json ./
COPY .yarn ./.yarn/

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

RUN yarn install --immutable

FROM deps AS builder

COPY nest-cli.json tsconfig.json ./
COPY apps/course-enrollment-service ./apps/course-enrollment-service/
COPY libs ./libs/

RUN yarn nest build course-enrollment-service

FROM node:24.14.0-alpine AS workspace
WORKDIR /app

ENV YARN_CACHE_FOLDER=/yarn-cache
COPY --from=deps /yarn-cache /yarn-cache

COPY --from=builder /app/dist/apps/course-enrollment-service/ ./
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./

COPY --from=builder --parents /app/apps/*/package.json /
COPY --from=builder --parents /app/libs/*/package.json /
COPY --from=builder /app/.yarn ./.yarn/

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

RUN yarn workspaces focus @lms/course-enrollment-service --production && yarn cache clean

FROM node:24.14.0-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=workspace --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=workspace --chown=nestjs:nodejs /app/apps ./apps
COPY --from=workspace --chown=nestjs:nodejs /app/libs ./libs

USER nestjs

CMD ["node", "apps/course-enrollment-service/src/main.js"]
