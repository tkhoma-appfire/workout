# Build from repository root:
#   docker build -f be-node/Dockerfile -t workout-be-node .
FROM node:22-alpine AS build

WORKDIR /app/be-node

COPY be-node/package.json ./
RUN npm config set registry https://registry.npmjs.org \
  && npm install

COPY be-node/tsconfig.json ./
COPY be-node/src ./src

RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8081
ENV MIGRATIONS_DIR=/app/migration

COPY be-node/package.json ./
COPY --from=build /app/be-node/node_modules ./node_modules
COPY --from=build /app/be-node/dist ./dist
COPY be-node/src/db/migration /app/migration

EXPOSE 8081

CMD ["node", "dist/index.js"]
