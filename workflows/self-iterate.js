// ═══════════════════════════════════════════════════════════
// claude-self-iterate — 全站自迭代优化工作流（通用引擎）
//
// 让 Claude 自己"逛你的网站 → 找痛点 → 三道门评审 → 最小实施 →
// 自我改进循环"，直到改无可改自动停。
//
// 用法（Workflow 工具）:
//   Workflow({ scriptPath: "workflows/self-iterate.js",
//              args: { siteUrl: "http://localhost:3000", maxBatches: 1 } })
//   或用 args.config 覆盖任何默认配置（角色/页面池/维度/铁则）。
//
// 详细配置见 config.example.js；架构见 docs/ARCHITECTURE.md。
// ═══════════════════════════════════════════════════════════

export const meta = {
  name: 'self-iterate',
  description: '全站自迭代优化闭环：角色×页面矩阵巡检→多维评分→三道门评审→最小实施+范围检测→Executor/Analyst/Mutator自我改进→攒批build→自动停',
  whenToUse: '需要对网站（UI/内容/数据/收益/性能/合规）做完整自查-优化-迭代闭环，跑完自动停',
  phases: [
    { title: '巡检', detail: '角色×页面矩阵，6层画像+ToolKit全工具，多维自评' },
    { title: '三道门评审', detail: '铁则门 + 评分门 + 对立决裁门' },
    { title: '实施', detail: 'codegraph定位→最小改动→systematic-debugging→verification→scope-creep' },
    { title: '自我改进', detail: 'Executor评分→Analyst诊断→Mutator一处改进' },
    { title: '攒批build+记忆', detail: '本地 build 0错 + 结果摘要 + 主agent裁决' },
  ],
}

