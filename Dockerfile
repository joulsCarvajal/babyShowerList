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
# openssl para engines de Prisma, su-exec para dropear privilegios desde el entrypoint.
RUN apk add --no-cache openssl su-exec
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# App completa pruneada. Permisos de lectura por default sirven al usuario nextjs.
COPY --from=builder /app ./

# Entrypoint arranca como root, chownea el volumen montado en /data, y dropea a nextjs.
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/babyshower.db

ENTRYPOINT ["docker-entrypoint.sh"]
# Migraciones idempotentes al arrancar, luego sirve la app.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node_modules/.bin/next start"]
