FROM node:24.10.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build user-service
EXPOSE 3001
CMD ["node", "dist/apps/user-service/main"]