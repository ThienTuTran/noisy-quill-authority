# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app
# install deps (dev + prod)
COPY package*.json tsconfig.json ./
RUN npm ci
# copy source and build
COPY src ./src
COPY keys ./keys
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
# only prod deps
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
# copy built JS and runtime assets
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/keys ./keys
# runtime env comes from compose
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:8080/ || exit 1
USER node
CMD ["node", "dist/app.js"]
