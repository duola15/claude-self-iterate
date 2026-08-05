<div align="center">

# ♾️ claude-self-iterate

### 让 Claude 自己优化你的网站，直到改无可改，自动停。

[![Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-ready-black.svg)](#)
[![Workflow](https://img.shields.io/badge/powered%20by-Workflow%20tool-7c3aed.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**一个多角色自迭代工作流**：15+ 个评审角色真实"逛"你的网站每个页面 → 找痛点 →
过三道门评审 → 最小实施 → 自我改进循环。跑完整个矩阵自动停，绝不空转。

</div>

---

## 🧠 为什么你需要它

你的网站**天天在改**，但总是靠人肉：
- 改 UI 靠"我感觉"——没有系统证据
- 改文案靠"应该这样"——不知道用户卡在哪
- 排错靠"拍脑袋"——漏了 90% 的页面

**Self-Iterate 换一种方式**：让 AI 扮演 15 个不同角色（新手/老手/数据审计/合规/性能/视觉/无障碍/SEO/转化/安全/内容…），**真实打开你的每一个页面**，用各自视角找痛点。每个发现都带证据链（实际内容 + 源码位置），过三道门才实施，实施后 AI 还自我改进自己的工作流。

> 核心洞察：**"逛一遍全站"比"想一遍全站"能发现 10 倍的问题。**

---

## 🚀 快速开始（3 步）

```bash
# 1. 复制配置模板，改你的站点
cp config.example.js config.js
#    编辑 config.js: siteUrl = "http://localhost:3000", name = "你的站点"

# 2. 本地起 dev server（子 agent 真实抓它）
npm run dev        # 端口与 config.siteUrl 一致

# 3. 在 Claude Code 里运行
Workflow({ scriptPath: "workflows/self-iterate.js",
           args: { siteUrl: "http://localhost:3000", maxBatches: 1 } })
# 或一句话： "运行 self-iterate，对 localhost:3000 跑一轮巡检"
```

不想写 config？默认配置开箱即用（通用角色 + 示例页面池），跑一遍看效果再改。

---

## ⚙️ 工作原理（五阶段）

```
┌─────────────────────────────────────────────────────────────┐
│  ① 巡检  15+ 角色 × 页面矩阵                                 │
│     每个角色真实抓页（curl+chrome-devtools），带证据链找痛点    │
│     每条发现打 10 维分（决策/内容/变现/数据/风险/维护/目标/…）  │
├─────────────────────────────────────────────────────────────┤
│  ② 三道门评审                                                │
│     铁则门（极端词/免责/动数据库）→ 一票否决                  │
│     评分门（10 维专属加权，总分达标）→ 对立决裁门（防自嗨）     │
├─────────────────────────────────────────────────────────────┤
│  ③ 实施  通过 → codegraph 定位源码 → 外科手术式最小改动        │
│     scope-creep 检测：禁止擅自扩大改动范围                    │
├─────────────────────────────────────────────────────────────┤
│  ④ 自我改进  Executor 打分 → Analyst 诊断 → Mutator 提一处    │
│     改进 → 下次运行生效（工作流自己进化）                     │
├─────────────────────────────────────────────────────────────┤
│  ⑤ build  攒批本地 build 0 错（不部署、不耗 CI）→ 跑完自动停   │
└─────────────────────────────────────────────────────────────┘
```

### 三道门——防自嗨，只留真问题

| 门 | 拦什么 |
|---|---|
| **铁则门** | 极端词（"最强/最好/No.1"）、缺免责声明、动数据库文件 → 直接 kill |
| **评分门** | 10 维专属加权 + 一票否决（数据可信<4 / 风险<4 / 可维护<3 → 否决） |
| **决裁门** | 维护者/目标对齐/ROI 审计 3 个对立角色复核，≥3 票通过才放行 |

---

## ✨ 特色

- **🦾 多角色真实巡检**：不是"让 AI 猜"，是 15 角色真实打开页面抓证据
- **♾️ 自我改进循环**：每轮 AI 诊断自己的工作流弱点并提一处改进（Executor/Analyst/Mutator）
- **⛩️ 三道门防自嗨**：极端词/免责/数据库保护铁则硬门，对立角色复核
- **🧰 ToolKit 全工具**：自动注入 codebase-memory（查数据来源）、chrome-devtools 全能力（Lighthouse/console/network）、puppeteer 备用、karpathy/systematic-debugging/verification 等 skill 原则
- **🛑 安全红线**：不部署、不 push、不碰数据库文件（除非授权）
- **🔄 断点续跑**：组合矩阵记录进度，中断后 resume 不重复

---

## 📦 目录结构

```
claude-self-iterate/
├── SKILL.md                # 标准 skill 外壳（agentskills.io）
├── workflows/
│   └── self-iterate.js     # 通用引擎（多 agent 编排核心）
├── config.example.js       # 配置模板（角色/页面池/维度/铁则）
├── schema.js               # 4 个结构化输出 Schema
├── docs/
│   ├── ARCHITECTURE.md     # 五阶段架构 + ToolKit 机制
│   ├── ROLE-SPEC.md        # 角色 6 层画像规范
│   ├── SELF-IMPROVE.md     # Executor/Analyst/Mutator 循环
│   └── CONFIG-GUIDE.md     # 完整配置指南
├── LICENSE                 # Apache-2.0
└── package.json
```

---

## 🤝 贡献

- **加角色**：在 `config.js` 的 `roles` 里加一个 6 层画像（identity/vision/checklist/kpi/constitution/defense）
- **修引擎**：PR 改 `workflows/self-iterate.js`（保持通用，别写死站点）
- **加 Skill 原则**：`TOOLKIT` 里补充各阶段该利用的 skill/MCP

先看 [CONTRIBUTING](CONTRIBUTING.md)（或直接提 issue 讨论）。

---

## ❓ FAQ

**Q：会自己改代码并部署吗？**
不会。默认只跑巡检+评审+自我改进，实施阶段产出的清单给你确认；不部署、不 push、不 commit。

**Q：角色怎么加？**
每个角色是 6 层画像（身份/视角/硬清单/KPI/原则锚点/误报防御），复制 `config.example.js` 里任意角色改即可。

**Q：页面很多会跑很久？**
默认全矩阵跑完自动停；可用 `args.maxBatches` 限制批次（先跑 1 批看质量）。详情页按 T1/T2/T3 分层抽样，不全跑。

**Q：需要什么环境？**
Claude Code（或支持 Workflow 工具的 agent harness）+ 已连接 MCP（chrome-devtools/codegraph/codebase-memory）。无 MCP 时子 agent 退化为 curl/WebFetch。

**Q：会不会泄露我的站内数据？**
不会。工作流只读页面 HTML + 你本地的源码定位；所有结果只在本地工作区。你的 `config.js` 不要提交（已在 `.gitignore`）。

---

## 📄 License

[Apache-2.0](LICENSE) — 可自由使用、修改、商用。

---

**给这个项目一个 ⭐**，如果它帮你省下了几十次"人肉巡检"。
