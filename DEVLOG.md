# SherGlow 开发者日记

> 这是一本写给未来的 Sherry 看的日记，也是写给每一个正在独自 Build App 的新手的参考。
> 记录真实的踩坑、真实的困惑、真实的解决方案。

---

## 2026-05-18 · 成长记录系统 + UI 美化全记录

### 这一天做了什么

今天是 SherGlow 最密集的一次开发日。从零搭建了"成长记录"系统，引入了 Glow IP 角色，完成了「我的」页面的完整重设计，并把全站图标从 emoji 升级为 Lucide 组件。

---

## 一、成长记录系统

### 背景

原来 App 有一个"心情打卡"功能，但 Sherry 觉得它太简单，想换成一个可以按分类记录每天小事的"成长记录"系统，同时加入 AI（Glow）对当天记录的温暖回应。

### 数据库设计

在 Supabase 新建了两张表：

**`growth_records`**
```
id          bigserial PRIMARY KEY
date        text         -- "YYYY-MM-DD"
category    text         -- 学习 / 成长 / 生活 / 运动 / 心情 / 成就
content     text
created_at  timestamptz DEFAULT now()
```

**`glow_daily`**
```
id           bigserial PRIMARY KEY
date         text UNIQUE  -- 每天只有一条
response     text         -- AI 生成的回应内容
record_count int
updated_at   timestamptz
```

**新手知识点：** 为什么用 `text` 存日期而不是 `date` 类型？

因为我们要用 Sydney 时区的"今天"来查询，如果用数据库原生 date 类型，时区换算容易出 bug。用 `"YYYY-MM-DD"` 字符串，在 JS 里算好悉尼时间再存，逻辑更可控。

### API 路由设计

Next.js App Router 里，API 写在 `app/api/` 目录下：

```
app/api/growth-records/route.ts        → POST（新增记录）
app/api/growth-records/[id]/route.ts   → DELETE（删除记录）
app/api/glow-response/route.ts         → POST（生成 AI 回应）
```

**新手知识点：** Next.js App Router 的 API 和 Pages Router 不一样

旧版 Next.js（Pages Router）的 API 写在 `pages/api/`，用 `req/res` 参数。新版（App Router）改为在 `route.ts` 里 export `GET`、`POST` 等函数，每个函数接收 `Request`，返回 `Response`。

```typescript
// App Router 风格
export async function POST(request: Request) {
  const body = await request.json();
  // ...
  return Response.json({ data });
}

// 动态路由参数的取法（注意：params 是 Promise）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

### 遇到的问题 1：params 不能直接解构

**现象：** 删除记录的 API 里，`params.id` 取不到值，TypeScript 报错。

**原因：** Next.js 新版本把 route params 改成了 `Promise<{id: string}>`，必须用 `await` 才能拿到。

**解决：**
```typescript
// 错误写法
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id; // ❌ 可能拿不到
}

// 正确写法
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅
}
```

---

## 二、记录页（/record）状态机设计

### 设计思路

记录页是一个"Client Component"，有复杂的交互流程。用一个 `mode` 状态来管理页面显示：

```
"input"   → 正常输入状态，可添加/删除记录
"saving"  → Glow 正在生成回应中（loading）
"confirm" → 今天已有回应，询问是否要重新生成
"done"    → 回应显示完毕
```

**新手知识点：** Server Component vs Client Component

Next.js App Router 里有两种组件：

| | Server Component | Client Component |
|---|---|---|
| 文件标记 | 无需标记（默认）| 顶部写 `"use client"` |
| 能否用 useState/useEffect | ❌ 不能 | ✅ 可以 |
| 能否直接查询数据库 | ✅ 可以 | ❌ 不能 |
| 在哪里执行 | 服务器 | 浏览器 |

`/record` 页面的做法：用 Server Component 查数据库拿初始数据，传给 Client Component 显示交互。

```typescript
// app/record/page.tsx（Server Component）
export default async function RecordPage() {
  const data = await supabase.from("growth_records").select(...);
  return <RecordClient initialRecords={data} />;
}

