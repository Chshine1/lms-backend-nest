FROM node:24.10.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build gateway
EXPOSE 3000
CMD ["node", "dist/apps/gateway/main"]