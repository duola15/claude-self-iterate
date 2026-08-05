// 配置有效性测试：确保 config.example.js 与 examples/*.js 结构正确
// 运行: node --test test/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// 加载所有配置（config.example + examples/*.js）
const CONFIGS = {}
CONFIGS['config.example'] = await import('../config.example.js')
for (const f of readdirSync(join(ROOT, 'examples')).filter(f => f.endsWith('.js'))) {
  CONFIGS[`examples/${f}`] = await import(`../examples/${f}`)
}

const REQUIRED_KEYS = ['name', 'siteUrl', 'workDir', 'dims', 'extremeWords', 'roles', 'pageCore', 'modelTiers', 'pageLongtail']
const ROLE_LAYERS = ['identity', 'vision', 'checklist', 'kpi', 'constitution', 'defense']

for (const [label, mod] of Object.entries(CONFIGS)) {
  const c = mod.default

  test(`${label}: 必需字段齐全`, () => {
    for (const k of REQUIRED_KEYS) assert.ok(k in c, `缺少字段 ${k}`)
  })

  test(`${label}: dims 有 k/name/q 且一票否决带 vm`, () => {
    for (const d of c.dims) {
      assert.ok(d.k && d.name && d.q, 'dims 项缺 k/name/q')
      if (d.veto) assert.ok(typeof d.vm === 'number', `veto 维度 ${d.k} 缺 vm`)
    }
  })

  test(`${label}: extremeWords 非空`, () => {
    assert.ok(Array.isArray(c.extremeWords) && c.extremeWords.length > 0)
  })

  test(`${label}: roles 每项有 6 层画像 + key`, () => {
    for (const r of c.roles) {
      assert.ok(r.key, 'role 缺 key')
      assert.ok(r.w, 'role 缺 w（专属加权）')
      for (const layer of ROLE_LAYERS) assert.ok(r[layer], `role ${r.key} 缺 ${layer}`)
      // 专属加权必须指向存在的维度
      for (const k of Object.keys(r.w)) {
        assert.ok(c.dims.some(d => d.k === k), `role ${r.key} 加权维度 ${k} 不存在于 dims`)
      }
    }
  })

  test(`${label}: pageCore 每项有 id/path`, () => {
    for (const p of c.pageCore) assert.ok(p.id && p.path, 'pageCore 项缺 id/path')
  })

  test(`${label}: 至少一个 judge:true 角色（决裁）`, () => {
    assert.ok(c.roles.some(r => r.judge), '缺少 judge:true 决裁角色')
  })
}

// core.js 语法（workflow 顶层 return 需 wrapper 校验）
test('workflows/self-iterate.js 语法（wrapper）', () => {
  const src = readFileSync(join(ROOT, 'workflows', 'self-iterate.js'), 'utf-8')
  const wrapped = 'async function _wf(){\n' + src.replace(/^export const meta/m, 'const meta') + '\n}'
  assert.doesNotThrow(() => new Function(wrapped), 'core.js 有语法错误')
})