// components/RecordClient.tsx（Client Component）
"use client";
export default function RecordClient({ initialRecords }) {
  const [records, setRecords] = useState(initialRecords);
  // ...交互逻辑
}
```

### 遇到的问题 2：保存按钮被底部导航栏遮住

**现象：** 保存按钮看不见了，滑到页面底部也找不到。

**原因：** 底部导航栏（BottomNav）是 `fixed bottom-0 z-50 h-16`，占据底部 64px。保存按钮也设置了 `fixed bottom-0`，两者重叠，按钮被遮住了。

**解决：** 把保存按钮改为 `fixed bottom-16`（往上移 64px，刚好在导航栏上方）。

### 遇到的问题 3：fixed 元素宽度超出设计宽度

**现象：** 保存按钮在大屏幕（iPad/桌面浏览器）上宽度撑满整个屏幕，而 App 内容被限制在 `max-w-lg`（512px）内。

**原因：** `position: fixed` 的元素脱离了普通文档流，它的宽度参照的是视口（viewport），不受父元素 `max-w-lg` 约束。

**解决：** 在 fixed 容器里加一个内部 wrapper，用 `max-w-lg mx-auto` 来约束内容：

```tsx
{/* 外层 fixed：铺满视口 */}
<div className="fixed bottom-16 left-0 right-0 z-40">
  {/* 内层 wrapper：限制宽度 */}
  <div className="max-w-lg mx-auto px-5 pb-3 pt-4">
    <button ...>保存今天的成长</button>
  </div>
</div>
```

**新手知识点：** 这是一个 CSS 经典陷阱。`fixed` 脱离文档流后，所有祖先元素的 `max-width`、`padding` 对它都无效。解决方案永远是：在 fixed 元素内部再套一层 wrapper 来模拟容器约束。

### 遇到的问题 4：加载状态弹出全屏遮罩

**现象：** 点击"保存"后，整个页面变成了加载动画，原来填写的内容都消失了，用户体验很差。

**原因：** 最初的设计是：点击保存后切换到一个全新的"加载页"状态，替换掉整个页面内容。

**用户反馈：** "我不希望它弹出一个新的窗口，应该在我今日成长记录下面运行。"

**解决：** 重构为"内联状态"模式——记录列表始终显示在顶部，loading/confirm/done 等状态内容显示在列表下方，不替换已有内容。

```
记录列表（始终可见）
↓
[输入模式] 添加表单 + 保存按钮
[生成中]   🌸 Glow 正在回应中...
[询问更新] 是否重新生成？
[完成]     Glow 的回应卡片 + 回首页按钮
```

---

## 三、Glow AI 回应

### 实现方式

调用 Anthropic Claude API（claude-haiku-4-5 模型，速度快、适合短文生成），让 Glow 根据当天所有记录生成一段温暖的回应。

```typescript
const client = new Anthropic();
const message = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 150,
  messages: [{
    role: "user",
    content: `你是 Glow，一个温柔的 AI 陪伴角色。根据用户今天的成长记录，用1-2句话给出温暖的鼓励。记录：${summary}`
  }]
});
```

生成后 upsert 到 `glow_daily` 表，同一天重复保存时覆盖原有内容。

### 遇到的问题 5：环境变量没有生效

**现象：** 部署到 Vercel 后，Glow 回应始终是 fallback 文字，API 没有被真正调用。

**原因：** `ANTHROPIC_API_KEY` 只存在于本地 `.env.local`，没有添加到 Vercel 的 Environment Variables 里。

**解决：** 在 Vercel 项目设置 → Environment Variables 里添加 `ANTHROPIC_API_KEY`，重新部署。

**新手知识点：** 环境变量的"本地"和"线上"是完全独立的

`.env.local` 只在你本机运行 `npm run dev` 时有效，push 到 GitHub 不会上传，Vercel 服务器完全不知道它的存在。必须在 Vercel Dashboard 手动配置所有线上需要的密钥。

---

## 四、「我的」页面（/space）重设计

### 设计目标

把「我的」页面从一个简单的心情统计页，改为一个有温度的"成长空间"：
- 顶部 Banner：有 Glow 角色插图 + 时段化问候
- 今日成长卡片：当天记录 + Glow 回应
- 往日成长：历史记录按日期归档

### Banner 的渐变叠层技巧

Banner 左侧要显示文字，右侧显示 Glow 插图。为了让文字在图片背景上可读，用渐变叠层覆盖左侧：

```tsx
{/* 图片铺满 */}
<div style={{
  backgroundImage: "url(/glow/glow-banners-combined.png)",
  backgroundSize: "auto 300%",
  backgroundPosition: "right top", // 定位到图片的哪一区域
}} />

