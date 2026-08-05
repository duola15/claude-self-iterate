# 架构（Architecture）

`claude-self-iterate` 是一个五阶段、多 agent 自迭代工作流，运行在 Claude Code 的 Workflow 工具上。

## 分层

```
┌──────────────────────────────────────────────────────────┐
│  config（角色/页面池/维度/铁则）  ← 你定制的地方            │
├──────────────────────────────────────────────────────────┤
│  workflows/self-iterate.js（通用引擎）                     │
│    · buildAllCombos  生成 角色×页面 组合矩阵               │
│    · scoreOf         多维评分 + 一票否决                   │
│    · constitutionGate 铁则门                              │
│    · rolePrompt      角色 6 层画像 → 巡检 prompt           │
│    · 主流程            巡检→评审→实施→自我改进→build        │
├──────────────────────────────────────────────────────────┤
│  ToolKit（各阶段应利用的 MCP/Skill 原则）                   │
└──────────────────────────────────────────────────────────┘
```

## 五阶段

### ① 巡检
- `buildAllCombos` 生成组合：每个巡检角色 × 其 scope 覆盖的核心页，+ 详情页分层抽样（T1/T2/T3）+ 长尾池全类型
- 每批 7 个 agent 并行，真实抓 `siteUrl`（curl 拿 HTML，chrome-devtools 实测）
- 每个发现带 10 维自评分 + 证据链（实际内容 + 源码位置 + 影响面）

### ② 三道门评审
| 门 | 逻辑 |
|---|---|
| 铁则门 | `constitutionGate`：扫描极端词 / 缺免责声明 / 动数据库文件 → kill |
| 评分门 | `scoreOf`：角色专属加权总分 ≥ passScore；一票否决维度不达标 → kill |
| 决裁门 | 所有 `judge:true` 角色（维护者/目标对齐/ROI/宪法）独立复核，≥3 票通过 |

### ③ 实施
- 通过 → 单 agent 串行实施（不并行防冲突）
- 强制 `scope-creep` 检测：只改提案意图内文件，需扩大必须在 `scope_creep` 字段标注
- 注入 ToolKit.implement（codegraph + trace_path + karpathy + systematic-debugging + verification + simplify）

### ④ 自我改进
- Executor 打分（0-100）→ Analyst 诊断 → Mutator 提**一处**外科手术式改进
- 参考 advisor-orchestrator-worker 三层（编排/裁决/执行）对照盲区
- 建议存进返回 `selfImprove`，下次运行前由主 agent 应用

### ⑤ build + 自动停
- 有实施才跑本地 build（`npx next build` 等），0 错验证
- **不部署、不 push、不 commit**（除非你改）
- 组合矩阵跑完自动停

## ToolKit 机制

子 agent 经 **ToolSearch 自动可调所有已连接 MCP**；但 **skill 是方法论不会自动加载**，必须在 prompt 显式写入核心原则。`TOOLKIT` 常量按阶段列明：
- **survey**（巡检）：chrome-devtools 全能力（navigate/snapshot/screenshot/lighthouse/console/network）、codebase-memory（查数据来源/调用链）、puppeteer 备用、按角色 skill 原则
- **judge**（评审）：security-review、seo-geo
- **implement**（实施）：codegraph、codebase-memory trace_path、karpathy、systematic-debugging、verification-before-completion、simplify
- **improve**（自我改进）：advisor-orchestrator-worker 三层

## 安全设计

- **不部署**：build 只本地验证，默认不 push/commit
- **数据库文件保护**：铁则门拦截一切动 `data/`、`.db` 的提案（除非显式授权）
- **不替用户决定**：每条提案过三道门，实施清单在返回结果中给你确认
- **断点续跑**：组合去重（`done` 集合），resume 不重复已查页面
