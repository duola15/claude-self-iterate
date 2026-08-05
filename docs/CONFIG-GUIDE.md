# 配置指南（CONFIG-GUIDE）

复制 `config.example.js` → `config.js` 开始自定义。**config.js 已在 `.gitignore`，不要提交**（可能含你的站点策略）。

## 三处必须改

```js
export default {
  name: "你的站点名",
  siteUrl: "http://localhost:3000",   // 本地 dev server（子 agent 抓它）
  workDir: ".",                        // 项目根目录（实施定位源码用）
}
```

## 可选配置

### 记忆
```js
memoryDir: null,   // 设为 "reports/iterate" 之类：每轮结果写 JSON 摘要；null = 跳过
```

### 评分维度（10 维）
```js
dims: [ { k: "D", name: "决策转化", q: "用户能否更快完成任务", veto: false }, ... ],
passScore: 25,   // 总分 ≥ passScore 放行（10 维满分 = passScore×2）
```
- `veto: true` + `vm` = 一票否决（分数 < vm 直接 kill）
- 可增删维度；`scoreOf` 自动适配

### 铁则（极端词）
```js
extremeWords: ["最大", "最强", ...],
```
扫描提案文本，命中即 kill。加你的领域禁用词。

### 角色
```js
roles: [ { key, name, w, scope, judge?, veto?, identity, vision, checklist, kpi, constitution, defense }, ... ]
```
见 [ROLE-SPEC.md](ROLE-SPEC.md)。

### 页面池
```js
pageCore:   [{ id, path, name }, ...],   // 每个巡检角色 × 核心页
modelTiers: [{ tier, hint, n }, ...],    // 详情页分层抽样（避免全跑）
pageLongtail: [{ id, name, path }, ...], // 长尾页，每种类型至少查一次
```

## 运行时覆盖（优先于 config.js）

```js
Workflow({
  scriptPath: "workflows/self-iterate.js",
  args: {
    siteUrl: "http://localhost:8080",  // 覆盖站点地址
    maxBatches: 1,                     // 限制批次（先跑 1 批看质量）
    config: { name: "临时站点", roles: [...], pageCore: [...] },  // 覆盖任意配置
  }
})
```

## 建议流程

1. **小跑看质量**：`maxBatches: 1`，看 7 个角色抓到的痛点质量
2. **调角色**：按 ROLE-SPEC 加/改角色画像（质量不够 = 角色写浅了）
3. **全量跑**：去掉 `maxBatches`，矩阵跑完自动停
4. **应用自我改进**：每次跑完读返回的 `selfImprove.suggestion`，改 config 再跑
