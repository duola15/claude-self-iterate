# 学习循环（Learning Loop）

借鉴 ruflo 的 SONA 自学习 / 轨迹学习思路，把 `Executor/Analyst/Mutator` 从"单轮提建议"升级为**跨轮次持久学习**。

## 现状

每轮 workflow 返回 `selfImprove`：`{ executor_score, weakness, suggestion, target }`。
- **Executor** 按证据完整性/角色定位/工具利用率给本轮工作流打 0-100
- **Analyst** 诊断最大弱点
- **Mutator** 提**一处**外科手术式改进（add_example / add_constraint / restructure / add_edge_case）

## 升级：主 agent 驱动的跨轮次循环

Workflow 引擎无文件系统（不能自改脚本/落盘），所以学习循环由**主 agent** 驱动：

```
① 跑 workflow → 返回 selfImprove
② 主 agent 把建议写入 LEARNINGS.md（跨轮次累积）
③ 下次运行前：主 agent 读 LEARNINGS.md，应用未完成建议
    - add_example    → 给角色 checklist 加一个具体例子
    - add_constraint → 给角色 defense 加一条限制
    - restructure    → 调整流程/页面池
    - add_edge_case  → 补一个边界场景
④ 应用后更新 LEARNINGS.md 状态为 ✅
⑤ 收敛：executor_score 连续 2 轮无提升 → 停止改进（记录"已收敛"）
```

## 关键

- **改动的最小单元 = 一处**（Mutator 原则）：每次只改一个角色/评分/流程，才能判断是否有效
- **保留证据**：LEARNINGS.md 记录"改了 X → 分数从 Y 到 Z"，形成轨迹学习
- **收敛即停**：连续 2 轮无提升，说明工作流已适应当前站点，停止自我改进（矩阵仍跑完）

## 示例

```markdown
| 日期 | 轮次 | 分数 | 弱点 | 建议 | 目标 | 状态 |
|---|---|---|---|---|---|---|
| 2026-08-06 | 1 | 82 | SEO 角色 checklist 抽象 | add_example: 加"robots.txt 返回 500"例子 | roles:seo | ✅ 已应用 |
```

完整记录见 [LEARNINGS.md](../LEARNINGS.md)。
