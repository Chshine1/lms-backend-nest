FROM node:24.10.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build tenant-service
EXPOSE 3002
CMD ["node", "dist/apps/tenant-service/main"]