// ═══════════════════════════════════════════════════════════
//  默认配置（内嵌·开箱即用；args.config 覆盖）
//  完整注释版见 config.example.js
// ═══════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
  name: 'My Website',
  siteUrl: 'http://localhost:3000',
  workDir: '.',
  memoryDir: null,
  dims: [
    { k: 'D', name: '决策转化', q: '用户能否更快完成任务', veto: false },
    { k: 'C', name: '内容质量', q: '内容是否值得/可分享', veto: false },
    { k: 'M', name: '变现', q: '能否量化收益', veto: false },
    { k: 'T', name: '数据可信', q: '每个数字是否可验证', veto: true, vm: 4 },
    { k: 'R', name: '零风险', q: '免责/合规/不动数据库文件', veto: true, vm: 4 },
    { k: 'S', name: '单人可维护', q: '维护成本低，不成为负担', veto: true, vm: 3 },
    { k: 'F', name: '目标一致', q: '是否服务产品核心目标', veto: true, vm: 1 },
    { k: 'P', name: '性能成本', q: '加载/build 预算可控', veto: false },
    { k: 'U', name: '体验', q: '视觉/可用性/一致性/无障碍', veto: false },
    { k: 'G', name: '增长', q: 'SEO/分发/传播承接', veto: false },
  ],
  passScore: 25,
  extremeWords: ['最大', '最强', '最好', '顶尖', 'no.1', 'the best', 'the strongest', 'leading', "world's largest", 'biggest', '唯一'],
  roles: [
    { key: 'new-user', name: '新手用户', w: { D: 3 }, scope: ['all'], identity: '第一次来网站的完全新手：不了解产品、不想读文档、只想快速完成任务。', vision: '我扮演真实的人走完一次核心任务：每一步是否自然、是否被吓退、是否被误导。', checklist: '①30秒冷启动：第一屏能否说清"这站帮我什么" ②主路径：能否不读文档完成任务 ③术语墙 ④文案矛盾 ⑤信任信号', kpi: '发现真会卡住新手的。', constitution: '主路径清晰·免责声明', defense: '别把信息密度高当缺点。' },
    { key: 'power-user', name: '资深用户', w: { D: 2, T: 2 }, scope: ['all'], identity: '老用户：懂术语、关注深度与可信度。', vision: '我评估结论是否值得信任：可证伪吗？有来源吗？', checklist: '①结论可证伪 ②数字有来源 ③深度足够 ④比较无误导', kpi: '发现看到很强却无证据的。', constitution: '可证伪·客观性', defense: '别把无花哨可视化当缺点。' },
    { key: 'data-auditor', name: '数据审计官', w: { T: 3 }, scope: ['all'], veto: 'T', identity: '数据可信度守门人。怀疑一切数字。', vision: '每个展示值：来源？可验证？过期？', checklist: '①数字有来源 ②同页自洽 ③无来源字段 ④过期 ⑤极端词进 meta', kpi: '发现数字对不上/无来源/误导的。', constitution: '禁止假设·主动验证', defense: '别因为来自数据文件就全报。' },
    { key: 'compliance', name: '合规官', w: { R: 3 }, scope: ['all'], veto: 'R', identity: '合规执法者。扫极端词/免责/数据库保护。', vision: '逐页扫可见文本极端词，逐条定位源码。', checklist: '①极端词 ②免责覆盖 ③动数据库需授权 ④极端词进 og ⑤外链透明', kpi: '列出每处违规+能修/需授权。', constitution: '客观性·零风险·数据保护', defense: '已覆盖要确认。' },
    { key: 'performance', name: '性能工程师', w: { P: 2 }, scope: ['all'], identity: '关注加载/Lighthouse/资源体积。', vision: '真实性能审计。', checklist: '①系统文件 200 ②Lighthouse ③控制台错误 ④网络 404 ⑤CLS ⑥未压缩图片', kpi: '发现性能/系统级故障。', constitution: '性能是硬约束', defense: 'dev 无 Performance 分要明说。' },
    { key: 'ui-designer', name: '视觉设计师', w: { U: 3 }, scope: ['all'], identity: '专注信息层级/排版/色彩/间距。', vision: '一眼看懂重点：层级引导 CTA？', checklist: '①视觉层级 ②排版可读 ③CTA 突出 ④间距一致 ⑤色彩协调 ⑥不杂乱', kpi: '发现影响找重点/信任的视觉问题。', constitution: '禁无意义 UI 改·客观性', defense: '禁主观审美，只报可量化。' },
    { key: 'accessibility', name: '无障碍用户', w: { U: 3 }, scope: ['all'], identity: '屏幕阅读器+键盘用户。', vision: '检查语义化。', checklist: '①标题层级 ②alt ③键盘可达 ④对比度 ⑤按钮名', kpi: '发现影响读屏/键盘的障碍。', constitution: '人人可用', defense: '别把没 ARIA 当唯一。' },
    { key: 'seo-expert', name: 'SEO 专家', w: { G: 3 }, scope: ['all'], identity: '关注 title/meta/schema/系统文件。', vision: '搜索引擎友好度。', checklist: '①robots/sitemap 200 ②title 差异化 ③meta 数据化 ④schema 规范 ⑤og 泄漏 ⑥canonical', kpi: '发现索引安全威胁优先。', constitution: '索引保护·客观性', defense: '别建议大改 URL。' },
    { key: 'conversion', name: '转化官', w: { D: 3 }, scope: ['all'], identity: '检查用户能否清晰完成核心动作。', vision: '走核心转化路径。', checklist: '①主 CTA 清晰 ②每步引导 ③无分心 ④移动端顺畅 ⑤信任信号', kpi: '发现不知道点哪/路径断裂。', constitution: '目标导向', defense: '别把 CTA 少当缺点。' },
    { key: 'security', name: '安全审计员', w: { R: 2 }, scope: ['all'], identity: '查外链/注入/隐私。', vision: '安全面。', checklist: '①外链 ②CSP ③用户数据 ④注入 ⑤隐私政策', kpi: '发现真实安全风险。', constitution: '零风险·隐私', defense: '别把无鉴权当缺点。' },
    { key: 'content', name: '内容官', w: { C: 2 }, scope: ['all'], identity: '评估内容是否值得分享/有钩子。', vision: '内容价值。', checklist: '①可引用数据 ②独特角度 ③标题钩子 ④可分发性 ⑤免责', kpi: '发现无亮点/无钩子内容。', constitution: '数据可信>传播', defense: '别把页面不是长文当缺点。' },
    { key: 'maintainer', name: '维护者', w: { S: 3 }, scope: ['all'], judge: true, veto: 'S', identity: '唯一运营者。评估维护成本。', vision: '可持续性。', checklist: '①维护成本 ②数据源稳定 ③自动化 ④失败风险 ⑤值不值', kpi: '驳回高维护改动。', constitution: '单人可持续', defense: '别把一次性配置当高维护。' },
    { key: 'alignment', name: '目标对齐官', w: { F: 3 }, scope: ['all'], judge: true, veto: 'F', identity: '北极星守门人。', vision: '服务核心价值还是自嗨？', checklist: '①服务哪价值 ②核心指标 ③偏离定位 ④变目录', kpi: '驳回自嗨改动。', constitution: '目标导向', defense: '别把不直接提指标当自嗨。' },
    { key: 'roi-auditor', name: 'ROI 审计官', w: { M: 2 }, scope: ['all'], judge: true, identity: '算投入产出。', vision: '成本 vs 收益。', checklist: '①直接收益 ②间接 ③成本 ④有流量没收入陷阱', kpi: '区分值得 vs 烧资源。', constitution: '可持续经营', defense: '接受信任/内容是长期资产。' },
    { key: 'constitution', name: '宪法执法官', w: { R: 3, F: 2 }, scope: ['all'], judge: true, final: true, identity: '最高原则最终裁判。', vision: '铁则门最终把关。', checklist: '①极端词 ②免责 ③不动数据库 ④不改 URL ⑤不替用户决定', kpi: '拦截一切违规。', constitution: '全部铁则', defense: '铁则就是铁则，但分绝对违规 vs 需授权。' },
  ],
  pageCore: [
    { id: 'home', path: '/', name: '首页' }, { id: 'pricing', path: '/pricing', name: '定价页' },
    { id: 'docs', path: '/docs', name: '文档页' }, { id: 'blog', path: '/blog', name: '博客列表' },
    { id: 'about', path: '/about', name: '关于页' }, { id: 'features', path: '/features', name: '功能页' },
    { id: 'contact', path: '/contact', name: '联系页' },
  ],
  modelTiers: [
    { tier: 'T1', hint: '从首页/精选挑一个最核心的旗舰产品/文章详情页', n: 10 },
    { tier: 'T2', hint: '从列表/搜索挑一个普通内容详情页', n: 8 },
    { tier: 'T3', hint: '从归档/底部挑一个旧/冷门页面', n: 4 },
  ],
  pageLongtail: [
    { id: 'lt-feature-a', name: '功能子页', path: '/features/a' },
    { id: 'lt-docs-a', name: '文档子页', path: '/docs/getting-started' },
    { id: 'lt-blog-post', name: '博客文章', path: '/blog/hello-world' },
    { id: 'lt-pricing-tier', name: '定价子层', path: '/pricing/pro' },
    { id: 'lt-legal', name: '法律页', path: '/privacy' },
    { id: 'lt-faq', name: 'FAQ', path: '/faq' },
    { id: 'lt-404', name: '404 页', path: '/nonexistent' },
    { id: 'lt-search', name: '搜索页', path: '/search' },
    { id: 'lt-account', name: '账号页', path: '/account' },
    { id: 'lt-changelog', name: '更新日志', path: '/changelog' },
  ],
}

