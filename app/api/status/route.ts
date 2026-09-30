import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

interface StatusCheck {
  id: string;
  client_name: string;
  timestamp: string;
}

const statusChecks: StatusCheck[] = [];

export async function GET() {
  return NextResponse.json(statusChecks);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const check: StatusCheck = {
      id: crypto.randomUUID(),
      client_name: body.client_name ?? "default-client",
      timestamp: new Date().toISOString(),
    };
    statusChecks.push(check);
    return NextResponse.json(check);
  } catch {
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }
}
