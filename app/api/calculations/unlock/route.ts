import { NextResponse } from "next/server";

// Endpoint vechi, păstrat doar ca să nu existe comportament ambiguu după migrare.
// Calculele noi se efectuează prin /api/calculations/run și consumă un credit la fiecare rulare.
export async function POST() {
  return NextResponse.json(
    { error: "LEGACY_MONTH_UNLOCK_DISABLED", use: "/api/calculations/run" },
    { status: 410 },
  );
}