// 装配配置（args 优先）
const cfg = {
  ...DEFAULT_CONFIG,
  ...((typeof args !== 'undefined' && args && args.config) || {}),
  siteUrl: (typeof args !== 'undefined' && args && args.siteUrl) || DEFAULT_CONFIG.siteUrl,
  maxBatches: (typeof args !== 'undefined' && args && args.maxBatches) ?? null,
}
const { dims, passScore, extremeWords, roles, pageCore, modelTiers, pageLongtail, workDir, siteUrl, memoryDir } = cfg

// ═══════════════════════════════════════════════════════════
//  ToolKit — 各阶段应利用的 MCP / Skill 原则
//  子 agent 经 ToolSearch 自动调已连接 MCP；skill 是方法论需显式写入。
// ═══════════════════════════════════════════════════════════
const TOOLKIT = {
  survey: [
    'MCP chrome-devtools（主）: navigate → take_snapshot 看 DOM/无障碍树 → take_screenshot → lighthouse_audit → list_console_messages 查报错 → list_network_requests 查 404/CSP',
    'MCP codebase-memory: search_graph 查页面数据来源、trace_path 追调用链',
    'MCP puppeteer（备用）: chrome-devtools 不可用时 navigate/screenshot/evaluate',
    '按角色类型遵循对应 Skill 原则: UI→frontend-design/ui-ux-pro-max; 无障碍→accessibility; 数据→可证伪; 安全→security-review; 增长→agent-reach/exa-search（真实研究分发）',
  ],
  judge: [
    '安全/合规裁决参考 security-review 原则（鉴权/输入/密钥/外链）; 数据裁决参考 seo-geo（极端词泄漏 og）',
  ],
  implement: [
    'MCP codegraph_explore 定位源码; MCP codebase-memory trace_path 查影响面',
    'Skill karpathy-guidelines: 外科手术式最小改动，禁过度设计',
    '遇 Bug 用 systematic-debugging: 先复现→定位根因→再改，禁猜测',
    'Skill verification-before-completion: 改完跑验证，有证据才说完成',
    'Skill simplify: 改完自查是否可更简',
  ],
  improve: [
    '参考 advisor-orchestrator-worker 三层: Orchestrator 编排 / Advisor 裁决 / Workers 执行 — 对照改进盲区',
  ],
}