{/* 左侧渐变：从不透明粉色渐变到透明，覆盖住图片左半部分 */}
<div style={{
  background: "linear-gradient(to right,
    rgba(245,185,195,0.96) 0%,   // 左边几乎不透明
    rgba(245,185,195,0.88) 35%,  // 过渡
    rgba(245,185,195,0.4) 60%,   // 半透明
    transparent 78%               // 右侧完全透明，图片显现
  )"
}} />
```

**新手知识点：** 渐变颜色要从图片自身的主色取，而不是固定用白色或黑色，这样过渡才自然。

### 时段化 Banner（上午 / 下午 / 夜晚）

一张图包含三个时段的 Glow 场景（竖向排列），用 CSS `background-position` 来"截取"对应的区域：

```typescript
// 图片尺寸：1672 × 941，三段等高（各约 314px）
// background-size: auto 300% 把图片高度拉到 3 倍容器高度
// 然后用 position 定位到哪 1/3 可见

morning:   backgroundPosition: "right top"    // 显示上 1/3
afternoon: backgroundPosition: "right 50%"    // 显示中 1/3
night:     backgroundPosition: "right bottom" // 显示下 1/3
```

同时渐变颜色随时段变化：
- 上午 → 温暖粉色
- 下午 → 暖桃橙色
- 夜晚 → 薰衣草紫色

---

## 五、全站图标系统升级

### 从 emoji 到 Lucide

**问题：** 最初所有图标用的是系统 emoji（📖🌱☕🎾🐻⭐🔔📅），在不同设备上渲染效果不一致，也显得不够精致。

**解决：** 引入 `lucide-react` 图标库，将功能性图标全部替换为矢量图标组件。

```bash
npm install lucide-react
```

```tsx
import { BookOpen, Sprout, Coffee, Dumbbell, Smile, Star } from "lucide-react";

// 使用
<BookOpen size={22} color="#E0708A" strokeWidth={1.8} />
```

**原则：**
- 有语义含义的分类图标（学习/成长/生活/运动/心情/成就）→ 换成 Lucide
- 品牌标识（🌸 Glow 想对你说）→ 保留 emoji
- 大型装饰性图标 → 保留 emoji

### 分类图标的"彩色徽章"设计

每个分类图标不是裸露的图标，而是放在一个有颜色背景的圆角方块里：

```tsx
const CATEGORY_CONFIG = {
  学习: { Icon: BookOpen, color: "#E0708A", bg: "#FDEEF2" }, // 玫瑰粉
  成长: { Icon: Sprout,   color: "#5CAB78", bg: "#E8F8EE" }, // 薄荷绿
  生活: { Icon: Coffee,   color: "#D4836A", bg: "#FEF3E8" }, // 暖桃
  运动: { Icon: Dumbbell, color: "#9070C8", bg: "#EEE8F8" }, // 薰衣草紫
  心情: { Icon: Smile,    color: "#C878A8", bg: "#FDEEF6" }, // 柔玫瑰
  成就: { Icon: Star,     color: "#C8922A", bg: "#FEF8E6" }, // 暖金
};

// 渲染
<div className="w-8 h-8 rounded-lg" style={{ background: cfg.bg }}>
  <cfg.Icon size={16} color={cfg.color} strokeWidth={2} />
