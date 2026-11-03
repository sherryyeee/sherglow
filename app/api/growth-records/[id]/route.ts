import { NextRequest, NextResponse } from "next/server";
import { isDemo, isUnlocked } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemo())
    return NextResponse.json({ error: "Demo 模式不支持写入" }, { status: 403 });
  if (!(await isUnlocked()))
    return NextResponse.json({ error: "请先解锁" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabaseAdmin().from("growth_records").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
