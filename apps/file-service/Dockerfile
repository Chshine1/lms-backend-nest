FROM node:24.12.0-alpine
WORKDIR /app

# Enable corepack for Yarn 4
RUN corepack enable

COPY package.json yarn.lock ./
COPY .yarnrc ./
COPY .yarn ./.yarn

RUN yarn install

COPY . .
RUN yarn build file-service

CMD ["node", "dist/apps/file-service/main"]