# syntax=docker/dockerfile:1
FROM node:16 AS prepare-schemas
WORKDIR /api-schemas
ADD api-schemas/package.json /tmp/api-schemas/
RUN cd /tmp/api-schemas && npm install
RUN mv /tmp/api-schemas/node_modules /api-schemas
COPY api-schemas /api-schemas
RUN npm run build

FROM prepare-schemas AS base
WORKDIR /app
ADD backend/package.json /tmp/backend/
RUN cd /tmp/backend/ && npm install
RUN mv /tmp/backend/node_modules /app

COPY backend /app
RUN npm run build
EXPOSE ${PORT}
CMD ["npm", "run", "start"]

FROM prepare-schemas AS build-website
WORKDIR /app

ADD website/package.json /tmp/website/
RUN cd /tmp/website && npm install
RUN mv /tmp/website/node_modules /app

COPY website /app
RUN npm run build

FROM base AS production
COPY --from="build-website" /app/dist/spa /data/website
ENV SERVER_MODE=production

FROM base AS development
ENV SERVER_MODE=development
