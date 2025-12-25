# 1) deps: устанавливаем зависимости отдельно, чтобы работал кэш
FROM node:18-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# 2) build: копируем исходники и собираем
FROM node:18-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# 3) runner: минимальный runtime-образ
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# если у вас next.config включает standalone
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