</div>
```

**向后兼容：** 历史记录里有用"情绪"分类的旧数据，把"情绪"和"心情"都映射到同一个 Smile 图标，新旧数据都能正常显示。

---

## 六、iOS 自动缩放 Bug

### 现象

在 iPhone 上，点击"添加一条成长"打开输入框时，整个页面突然放大。

### 原因

iOS Safari 有一个内置行为：当用户点击 `<input>` 或 `<textarea>` 时，如果该元素的 `font-size` 小于 **16px**，Safari 会自动放大页面，方便用户看清正在输入的内容。

我们的 textarea 用的是 `text-[13px]`（13px），触发了这个机制。

### 解决

将 textarea 的字号改为 `text-[16px]`（16px）：

```tsx
// 修复前：text-[13px] → 触发 iOS 自动缩放
// 修复后：text-[16px] → 不再缩放
<textarea className="... text-[16px] ..." />
```

**新手知识点：** 这是移动端 Web 开发的一个经典坑。记住这个规则：所有 `<input>` 和 `<textarea>` 的 `font-size` 必须 ≥ 16px，否则 iOS Safari 会自动缩放。

---

## 七、首页「今日成长」模块重设计

### 空状态 vs 有记录状态

有记录和没记录时，首页展示完全不同的内容：

```
无记录 → 居中引导卡片 + "记录今天的成长"按钮
有记录 → 件数 + 记录列表 + Glow 回应 + "继续补充"按钮
```

### 动态日期显示

标题右侧显示今天的日期和星期，基于悉尼时区计算：

```tsx
const DAY_NAMES = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

// 右侧显示
<CalendarDays size={13} color="#C4ACB4" />
<span>{month}月{day}日 {DAY_NAMES[dayOfWeek]}</span>
```

### fixed 元素与 max-width 的老问题

**新手注意：** 这个坑我们在记录页遇到过一次，在首页"继续补充"按钮也有类似的情况。

凡是 `position: fixed` 或 `position: absolute` 的元素，它的宽度和定位都相对于视口或最近的定位祖先，**不受普通流中的 max-width 限制**。解决方案永远是：在内部加 wrapper。

---

## 八、值得记住的通用经验

### 1. 本地 vs 线上的环境变量

- `.env.local` → 只有本地 `npm run dev` 时有效
- Vercel Dashboard → 线上部署必须手动添加所有密钥
- 永远不要把 `.env.local` 提交到 Git

### 2. Next.js App Router 的文件约定

```
app/page.tsx          → 根路由 /
app/record/page.tsx   → /record
app/api/xxx/route.ts  → API 端点 /api/xxx
```

每个 `page.tsx` 默认是 Server Component，需要交互就拆出单独的 Client Component（`"use client"`）。

### 3. Supabase RLS（行级安全）

新建表后，默认 RLS 策略会阻止所有读写。测试阶段可以暂时 disable RLS，上线前要根据业务逻辑设置正确的 Policy。

### 4. iOS Safari 的特殊规则

- `input`/`textarea` 字号 < 16px → 自动缩放
- `position: fixed` + `overflow: hidden` 组合在 iOS 上有时会失效
- `-webkit-overflow-scrolling: touch` 提升滚动流畅度

### 5. CSS background-position 的坐标系

`background-position: X% Y%` 的含义是：
- 把图片上 X%, Y% 的那个点，对齐到容器的 X%, Y% 的那个点
- 所以 `right top` = 图片右上角对齐容器右上角
- `right 50%` = 图片右边缘对齐容器右边缘，垂直方向图片中心对齐容器中心
- 常用于展示一张大图的不同区域

---

## 下一步计划

- [ ] 生成 Glow 更多场景图（记录页空状态、首页空状态）
- [ ] 成长数据的周/月统计可视化
- [ ] Push 通知：每晚提醒记录
- [ ] 数据导出功能

---

*"每一次记录，都是在靠近更好的自己 ✨"*

*— SherGlow, 2026*
