# 贡献指南

感谢你愿意让这个项目更好。三种贡献方式：

## 1. 加角色（最简单，价值最大）

角色是工作流质量的核心。复制 `config.example.js` 里任意角色，按 [ROLE-SPEC.md](docs/ROLE-SPEC.md) 写 6 层画像：

```js
{
  key: "my-role", name: "我的角色",
  w: { U: 2 }, scope: ["all"],
  identity: "...", vision: "...", checklist: "...",
  kpi: "...", constitution: "...", defense: "...",
}
```

**4 条铁律**：
- checklist 要可操作（"首屏最重要内容是否最突出"而非"检查体验"）
- defense 要具体（明确不报什么，agent 才不凑数）
- constitution 要能裁决（违规才报 + 区分能修/需授权）
- 专属加权 `w` 要准（谁管数据谁 T×3）

PR 时附一个"该角色能发现什么问题"的例子。

## 2. 修引擎

改 `workflows/self-iterate.js`。铁律：
- **保持通用**：禁止写死任何具体站点/页面/品牌
- 配置进 `config`，机制留引擎
- 改前跑 `node --check`，改后本地干跑一次

## 3. 加 Skill/MCP 原则

`TOOLKIT` 常量按阶段列明该用的 skill/MCP。补充时遵循：**MCP 是工具（agent 自动可调），skill 是方法论（必须显式写入 prompt）**。

## 提 issue

- **Bug**：给复现步骤 + 日志
- **角色想法**：描述角色画像草稿（identity/checklist/defense）
- **架构建议**：先 issue 讨论再 PR，避免大改返工

## 开发环境

```bash
git clone <repo-url> claude-self-iterate
cd claude-self-iterate
cp config.example.js config.js   # 改 siteUrl
# 起你的 dev server，然后本地跑一轮验证
```

## License

Apache-2.0。贡献即同意你的代码以 Apache-2.0 发布。
