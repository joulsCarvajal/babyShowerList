import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    // No redirect: GET podría ser agendado/scripted; mejor fallar explícito.
    return new NextResponse("No autorizado", { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  const match = dbUrl.match(/^file:(.+)$/);
  if (!match) {
    return new NextResponse("DATABASE_URL no apunta a archivo SQLite", {
      status: 500,
    });
  }
  const dbPath = match[1];

  const bytes = await readFile(dbPath);
  const ts = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..*/, "");
  const filename = `babyshower-${ts}.db`;

  // Buffer satisface BodyInit en Next 16
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "no-store",
    },
  });
}
