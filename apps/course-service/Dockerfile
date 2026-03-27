FROM node:24.14.0-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps apps/
COPY libs libs/
COPY tsconfig.json nest-cli.json ./

RUN yarn install

FROM deps AS builder

COPY . .

RUN yarn build course-service

RUN yarn workspaces focus @lms/course-service --production && yarn cache clean

FROM node:24.14.0-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=builder --chown=nestjs:nodejs /app/.yarn ./.yarn
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/libs ./libs

USER nestjs

CMD ["node", "dist/apps/course-service/main"]