// ═══════════════════════════════════════════════════════════
//  Schema
// ═══════════════════════════════════════════════════════════
const FINDINGS_SCHEMA = { type: 'object', properties: {
  roleKey: { type: 'string' }, pageId: { type: 'string' }, problem: { type: 'string' },
  plan: { type: 'string' }, files: { type: 'array', items: { type: 'string' } },
  disclaimer: { type: 'boolean' },
  s_D: { type: 'number' }, s_C: { type: 'number' }, s_M: { type: 'number' }, s_T: { type: 'number' },
  s_R: { type: 'number' }, s_S: { type: 'number' }, s_F: { type: 'number' }, s_P: { type: 'number' },
  s_U: { type: 'number' }, s_G: { type: 'number' },
  evidence: { type: 'string' },
}, required: ['roleKey', 'pageId', 'problem', 'plan', 's_D', 's_T', 's_R', 's_S', 's_F'] }

const VERDICT_SCHEMA = { type: 'object', properties: {
  verdict: { type: 'string', enum: ['通过', '驳回'] }, score: { type: 'number' }, reason: { type: 'string' },
}, required: ['verdict', 'score', 'reason'] }

const APPLY_SCHEMA = { type: 'object', properties: {
  applied: { type: 'boolean' }, summary: { type: 'string' }, failReason: { type: 'string' }, scope_creep: { type: 'string' },
}, required: ['applied'] }

const BUILD_SCHEMA = { type: 'object', properties: {
  ok: { type: 'boolean' }, errors: { type: 'number' }, pages: { type: 'number' }, output_tail: { type: 'string' },
}, required: ['ok', 'errors'] }

// ═══════════════════════════════════════════════════════════
//  核心函数
// ═══════════════════════════════════════════════════════════
function seededShuffle(arr, seed) {
  let s = (seed || 42) | 0
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const j = s % (i + 1)
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp
  }
  return a
}

// 多维评分：专属加权 + 一票否决
function scoreOf(f, role) {
  const w = role.w || {}
  let total = 0
  const vetoes = []
  for (const d of dims) {
    const v = f[`s_${d.k}`] ?? 1
    total += v * (w[d.k] || 1)
    if (d.veto && v < d.vm) vetoes.push(`${d.name}(${v}<${d.vm})`)
  }
  return { total, vetoes }
}

