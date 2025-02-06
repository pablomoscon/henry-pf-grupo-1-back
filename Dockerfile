#Stage 1
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

#Stage 2
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

COPY --from=development /app/node_modules ./node_modules

COPY . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

#Stage 3
FROM node:20-alpine AS production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY src/modules/mail/templates /dist/modules/mail/templates

EXPOSE 3000

CMD [ "node", "dist/main.js" ]