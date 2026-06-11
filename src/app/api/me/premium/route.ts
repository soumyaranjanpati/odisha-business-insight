import { NextResponse } from "next/server";
import { hasActivePremiumSubscription } from "@/lib/subscription";

export async function GET() {
  const hasPremium = await hasActivePremiumSubscription();
  return NextResponse.json({ hasPremium });
}