// 铁则门
function constitutionGate(f) {
  const text = `${f.plan || ''} ${f.problem || ''}`.toLowerCase()
  const v = []
  for (const w of extremeWords) if (text.includes(w)) v.push(`极端词:${w}`)
  if ((f.files || []).some(x => /^data\//.test(x) || /\.db$|database/.test(x))) v.push('动数据库文件')
  if ((f.files || []).length && !f.disclaimer && /对外|页面|推荐|排名|对比|部署/.test(text)) v.push('缺免责声明')
  return v
}

// 角色 6 层画像 → 巡检 prompt
function rolePrompt(role) {
  return [
    `## 你的身份`, role.identity,
    `## 你的专业视角`, role.vision,
    `## 硬检查清单（逐条执行，命中才报）`, role.checklist,
    `## 什么叫合格（KPI）`, role.kpi,
    `## 原则锚点（违规才报）`, role.constitution,
    `## 调查方法（必须遵守）`,
    `- 用 curl 拿完整 HTML（WebFetch 对 localhost 常失败）；疑似问题用 chrome-devtools 实测`,
    `- 每条发现带证据链：实际内容/路径 + 源码定位（文件:行号）+ 影响面`,
    `- 严重度 P0(全站/阻断)/P1(影响任务或体验)/P2(次要)，评估修复成本`,
    `- 疑似问题先验证再报；跨页对比类至少抓 2-3 页`,
    `## 可用工具（MCP + Skill，能帮上就必须用）`,
    ...TOOLKIT.survey,
    `- 禁止凭空猜，禁止为凑数造问题；无问题明确说"未发现"`,
    `## 误报防御`, role.defense,
    `\n输出：只报【命中硬清单】的真实问题。无真问题返回 null。每条必须引证据。`,
  ].join('\n')
}

function pageInstruction(pageId) {
  if (pageId.startsWith('model-')) {
    const mt = modelTiers.find(m => pageId.startsWith(`model-${m.tier}-`))
    return `详情页（${mt.tier} 层）: ${mt.hint}。打开该真实详情页检查。`
  }
  const core = pageCore.find(p => p.id === pageId)
  if (core) return `页面 ${core.path}（${core.name}）`
  const lt = pageLongtail.find(p => p.id === pageId)
  if (lt) return `长尾页 ${lt.path}（${lt.name}）。若 404，从站内导航找同类型真实页。`
  return `页面 /${pageId}`
}

// 生成全部组合（不含 done，断点续跑）
function buildAllCombos(done) {
  const combos = []
  const seen = new Set(done)
  const add = (roleKey, pageId) => {
    const k = `${roleKey}::${pageId}`
    if (seen.has(k)) return
    seen.add(k)
    combos.push({ roleKey, pageId })
  }
  for (const role of roles) {
    if (role.key === 'constitution') continue
    for (const page of pageCore) {
      const cat = page.id.startsWith('pricing') ? 'pricing' : page.id.startsWith('docs') ? 'docs' : page.id
      if (role.scope.includes('all') || role.scope.includes(cat)) add(role.key, page.id)
    }
  }
  for (const mt of modelTiers) {
    for (let i = 0; i < mt.n; i++) {
      add(roles[i % roles.filter(r => !r.judge).length].key, `model-${mt.tier}-${i}`)
    }
  }
  const inspectRoles = roles.filter(r => !r.judge)
  for (let i = 0; i < pageLongtail.length; i++) {
    add(inspectRoles[i % inspectRoles.length].key, pageLongtail[i].id)
  }
  return { combos, seen }
}

// ═══════════════════════════════════════════════════════════
//  主流程
// ═══════════════════════════════════════════════════════════
phase('巡检')
let done = []
const findings = []
const allCombos = buildAllCombos(done).combos
const totalCombos = allCombos.length
const ROUND_LIMIT = cfg.maxBatches || Math.ceil(totalCombos / 7)
const BATCH_SIZE = 7
let cursor = 0
let batchNo = 0
while (cursor < totalCombos && batchNo < ROUND_LIMIT) {
  const batch = seededShuffle(allCombos.slice(cursor, cursor + BATCH_SIZE), batchNo + 1)
  cursor += BATCH_SIZE
  batchNo++
  log(`巡检批次 ${batchNo}/${Math.min(ROUND_LIMIT, Math.ceil(totalCombos / 7))}：${batch.map(c => c.roleKey).join(', ')}（已消费 ${cursor}/${totalCombos}）`)
  const res = await parallel(batch.map(c => () => {
    const role = roles.find(r => r.key === c.roleKey) || roles[0]
    return agent(
      `你是这个网站的【${role.name}】评审专家。用 curl 抓 ${siteUrl} 完整 HTML，疑似问题用 chrome-devtools 实测。\n\n${rolePrompt(role)}\n\n当前任务：${pageInstruction(c.pageId)}\n\n返回 JSON：{ "roleKey": "${c.roleKey}", "pageId": "${c.pageId}", "problem": "", "plan": "", "files": [], "disclaimer": false, "s_D": 0, "s_C": 0, "s_M": 0, "s_T": 0, "s_R": 0, "s_S": 0, "s_F": 0, "s_P": 0, "s_U": 0, "s_G": 0, "evidence": "" }`,
      { label: `巡检:${role.name}`, phase: '巡检', schema: FINDINGS_SCHEMA }
    )
  }))
  findings.push(...res.filter(Boolean))
}
log(`巡检完成：${batchNo} 批，${findings.length} 条发现（组合 ${cursor}/${totalCombos}）`)

phase('三道门评审')
const gated = []
for (const f of findings) {
  const v = constitutionGate(f)
  if (v.length) { log(`⛔ 铁则门驳回 ${f.pageId}: ${v.join(';')}`); continue }
  gated.push(f)
}
const scored = []
for (const f of gated) {
  const role = roles.find(r => r.key === f.roleKey) || roles[0]
  const { total, vetoes } = scoreOf(f, role)
  if (vetoes.length) { log(`⛔ 一票否决 ${f.pageId}: ${vetoes.join(';')}`); continue }
  if (total < passScore) { log(`⛔ 总分不足 ${f.pageId}: ${total}<${passScore}`); continue }
  scored.push({ ...f, total, role })
}
const JUDGE_KEYS = roles.filter(r => r.judge).map(r => r.key)
const judged = await pipeline(scored, f =>
  parallel(JUDGE_KEYS.map(jk => () => {
    const jr = roles.find(r => r.key === jk) || roles[0]
    return agent(
      `你是这个网站的决裁【${jr.name}】。主提案：页面=${f.pageId} 痛点=${f.problem} 方案=${f.plan} 自评=${f.total}。\n\n${rolePrompt(jr)}\n\n## 裁决参考\n${TOOLKIT.judge.join('\n')}\n\n返回 JSON: { "verdict": "通过"/"驳回", "score": 0-5, "reason": "一句理由" }`,
      { label: `决裁:${jr.name}`, phase: '三道门评审', schema: VERDICT_SCHEMA }
    )
  })).then(revs => {
    const rev = revs.filter(Boolean)
    const passes = rev.filter(r => r.verdict === '通过').length
    const avg = rev.reduce((s, r) => s + (r.score || 0), 0) / Math.max(1, rev.length)
    return { passes, avg, reasons: rev.map(r => r.reason || '').join('; ') }
  })
)
const approved = scored.filter((_, i) => (judged[i] || { passes: 0 }).passes >= 3 && (judged[i] || { avg: 0 }).avg >= 3)
const rejected = scored.filter((_, i) => !((judged[i] || { passes: 0 }).passes >= 3 && (judged[i] || { avg: 0 }).avg >= 3))
log(`✅ 通过三道门 ${approved.length} 条，驳回 ${rejected.length} 条`)

phase('实施')
const applied = []
for (const item of approved) {
  try {
    const r = await agent(
      `在 ${workDir} 实施这条已通过三道门评审的改进：
      页面=${item.pageId} 痛点=${item.problem} 方案=${item.plan} 涉及文件=${(item.files || []).join(', ')}
      步骤：1) codegraph_explore 定位源码 2) 只改业务代码，禁止动数据库文件 3) 不 push/commit/部署
      范围检测（scope-creep）：只改提案意图内文件。需改额外文件必须在 scope_creep 字段标注原因，禁止擅自扩大。
      ## 实施工具与原则
      ${TOOLKIT.implement.join('\n      ')}
      返回 JSON: { "applied": true/false, "summary": "一句话改了什么", "failReason": "失败原因", "scope_creep": "有范围蔓延写原因，否则空" }`,
      { label: `实施:${item.pageId}`, phase: '实施', schema: APPLY_SCHEMA }
    )
    if (r && r.applied) { applied.push({ ...item, summary: r.summary, scope_creep: r.scope_creep || '' }); log(`🛠 已实施 ${item.pageId}: ${r.summary}`) }
    else log(`⚠️ 未实施 ${item.pageId}: ${r?.failReason || 'null'}`)
  } catch (e) { log(`❌ 实施异常 ${item.pageId}: ${e.message}`) }
}

phase('自我改进')
const SELF_IMPROVE_SCHEMA = { type: 'object', properties: {
  executor_score: { type: 'number' }, weakness: { type: 'string' },
  suggestion: { type: 'string' }, target: { type: 'string' },
}, required: ['executor_score', 'weakness', 'suggestion', 'target'] }
const selfImprove = await agent(
  `你是这个网站的自我改进循环【Executor+Analyst+Mutator】。
  本轮：巡检 ${findings.length} 条，过三道门 ${approved.length} 条，驳回 ${rejected.length} 条，已实施 ${applied.length} 条。
  Executor：按"证据完整性/角色定位/重要遗漏/工具利用率"给工作流质量打 0-100。
  Analyst：诊断最大弱点（角色定位/评分漂移/流程盲区/页面池遗漏）。
  Mutator：只提一处外科手术式改进（add_example/add_constraint/restructure/add_edge_case）。
  ## 改进参考
  ${TOOLKIT.improve.join('\n  ')}
  返回 JSON: { "executor_score": 0-100, "weakness": "", "suggestion": "", "target": "" }`,
  { label: '自我改进', phase: '自我改进', schema: SELF_IMPROVE_SCHEMA }
)
if (selfImprove) log(`🔧 自我改进（质量 ${selfImprove.executor_score}/100）：${selfImprove.suggestion}`)

phase('攒批build+记忆')
if (applied.length) {
  const b = await agent(
    `在 ${workDir} 运行本地 build（如 "npx next build" / "npm run build"），要求 0 错误。返回 JSON: { "ok": true, "errors": 0, "pages": N, "output_tail": "最后20行" }`,
    { label: 'build验证', phase: '攒批build+记忆', schema: BUILD_SCHEMA }
  )
  log(`📦 build: ${b && b.ok ? `✅ 0 错误 ${b.pages || ''} 页` : `❌ ${b ? b.errors : '?'} 错误`}`)
} else {
  log('📦 本轮无实施改动，跳过 build')
}

// 结果摘要（memoryDir 可选写入；无文件系统时跳过）
const summary = {
  name: cfg.name, batches: batchNo, combosTotal: totalCombos, combosConsumed: cursor,
  findings: findings.length, gated: gated.length,
  approved: approved.map(a => ({ page: a.pageId, plan: a.plan })),
  rejected: rejected.map(r => ({ page: r.pageId })),
  applied: applied.map(a => ({ page: a.pageId, summary: a.summary, scope_creep: a.scope_creep || '' })),
  selfImprove: selfImprove || null,
  note: '全页面类型×角色已覆盖；未部署；build 攒批验证；自我改进建议已产出（下次运行前应用）。',
}

return summary
