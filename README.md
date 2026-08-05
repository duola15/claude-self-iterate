<div align="center">

# ♾️ claude-self-iterate

### 让 Claude 自己优化你的网站——像一支 15 人产品团队，每天帮你巡检、评审、改版。直到改无可改，自动停。

[![Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/duola15/claude-self-iterate/ci.yml?label=CI)](https://github.com/duola15/claude-self-iterate/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub stars](https://img.shields.io/github/stars/duola15/claude-self-iterate?style=social)](https://github.com/duola15/claude-self-iterate/stargazers)

**给这个项目一个 ⭐** —— 你每星一次，AI 就离"自我迭代产品"更近一步。

> 🛠 **Status**: v0.1 · 活跃维护 · CI 全绿 · **吃自己的狗粮** —— 本仓库的 README/文档正是用这套 workflow 优化的（见 [案例](examples/case-study-github-repo.md)）。

</div>

---

## 💡 它解决什么问题

你的网站**天天在改**，但总是靠人肉：

| 现状 | 问题 |
|---|---|
| 改 UI 靠"我感觉" | 没有系统证据，不知道用户卡在哪 |
| 改文案靠"应该这样" | 漏了 90% 的页面 |
| 排错靠"拍脑袋" | 发现一个问题，漏了一整类 |

**Self-Iterate 换一种方式**：让 AI 扮演 **15 个评审角色**（新手/老手/数据审计/合规/性能/视觉/无障碍/SEO/转化/安全/内容…），**真实打开你的每一个页面**，用各自视角找痛点。每个发现都带**证据链**（实际内容 + 源码位置），过三道门才实施，实施后 AI 还**自我改进自己的工作流**。

> 核心洞察：**"逛一遍全站"比"抽查几个页面"能发现成倍的问题——而且全自动。**

---

## 🚀 5 分钟跑通

```bash
# 0) 克隆仓库
git clone https://github.com/duola15/claude-self-iterate && cd claude-self-iterate

# 1) 一键安装到 Claude Code
bash install.sh          # Windows 用户请用 Git Bash 或 WSL

# 2) 复制配置，改你的站点
cp config.example.js config.js
#    编辑 config.js: siteUrl = "http://localhost:3000", name = "你的站点"

# 3) 在【你的网站项目】里把网站跑在 localhost:3000（不是本仓库）
cd /path/to/your-website && npm run dev
#    或临时起一个最小静态站：
npx serve -p 3000 /path/to/your-website

# 4) 在 Claude Code 里说：
#    "运行 self-iterate，对 localhost:3000 跑一轮巡检"
#    或：
Workflow({ scriptPath: "workflows/self-iterate.js",
           args: { siteUrl: "http://localhost:3000", maxBatches: 1 } })
```

> 💡 **配置优先级**：`args`（运行时传参）> `config.js`。相同字段以 `args` 为准。
> 本仓库是"工作流引擎"不含网站代码；`npm run dev` 跑的是**你自己的网站项目**。

## ✅ 环境要求

- **Node.js ≥ 18**（子 agent 定位源码用）
- **Claude Code**（或支持 Workflow 工具的 agent harness）
- **平台**：macOS / Linux 直接 `bash install.sh`；**Windows 用 Git Bash 或 WSL**
- **MCP（可选但推荐）**：chrome-devtools / codegraph / codebase-memory —— 无则子 agent 退化为 curl/WebFetch

**不想写配置？** 3 个场景模板拿来即用：

| 模板 | 适合 | 用法 |
|---|---|---|
| 🛒 [ecommerce.js](examples/ecommerce.js) | 电商站（转化/价格/购物车） | `cp examples/ecommerce.js config.js` |
| 📚 [docs-site.js](examples/docs-site.js) | 文档站（新手/搜索/可读性） | `cp examples/docs-site.js config.js` |
| 💼 [saas.js](examples/saas.js) | SaaS（注册/定价/留存） | `cp examples/saas.js config.js` |
| 🐙 [github-repo.js](examples/github-repo.js) | **GitHub 开源项目（25 人群角色）** | `cp examples/github-repo.js config.js` |

---

## 📊 跑一轮你会看到什么

> 完整示例报告见 **[examples/sample-report.md](examples/sample-report.md)**。这是**构造示例**，字段真实。

```json
{
  "findings": 12, "approved": 5, "rejected": 7, "applied": 3,
  "selfImprove": {
    "executor_score": 82,
    "weakness": "SEO 角色 checklist 太抽象",
    "suggestion": "add_example: 给 SEO 角色加'robots.txt 返回 500'的具体例子",
    "target": "roles:seo-expert"
  }
}
```

**巡检发现的 3 个样例（带证据链）**：

| 角色 | 页面 | 痛点 | 严重度 |
|---|---|---|---|
| 新手用户 | /pricing | 主 CTA"立即开始"跳到注册页，但 hero 承诺"免费试用"——文案与按钮矛盾 | P1 |
| 数据审计 | /docs | 文档页"3M+ 用户"无来源，与关于页"2M+"矛盾 | P0 |
| 合规官 | /blog | 博客缺免责声明，标题含"最强方案"极端词 | P1 |

---

## ⚙️ 工作原理（五阶段）

```
┌─────────────────────────────────────────────────────────────┐
│  ① 巡检  15+ 角色 × 页面矩阵                                 │
│     每个角色真实抓页（curl + chrome-devtools），带证据链找痛点  │
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

## 🆚 与"手动优化" / 其他工具比

| 维度 | 手动人肉 | 其他 AI 工具 | **claude-self-iterate** |
|---|---|---|---|
| 覆盖面 | 抽查几个页面 | 单页分析 | **全站矩阵（每页多角色）** |
| 证据 | 凭感觉 | 凭上下文 | **带源码定位的真实抓取** |
| 防自嗨 | 无 | 无 | **三道门硬门** |
| 自我进化 | 无 | 无 | **Executor/Analyst/Mutator 循环** |
| 部署 | 手动 | 常自动改 | **不部署（安全默认）** |

---

## ✨ 特色

- **🦾 多角色真实巡检**：不是让 AI 猜，是 15 角色真实打开页面抓证据
- **♾️ 自我改进循环**：每轮 AI 诊断自己的工作流弱点，提一处改进（受 [awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) 启发）
- **⛩️ 三道门防自嗨**：极端词/免责/数据库保护硬门 + 对立角色复核
- **🧰 ToolKit 全工具**：自动注入 codebase-memory / chrome-devtools 全能力 / puppeteer / karpathy / systematic-debugging / verification 到对应阶段
- **🛑 安全红线**：不部署、不 push、不碰数据库文件（除非授权）
- **🔄 组合去重**：运行内 `seen` 集合避免重复查同一页面（跨运行断点续跑在规划中）
- **📦 配置驱动**：角色/页面池/维度/铁则全部可配，3 个场景模板开箱即用

---

## 📦 目录结构

```
claude-self-iterate/
├── SKILL.md                # 标准 skill 外壳（agentskills.io）
├── install.sh              # 一键安装到 Claude Code
├── workflows/
│   └── self-iterate.js     # 通用引擎（多 agent 编排核心）
├── config.example.js       # 配置模板
├── examples/
│   ├── sample-report.md    # 示例报告（跑一轮后你看到什么）
│   ├── ecommerce.js        # 电商站模板
│   ├── docs-site.js        # 文档站模板
│   └── saas.js             # SaaS 模板
├── schema.js               # 4 个结构化输出 Schema
├── test/                   # 配置有效性测试（node --test）
├── docs/                   # ARCHITECTURE / ROLE-SPEC / SELF-IMPROVE / CONFIG-GUIDE
├── .github/                # CI + issue/PR 模板
└── LICENSE                 # Apache-2.0
```

---

## 🤝 贡献

- **加角色**：`config.js` 的 `roles` 加 6 层画像（见 [ROLE-SPEC.md](docs/ROLE-SPEC.md)）
- **修引擎**：PR 改 `workflows/self-iterate.js`（保持通用）
- **加 Skill/MCP 原则**：`TOOLKIT` 补充各阶段

先看 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [行为准则](CODE_OF_CONDUCT.md)。

## 🗺️ Roadmap

**v0.1（当前）**：核心引擎 · 5 阶段 · 5 场景模板（电商/文档站/SaaS/GitHub 开源）· Dogfooding 案例 · CI 全绿

**v0.2（规划）**
- 更多场景模板（博客/工具站/移动 App）
- 角色库扩充 + 社区贡献的评审角色
- 引擎扩展点（自定义阶段/门禁）
- 更多 MCP 集成（数据库/API 类）

**v0.3（远期）**
- 多站点批量巡检
- 结果可视化报告
- 定时自迭代（每日自动跑一轮）

欢迎在 [Discussions](https://github.com/duola15/claude-self-iterate/discussions) 讨论方向，或提 [Feature request](https://github.com/duola15/claude-self-iterate/issues/new/choose)。

---

## ❓ FAQ

**Q：会自己改代码并部署吗？**
不会。默认只巡检+评审+自我改进，实施清单给你确认；不部署、不 push、不 commit。

**Q：需要什么环境？**
Claude Code + 已连接 MCP（chrome-devtools/codegraph/codebase-memory）。无 MCP 时子 agent 退化为 curl/WebFetch。

**Q：页面很多会跑很久吗？**
矩阵跑完自动停；`args.maxBatches` 限制批次（先跑 1 批看质量）。详情页按 T1/T2/T3 分层抽样，不全跑。

**Q：会不会泄露我的站内数据？**
不会。只读页面 HTML + 本地源码定位；你的 `config.js` 在 `.gitignore` 不提交。

---

## 📄 License

[Apache-2.0](LICENSE) — 可自由使用、修改、商用。

---

**⭐ Star 这个项目**，如果它帮你省下了几十次"人肉巡检"。
