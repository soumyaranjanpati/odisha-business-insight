import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  // Auth guard – admins only
  const profile = await getProfile();
  if (!profile) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (profile.roleName !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("whatsapp_number, email, is_active, subscribed_at")
    .not("whatsapp_number", "is", null)
    .order("subscribed_at", { ascending: false });

  if (error) {
    console.error("WhatsApp subscribers export error:", error);
    return new NextResponse("Failed to fetch subscribers", { status: 500 });
  }

  const rows = data ?? [];

  const csvRows: string[] = [
    // Header
    "whatsapp_number,email,is_active,subscribed_at",
    // Data rows
    ...rows.map((r) =>
      [
        escapeCSV(r.whatsapp_number),
        escapeCSV(r.email),
        r.is_active ? "true" : "false",
        escapeCSV(r.subscribed_at),
      ].join(",")
    ),
  ];

  const csv = csvRows.join("\r\n");
  const fileName = `whatsapp-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
