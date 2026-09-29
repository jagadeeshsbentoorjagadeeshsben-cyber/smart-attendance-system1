import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getProfile, setProfilePhoto, removeProfilePhoto } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LEN = 3_500_000; // ~2.6MB decoded
const putSchema = z.object({
  photo: z
    .string()
    .regex(/^data:image\/(png|jpe?g|webp|gif);base64,/, "Unsupported image type.")
    .max(MAX_LEN, "Image is too large."),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  try {
    const profile = await getProfile(session.usn);
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[profile GET error]:", err);
    return NextResponse.json(
      { usn: session.usn, photo: null, updatedAt: new Date(0).toISOString() }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid image." },
      { status: 400 }
    );
  }
  try {
    const profile = await setProfilePhoto(session.usn, parsed.data.photo);
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[profile PUT error]:", err);
    return NextResponse.json(
      { error: "Could not save photo. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  try {
    const profile = await removeProfilePhoto(session.usn);
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[profile DELETE error]:", err);
    return NextResponse.json(
      { error: "Could not remove photo. Please try again." },
      { status: 500 }
    );
  }
}
