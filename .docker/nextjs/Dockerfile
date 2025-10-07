## For Gitlab CI
FROM node:18.18.0-alpine AS build
WORKDIR /app
#COPY package.json ./
COPY . ./
ARG env_build="build"
RUN npm i --legacy-peer-deps

RUN npm i next
RUN npm install @emotion/react @emotion/styled
RUN npm run build
ENTRYPOINT [ "npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000" ]