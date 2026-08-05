---
name: Pull request
about: 提交改进
title: ""
labels: ""
---

## 是什么
一句话说明这个 PR 做什么。

## 为什么
解决什么问题 / 满足什么需求（附 issue # 若有）。

## 类型（勾选）
- [ ] 加角色（config 新角色，附 6 层画像 + 能发现什么问题的例子）
- [ ] 修引擎（workflows/self-iterate.js，保持通用不写死站点）
- [ ] 加 Skill/MCP 原则（TOOLKIT）
- [ ] 文档 / 示例 / CI / 测试

## 自检
- [ ] `node --check` 通过（core.js 用 wrapper 校验顶层 return）
- [ ] 本地干跑过一轮（maxBatches: 1）无报错
- [ ] 未引入任何具体站点/品牌/隐私信息
- [ ] 未破坏默认配置开箱即用（配置有效性测试通过）
