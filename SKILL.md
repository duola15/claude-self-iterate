---
name: self-iterate
description: >-
  全站自迭代优化工作流：让 Claude 自己逛你的网站 → 找痛点 → 三道门评审
  → 最小实施 → 自我改进循环 → 改无可改自动停。触发词："运行全站自迭代"、
  "self-iterate"、"自动优化我的网站"、"跑一轮巡检"。
license: Apache-2.0
metadata:
  version: "0.1.0"
  source: "https://github.com/duola15/claude-self-iterate"
compatibility: >-
  Requires a Claude Code / agent harness with the Workflow tool and connected
  MCP servers (chrome-devtools, codegraph, codebase-memory). Multi-agent
  orchestration is powered by the Workflow runtime.
---

# Self-Iterate — 全站自迭代优化

让 AI 扮演 15 个评审角色（新手/老手/数据审计/合规/性能/视觉/无障碍/SEO/转化/安全/内容…），
真实逛你的网站每个页面，找出痛点 → 过三道门 → 最小实施 → 自我改进循环，直到矩阵跑完自动停。

## 快速开始

1. **复制配置**：`cp config.example.js config.js`，改 `siteUrl` / `name` / 角色 / 页面池
2. **本地起 dev server**（子 agent 抓它）：如 `npm run dev`（端口与 `siteUrl` 一致）
3. **运行**：在 Claude Code 输入：

```
运行 self-iterate，对 http://localhost:3000 跑一轮巡检（maxBatches: 1）
```

或直接：

```
Workflow({ scriptPath: "workflows/self-iterate.js",
           args: { siteUrl: "http://localhost:3000", maxBatches: 1 } })
```

## 它会做什么（五阶段）

```
① 巡检    15 角色 × 页面矩阵 → 每个角色真实抓页找痛点 + 多维自评
② 三道门  铁则门(极端词/免责/数据库) → 评分门(一票否决+总分) → 对立决裁门
③ 实施    通过 → codegraph 定位 → 最小改动 → scope-creep 范围检测
④ 自我改进 Executor 打分 → Analyst 诊断 → Mutator 提一处改进（下轮生效）
⑤ build   攒批本地 build 0 错（不部署、不耗 CI）→ 跑完自动停
```

## 不做什么（安全红线）

- **不部署**、不 push、不 commit（除非你配置）
- **不碰数据库文件**（`.db`/`data/` 等，需你显式授权）
- **不替你做决定**：每条提案过三道门，最终执行清单给你确认

详细：`docs/ARCHITECTURE.md`（架构）、`docs/CONFIG-GUIDE.md`（配置）、`docs/ROLE-SPEC.md`（角色规范）、`docs/SELF-IMPROVE.md`（自我改进）。
