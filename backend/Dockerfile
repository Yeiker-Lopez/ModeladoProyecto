# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa final: producción
FROM node:20-alpine

WORKDIR /app

# Solo copias lo necesario
COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env

CMD ["node", "dist/main"]

