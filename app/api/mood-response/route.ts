import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const MOOD_LABELS: Record<string, string> = {
  happy: "开心", calm: "平静", neutral: "一般", sad: "低落", tired: "很累",
};

const FALLBACKS: Record<string, string> = {
  happy:   "听到你今天很开心，我也跟着开心了 🌸",
  calm:    "平静是一种力量，今天的你很稳 ✨",
  neutral: "普通的一天也有它的意义，休息好了明天继续 🌿",
  sad:     "低落的时候，记得温柔地对待自己 💛",
  tired:   "你已经很努力了，今天好好休息 🌙",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { step, mood, tags, text } = body;
  const moodLabel = MOOD_LABELS[mood] || mood;

  try {
    let prompt = "";
    if (step === "mood") {
      prompt = `用户今天感觉「${moodLabel}」。用1-2句温柔、真诚的中文回应，像懂她的好友，有温度，不说教，不要以"你好"开头。`;
    } else if (step === "text") {
      const tagsStr = tags?.length ? `她今天关于：${tags.join("、")}。` : "";
      prompt = `用户今天感觉「${moodLabel}」。${tagsStr}她写道：「${text}」。用1-2句温柔、个性化的中文回应，针对她说的内容，像真正懂她的好友。不要以"你好"开头。`;
    }

    if (!prompt) return NextResponse.json({ response: "" });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    const response = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ response });
  } catch {
    const fallback = FALLBACKS[mood] || "今天辛苦了，好好照顾自己 ✨";
    return NextResponse.json({ response: fallback });
  }
}
