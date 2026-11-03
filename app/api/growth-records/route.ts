import { NextRequest, NextResponse } from "next/server";
import { isDemo, isUnlocked } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  if (isDemo())
    return NextResponse.json({ error: "Demo 模式不支持写入" }, { status: 403 });
  if (!(await isUnlocked()))
    return NextResponse.json({ error: "请先解锁" }, { status: 401 });
  const { date, category, content } = await req.json();
  const { data, error } = await supabaseAdmin()
    .from("growth_records")
    .insert({ date, category, content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ record: data });
}
