import Link from "next/link";

export default function SpacePage() {
  return (
    <div className="min-h-full">
      <header className="px-5 pt-12 pb-4">
        <p className="text-xs font-semibold tracking-widest text-[#D4788A] uppercase mb-0.5">SherGlow</p>
        <h1 className="text-2xl font-bold text-[#3D2832]">我的空间 🌱</h1>
        <p className="text-xs text-[#9C8589] mt-1">成长与记录</p>
      </header>

      <div className="px-5 space-y-4">
        {/* Profile banner */}
        <div className="relative rounded-2xl overflow-hidden p-6"
          style={{ background: "linear-gradient(135deg, #E8A4B8 0%, #F4C4A0 100%)" }}>
          <span className="absolute top-3 right-4 text-3xl opacity-40 select-none">🌸</span>
          <p className="text-white font-bold text-lg mb-0.5">Sherry</p>
          <p className="text-white/70 text-xs">SherGlow 成员</p>
        </div>

        {/* Mood Journal entry */}
        <Link
          href="/mood"
          className="block bg-white rounded-2xl border border-[#F9D8E4] px-5 py-5 active:opacity-70"
          style={{ boxShadow: "0 1px 8px rgba(242,139,168,0.07)", textDecoration: "none" }}
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">🌈</span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#3D2832]">心情日记</p>
              <p className="text-[12px] text-[#C4ACB4] mt-0.5">记录今天的心情，和 AI 聊几句</p>
            </div>
            <span className="text-[#D4788A] text-lg">→</span>
          </div>
        </Link>

        {/* Phase 2 placeholder */}
        <div className="bg-white rounded-2xl p-6 border border-[#F9E8EC] flex flex-col items-center text-center gap-3 py-10">
          <span className="text-4xl">🌿</span>
          <p className="text-[14px] font-semibold text-[#3D2832]">更多功能即将上线</p>
          <p className="text-[12px] text-[#9C8589] leading-relaxed max-w-xs">
            成长记录、目标追踪等个人功能正在规划中 ✨
          </p>
        </div>
      </div>
    </div>
  );
}
