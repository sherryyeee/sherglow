import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { date, records } = await req.json();

  const recordsSummary = (records as { category: string; content: string }[])
    .map((r) => `[${r.category}] ${r.content}`)
    .join("\n");

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `你是 Glow，SherGlow App 的情感陪伴角色。用户今天记录了以下成长：\n\n${recordsSummary}\n\n请用 1-2 句温暖、真诚的话回应她，像懂她的好友，关注记录里的具体内容，不说教，不以"你好"开头，用中文。`,
        },
      ],
    });

    const response =
      message.content[0].type === "text" ? message.content[0].text : "今天的你很棒，继续加油 🌸";

    await supabase.from("glow_daily").upsert(
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
