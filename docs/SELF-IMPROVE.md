# 自我改进（SELF-IMPROVE）

受 [awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) 的
`self-improving-agent-skills`（Executor/Analyst/Mutator 循环）启发。

## 三角色

| 角色 | 做什么 |
|---|---|
| **Executor** | 按"证据完整性 / 角色定位深度 / 重要遗漏 / 工具利用率 / 通过率"给本轮工作流质量打 0-100 |
| **Analyst** | 诊断最大弱点（角色 prompt 定位 / 评分漂移 / 流程盲区 / 页面池遗漏 / 工具未用足） |
| **Mutator** | 只提**一处**外科手术式改进，策略四选一 |

## 改进策略（Mutator）

| 策略 | 何时用 | 示例 |
|---|---|---|
| `add_example` | 角色清单太抽象，agent 不知道报什么 | 新手角色加"错引按钮"的具体例子 |
| `add_constraint` | 角色容易误报 | 数据角色加"别因为来自数据库就全报" |
| `restructure` | 流程有盲区 | 评审缺安全维度 → 加 security-review 参考 |
| `add_edge_case` | 有边界漏网 | 404 页/移动端/暗色模式未覆盖 |

## 闭环（跨轮次）

```
本轮运行 → Executor 打分 → Analyst 诊断 → Mutator 建议
                                      ↓
              下次运行前：主 agent 应用建议（改 config/引擎）
```

- **workflow 环境无文件系统**：引擎不能自改脚本 → 建议存进返回 `selfImprove`，由主 agent 下次运行前应用
- **收敛**：`executor_score` 连续 2 轮无提升 → 停止自我改进（但矩阵继续跑到完）

## 参考：三层编排（advisor-orchestrator-worker）

改进建议时对照是否有盲区：
- **Orchestrator**：主流程编排（巡检→评审→实施）——是否漏了阶段？
- **Advisor**：最强推理做最终裁决（宪法执法官）——裁决是否被高评分带偏？
- **Workers**：最便宜执行（巡检/实施）——执行质量是否被模型弱化？

若发现某层职责不清，就是一次 `restructure` 改进。
