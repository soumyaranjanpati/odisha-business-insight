import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { getAuthorDisplayNameForStaff } from "@/lib/db";

/** Staff-only: poster display name for an article author. */
export async function GET(request: NextRequest) {
  const authorId = request.nextUrl.searchParams.get("authorId")?.trim();
  if (!authorId) {
    return NextResponse.json({ name: null });
  }

  const profile = await getProfile();
  const isEditorialStaff =
    profile?.roleName === "editor" || profile?.roleName === "admin";
  if (!isEditorialStaff) {
    return NextResponse.json({ name: null });
  }

  const name = await getAuthorDisplayNameForStaff(authorId);
  return NextResponse.json({ name });
}
