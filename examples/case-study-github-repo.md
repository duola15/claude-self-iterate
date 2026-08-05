# 🐙 案例：用它优化它自己（Dogfooding）

> **这是 `claude-self-iterate` 的第一个真实案例** —— 我们用这套 workflow 优化了这个仓库自己。
> 配置见 [examples/github-repo.js](github-repo.js)：角色 = 会访问 GitHub 的 25 种人群。

## 一、为什么 Dogfooding（吃自己的狗粮）

`self-iterate` 的价值主张是"让 Claude 用多角色真实逛你的站点，找痛点→评审→实施→自我改进"。
那最诚实的验证方式是什么？**用它逛它自己的 GitHub 仓库。**

- 角色换成"访问 GitHub 的人"（首次开发者/数据分析师/首次 Star 者/LLM 用户…）
- 页面池换成"仓库页面"（README/Quickstart/Issues/License…）
- 然后真实运行，看它能不能找出这个仓库自己的问题

> 采用度越高 → 说明这个 workflow 越有真实价值（因为它的首个产出就是把这个开源项目自己打磨得更好）。

## 二、配置：25 个访问 GitHub 的人群角色

`github-repo.js` 预置了访问 GitHub 的各色人群，每个 6 层画像（身份/视角/硬清单/KPI/原则/误报防御）：

| 类别 | 角色 |
|---|---|
| 开发者 | 首次开发者·资深开发者·开源维护者·代码审查者·包管理器用户 |
| 评估者 | 招聘者·数据分析师·竞品维护者·首次 Star 者·长期用户 |
| 内容 | 技术博主·文档爱好者·LLM/Agent 用户·教学者·非技术用户 |
| 国际/无障碍 | 国际用户·移动端用户·无障碍用户 |
| 安全/性能 | 安全审计员·性能关注者·SEO 发现者 |
| 增长 | 贡献者·赞助者·历史考古者 |
| 决裁 | 维护者决裁·采用对齐官·ROI 审计官·宪法执法官 |

## 三、第一轮真实巡检（4 个代表角色的发现）

我们派了 4 个角色真实访问仓库（`WebFetch` + `gh api` 核验），以下是**真实产出**：

### 🔴 首次开发者：README 第 3 步必挂

> 按 README Quickstart 走，`npm run dev` 必然报 `Missing script: "dev"` —— 仓库 `package.json` 经核验没有 `scripts` 字段，且本仓库不含网站代码，首次开发者不知道"起谁的服务"。

**证据**：README 原文「3) 本地起 dev server… npm run dev」；`raw.githubusercontent.com` 核验 package.json 无 scripts。
**修复**：README 第 3 步改为「在**你的网站项目**里跑」+ 加 `git clone` 前置 + 新增 ✅ 环境要求节（Node/平台/Windows 用 Git Bash）。

### 🔴 LLM/Agent 用户：缺 3 个"执行契约"

> ① Quick Start 无 `git clone` 前置，`install.sh` 无来源；② `Workflow({scriptPath...})` 只有入参示例，无返回契约；③ `config.js` 与 `args.siteUrl` 优先级未声明。

**修复**：Quick Start 加 clone；新增「💡 配置优先级：`args` > `config.js`」。

### 🟡 数据分析师：无硬性造假 ✅（但 1 个软点）

> 全部可核实数字与仓库一致：15 角色/10 维/三道门/license/CI/星数全部真实。唯一软点：`Claude Code ready` 静态自宣徽章不可验证。

**修复**：删除不可验证的自宣徽章，只保留可验证的（Apache/CI/PR/star）。

### 🟡 首次 Star 者：零社会证明 + 无视觉成果

> 首屏文案抓人，但 30 秒窗口内"1 star · Languages 空白"+"成果用代码块而非截图"构成 Star 迟疑。

**修复**：加「🛠 Status: v0.1 · 活跃维护 · CI 全绿 · 吃自己的狗粮」+ `.gitattributes` 强制语言识别。

## 四、第一轮自我改进建议（下轮生效）

> **Executor 评分**：本轮发现证据完整、命中真实硬伤（README 跑不通是 P0），质量 85/100。
> **Analyst 诊断**：github-repo config 的页面池偏"仓库结构"（README/Issues/License），缺"GitHub 特有的交互面"——Issues 页真实活跃度、Actions 页、移动端渲染。
> **Mutator 改进**：`add_edge_case` —— github-repo config 补 3 个页面：`/actions`（CI 可信度）、`/issues/new`（模板质量）、`/pulse`（活跃度）。

## 五、这证明了什么

1. **它真的能找出致命问题**：首次开发者发现的 `npm run dev` 硬失败，是纯人肉审查容易漏的
2. **它真的会自我改进**：每轮 Executor/Analyst/Mutator 都在升级角色和页面池
3. **"逛一遍"> "想一遍"**：4 个角色 4 个真实角度，30 分钟内覆盖了 README 从"跑不通"到"徽章造假"的所有层级

---

**这是它存在的意义**：如果你也用 Claude 维护一个网站/GitHub 项目，它能替你"逛"遍全站，找出你没人力检查的问题。
