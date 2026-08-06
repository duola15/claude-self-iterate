#!/usr/bin/env node
// scripts/merge-roles.js — 把 roles/*.js 合并成 config.roles 数组
// 用法: node scripts/merge-roles.js            # 打印 JSON（贴进 config.roles）
//       node scripts/merge-roles.js --out config.roles.json   # 写入文件
import { readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ROLES_DIR = join(ROOT, 'roles')

const files = readdirSync(ROLES_DIR).filter(f => f.endsWith('.js') && f !== 'index.js')
const roles = []
for (const f of files) {
  const mod = await import(`../roles/${f}`)
  roles.push(mod.default)
}

const out = JSON.stringify(roles, null, 2)
const outIdx = process.argv.indexOf('--out')
if (outIdx >= 0 && process.argv[outIdx + 1]) {
  writeFileSync(join(ROOT, process.argv[outIdx + 1]), out, 'utf-8')
  console.log(`✅ 已合并 ${roles.length} 个角色 → ${process.argv[outIdx + 1]}`)
} else {
  console.log(out)
}
