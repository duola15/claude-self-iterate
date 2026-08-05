// schema.js — 工作流用到的 4 个结构化输出 Schema（供参考/外部消费）
export const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    roleKey: { type: 'string' }, pageId: { type: 'string' }, problem: { type: 'string' },
    plan: { type: 'string' }, files: { type: 'array', items: { type: 'string' } },
    disclaimer: { type: 'boolean' },
    s_D: { type: 'number' }, s_C: { type: 'number' }, s_M: { type: 'number' }, s_T: { type: 'number' },
    s_R: { type: 'number' }, s_S: { type: 'number' }, s_F: { type: 'number' }, s_P: { type: 'number' },
    s_U: { type: 'number' }, s_G: { type: 'number' },
    evidence: { type: 'string' },
  },
  required: ['roleKey', 'pageId', 'problem', 'plan', 's_D', 's_T', 's_R', 's_S', 's_F'],
}

export const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['通过', '驳回'] }, score: { type: 'number' }, reason: { type: 'string' },
  },
  required: ['verdict', 'score', 'reason'],
}

export const APPLY_SCHEMA = {
  type: 'object',
  properties: {
    applied: { type: 'boolean' }, summary: { type: 'string' }, failReason: { type: 'string' }, scope_creep: { type: 'string' },
  },
  required: ['applied'],
}

export const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' }, errors: { type: 'number' }, pages: { type: 'number' }, output_tail: { type: 'string' },
  },
  required: ['ok', 'errors'],
}
