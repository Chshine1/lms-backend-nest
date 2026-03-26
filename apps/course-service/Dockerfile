FROM node:24.12.0-alpine
WORKDIR /app

# Enable corepack for Yarn 4
RUN corepack enable

COPY package.json yarn.lock ./
COPY .yarnrc ./
COPY .yarn ./.yarn

RUN yarn install

COPY . .
RUN yarn build course-service

EXPOSE 3002
CMD ["node", "dist/apps/course-service/main"]