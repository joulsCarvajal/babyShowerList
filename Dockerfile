# syntax=docker/dockerfile:1

# ---------- builder: instala TODO, genera cliente, compila Next, prunea devDeps ----------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# prisma.config.ts valida DATABASE_URL en load aunque `generate`/`build` no la usen.
# El runtime real sobreescribe esta URL con /data/babyshower.db.
ENV DATABASE_URL="file:/tmp/build.db"
RUN npx prisma generate && npm run build
# Elimina devDeps del node_modules que viajará al runner.
RUN npm prune --omit=dev

# ---------- runner: imagen mínima solo con lo necesario para servir ----------
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# App completa pruneada
COPY --from=builder --chown=nextjs:nodejs /app ./

# Punto de montaje del volumen persistente de Railway
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs
EXPOSE 3000
ENV PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/babyshower.db

# Migraciones idempotentes al arrancar, luego sirve la app.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node_modules/.bin/next start"]
