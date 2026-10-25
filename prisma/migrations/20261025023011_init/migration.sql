-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "nota" TEXT,
    "linkReferencia" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "nombreInvitado" TEXT NOT NULL,
    "mensajeOpcional" TEXT,
    "token" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reserva_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreAutor" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ConfigEvento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "fechaHora" DATETIME NOT NULL,
    "direccion" TEXT NOT NULL,
    "urlMaps" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Item_estado_idx" ON "Item"("estado");

-- CreateIndex
CREATE INDEX "Item_categoria_idx" ON "Item"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_token_key" ON "Reserva"("token");

-- CreateIndex
CREATE INDEX "Reserva_itemId_estado_idx" ON "Reserva"("itemId", "estado");

-- CreateIndex
CREATE INDEX "Reserva_token_idx" ON "Reserva"("token");

-- CreateIndex
CREATE INDEX "Mensaje_createdAt_idx" ON "Mensaje"("createdAt");
