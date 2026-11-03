// Glow 的简短陪伴回复：DeepSeek 对话接口，关闭思考以加快速度、降低成本。
// json=true 时要求返回 JSON 对象（提示词里必须出现 "json" 字样）。
export async function glowReply(prompt: string, { json = false, temperature = 0.8 } = {}): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("缺少 DEEPSEEK_API_KEY 环境变量");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
      messages: [{ role: "user", content: prompt }],
      thinking: { type: "disabled" },
      max_tokens: 200,
      temperature,
      ...(json && { response_format: { type: "json_object" } }),
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);
  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("DeepSeek 返回空内容");
  return text;
}
