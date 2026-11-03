import { NextRequest, NextResponse } from "next/server";
import { isDemo, isUnlocked } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// 心情日记的读写只经由服务器；Demo 站返回示例数据，不读真实日记。
const DEMO_ENTRIES = [
  {
    id: 1,
    mood: "calm",
    tags: ["学习"],
    free_text: "今天把一个 AI Agent 的校验规则想清楚了，心里很踏实。",
    ai_response: "平静是一种力量，今天的你很稳 ✨",
    ai_personal_response: "把规则想清楚的那一刻最安心，你在认真地为自己的作品打地基 🌱",
    created_at: new Date().toISOString(),
  },
];

const FIELDS = "id, mood, tags, ai_response, ai_personal_response, free_text, created_at";

export async function GET(req: NextRequest) {
  if (isDemo()) return NextResponse.json({ entries: DEMO_ENTRIES });
  if (!(await isUnlocked())) return NextResponse.json({ error: "请先解锁" }, { status: 401 });
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "缺少日期" }, { status: 400 });
  const { data, error } = await supabaseAdmin()
    .from("mood_entries")
    .select(FIELDS)
    .eq("date", date)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (isDemo()) return NextResponse.json({ error: "Demo 模式不支持写入" }, { status: 403 });
  if (!(await isUnlocked())) return NextResponse.json({ error: "请先解锁" }, { status: 401 });
  const { date, mood, tags, free_text, ai_response, ai_personal_response } = await req.json();
  const { error } = await supabaseAdmin().from("mood_entries").insert({
    date, mood, tags, free_text, ai_response, ai_personal_response,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
