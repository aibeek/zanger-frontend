# 1) deps: зависимости (кэшируется)
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies needed for sharp
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm install --legacy-peer-deps
# Ensure sharp is installed with the correct platform binaries
RUN npm install --os=linux --libc=musl --cpu=x64 sharp


# 2) build: сборка
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies needed for sharp at build time
RUN apk add --no-cache libc6-compat

# NEXT_PUBLIC_* нужны во время next build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_BASE_URL_PROD
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL_PROD=$NEXT_PUBLIC_BASE_URL_PROD
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NODE_ENV=production

# Копируем node_modules из deps stage
COPY --from=deps /app/node_modules ./node_modules

# Копируем только нужные файлы (порядок важен для кэширования)
COPY package*.json ./
COPY next.config.ts tsconfig.json ./
COPY eslint.config.mjs ./
COPY public ./public
COPY locales ./locales
COPY src ./src

RUN npm run build


# 3) runner: минимальный runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies needed for sharp at runtime
RUN apk add --no-cache libc6-compat

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
