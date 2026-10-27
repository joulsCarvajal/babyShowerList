-- CreateTable
CREATE TABLE "MensajeReaccion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mensajeId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MensajeReaccion_mensajeId_fkey" FOREIGN KEY ("mensajeId") REFERENCES "Mensaje" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MensajeReaccion_mensajeId_idx" ON "MensajeReaccion"("mensajeId");

-- CreateIndex
CREATE UNIQUE INDEX "MensajeReaccion_mensajeId_emoji_key" ON "MensajeReaccion"("mensajeId", "emoji");
