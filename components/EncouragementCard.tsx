import type { Encouragement } from "@/lib/quotes";

// 首页"每日鼓舞"的文字层：每天一句，当天固定。
export default function EncouragementCard({
  card, textColor, attrColor,
}: {
  card: Encouragement;
  textColor: string;
  attrColor: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-start items-center p-5 pt-6 z-10 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <span className="text-sm leading-none">💗</span>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: attrColor }}>
          每日鼓舞
        </p>
      </div>

      <p
        className="leading-snug whitespace-pre-line"
        style={{
          fontFamily: '"LXGW WenKai GB Medium", serif',
          fontSize: "1.3rem",
          color: textColor,
          textShadow: "0 1px 16px rgba(255,235,240,0.85)",
        }}
      >
        {card.text}
      </p>

      <p className="text-[11px] mt-3" style={{ color: attrColor }}>
        — {card.attr}
      </p>
    </div>
  );
}
