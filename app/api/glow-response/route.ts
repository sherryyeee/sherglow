import { NextRequest, NextResponse } from "next/server";
import { isDemo, isUnlocked } from "@/lib/auth";
import { glowReply } from "@/lib/deepseek";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  if (isDemo())
    return NextResponse.json({ error: "Demo 模式不支持写入" }, { status: 403 });
  if (!(await isUnlocked()))
    return NextResponse.json({ error: "请先解锁" }, { status: 401 });
  const { date, records } = await req.json();

  const recordsSummary = (records as { category: string; content: string }[])
    .map((r) => `[${r.category}] ${r.content}`)
    .join("\n");

  try {
    const response = await glowReply(
      `你是 Glow，SherGlow App 的情感陪伴角色。用户今天记录了以下成长：\n\n${recordsSummary}\n\n请用 1-2 句温暖、真诚的话回应她，像懂她的好友，关注记录里的具体内容，不说教，不以"你好"开头，用中文。`
    );

    await supabaseAdmin().from("glow_daily").upsert(
      {
        date,
        response,
        record_count: records.length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "date" }
    );

    return NextResponse.json({ response });
  } catch {
    return NextResponse.json({ response: "今天记录了这些，已经很好了，为自己鼓掌 🌸" });
  }
}
