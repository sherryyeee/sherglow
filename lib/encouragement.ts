import { unstable_cache } from "next/cache";
import { glowReply } from "@/lib/deepseek";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { beijingDate } from "@/lib/date";
import type { Encouragement } from "@/lib/quotes";

// 每日鼓舞：参考最近 3 天的成长记录，由 DeepSeek 写一句专属的话。只在解锁后调用。
async function recentRecords() {
  const { data } = await supabaseAdmin()
    .from("growth_records")
    .select("date,category,content")
    .eq("is_demo", false)
    .gte("date", beijingDate(2))
    .order("date", { ascending: false })
    .limit(10);
  return (data ?? []).map((r) => `${r.date} [${r.category}] ${r.content}`).join("\n");
}

function buildPrompt(records: string) {
  return `你是 Glow，SherGlow App 里陪伴 Sherry 的角色。请为她写今天首页的"每日鼓舞"卡片。

${records ? `她最近几天的成长记录：\n${records}\n\n可以自然地呼应其中一件具体的事，但不要复述原文。` : "她最近几天没有记录，写一句通用的鼓舞即可，不要提到没有记录。"}

语气：以温柔陪伴为主，带一点点打气；真诚、具体，不说教，不用感叹号堆砌，不用 emoji。

用 json 格式返回：{"text": "主句", "attr": "副句"}
- text：分两行，用 \\n 分隔，每行不超过 11 个汉字
- attr：一句不超过 16 个字的小注解`;
}

function parse(raw: string): Encouragement {
  const data = JSON.parse(raw);
  const text = String(data.text ?? "").trim().replace(/\\n/g, "\n");
  const attr = String(data.attr ?? "").trim().replace(/^[—-]\s*/, "");
  const lines = text.split("\n");
  if (lines.length !== 2 || lines.some((l) => !l || l.length > 14) || !attr || attr.length > 20) {
    throw new Error("每日鼓舞格式不符");
  }
  return { text, attr };
}

async function generateEncouragement(): Promise<Encouragement> {
  const raw = await glowReply(buildPrompt(await recentRecords()), { json: true, temperature: 1 });
  return parse(raw);
}

// 每天一句，缓存一整天（按日期区分）；生成失败会抛错，不进缓存，由调用方换成语录库
export function dailyEncouragement(date: string) {
  return unstable_cache(generateEncouragement, ["daily-encouragement", date], { revalidate: 86400 })();
}
