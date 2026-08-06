# 🎭 角色库（Roles）

社区贡献的评审角色，每个文件一个 6 层画像角色。**引擎默认读取 `config.roles`**（DEFAULT_CONFIG 内嵌 15 个通用角色）；本目录是"可组合的角色素材库"。

## 怎么用

在支持文件系统的环境（主 agent / 构建脚本）聚合全部角色：

```js
import { roles } from './roles/index.js'
Workflow({ scriptPath: "workflows/self-iterate.js", args: { config: { roles } } })
```

或按需挑角色，把对象合并进你的 `config.roles`。

## 怎么贡献（社区）

1. 建 `roles/<your-role>.js`，按 [ROLE-SPEC](../docs/ROLE-SPEC.md) 写 6 层画像
2. 在 `roles/index.js` import 并加入数组
3. PR 时附一句"它能发现什么问题"的例子

**4 条铁律**（见 ROLE-SPEC）：
- checklist 要可操作（"首屏最重要内容是否最突出"而非"检查体验"）
- defense 要具体（明确不报什么，agent 才不凑数）
- constitution 要能裁决（违规才报 + 区分能修/需授权）
- 专属加权 `w` 要准（谁管数据谁 T×3）

## 现有角色

| key | 角色 | 专属加权 | 一票否决 |
|---|---|---|---|
| `new-user` | 新手用户 | D×3 | - |
| `data-auditor` | 数据审计官 | T×3 | T（≥4）|
| `compliance` | 合规官 | R×3 | R（≥4）|

> 通用角色全集（15 个，含决裁/宪法执法官）见 `config.example.js` 的 `roles`。
