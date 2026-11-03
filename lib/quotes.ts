// 每日鼓舞的备用语录库：未解锁、Demo 站、或 AI 生成失败时使用。
export type Encouragement = { text: string; attr: string };

export const QUOTES: Encouragement[] = [
  { text: "你正在成为\n你想成为的那个人。", attr: "相信自己，你比你想象的更强大" },
  { text: "每一天都是\n全新的起点。", attr: "温柔地勇敢，持续地发光" },
  { text: "你的努力\n从未被辜负。", attr: "相信过程，结果自然到来" },
  { text: "做自己最好的\n那个版本。", attr: "每一步都算数，每天一点点" },
  { text: "保持好奇\n保持成长。", attr: "知识是最好的投资" },
  { text: "你的光芒\n无法被掩盖。", attr: "Women with Power — 持续发光" },
  { text: "慢一点没关系，\n方向对就好。", attr: "走得稳，也是一种快" },
  { text: "今天的小事，\n是明天的底气。", attr: "积累从来不会白费" },
  { text: "允许自己休息，\n也是一种努力。", attr: "照顾好自己，才能走更远" },
  { text: "你不必完美，\n你只需要开始。", attr: "第一步永远最珍贵" },
  { text: "把心放宽，\n把事做细。", attr: "温柔而坚定" },
  { text: "认真生活的人，\n自带光芒。", attr: "你就是其中一个" },
  { text: "每个不起眼的今天，\n都在悄悄改变你。", attr: "成长常常是静悄悄的" },
  { text: "你比昨天\n又多懂了一点。", attr: "这就是进步" },
  { text: "困难是暂时的，\n你的韧性是长久的。", attr: "风雨之后，自有晴天" },
  { text: "相信时间，\n也相信自己。", attr: "好事正在路上" },
  { text: "做喜欢的事，\n成为喜欢的人。", attr: "热爱可抵岁月漫长" },
  { text: "温柔待己，\n坚定向前。", attr: "两件事可以同时成立" },
  { text: "你走过的路，\n都算数。", attr: "没有一步是多余的" },
  { text: "今天也值得\n被好好对待。", attr: "包括你自己" },
  { text: "小小的坚持，\n会长成大大的不同。", attr: "种子总会发芽" },
  { text: "你已经\n做得很好了。", attr: "停下来，为自己鼓掌" },
  { text: "去试试吧，\n大不了从头再来。", attr: "勇气比结果更重要" },
  { text: "心里有光，\n脚下有路。", attr: "一直往前走就好" },
  { text: "不慌不忙，\n自有安排。", attr: "节奏是你自己的" },
  { text: "被认真对待的日子，\n会闪闪发光。", attr: "就像今天" },
  { text: "你的节奏\n就是最好的节奏。", attr: "不必和别人比较" },
  { text: "学到的每一点，\n都长在你身上。", attr: "谁也拿不走" },
  { text: "把今天过好，\n就是对未来最好的准备。", attr: "专注当下" },
  { text: "你值得\n所有美好的事。", attr: "包括你正在努力的那件" },
];

// 按北京日期挑一句，同一天固定不变
export function quoteForDate(date: string): Encouragement {
  const n = date.split("-").reduce((sum, part) => sum * 31 + Number(part), 0);
  return QUOTES[n % QUOTES.length];
}
