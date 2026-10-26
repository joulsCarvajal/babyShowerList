#!/bin/sh
# Al montar un volumen (Railway, docker-compose) la carpeta /data queda owned por root
# y sobreescribe el chown hecho en build. Este entrypoint corrige permisos como root
# y luego dropea privilegios al usuario nextjs antes de ejecutar el CMD.
set -e

chown -R nextjs:nodejs /data

exec su-exec nextjs:nodejs "$@"
