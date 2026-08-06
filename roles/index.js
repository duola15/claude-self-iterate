// 角色库聚合导出 —— 在支持文件系统的环境（主 agent / 构建脚本）用：
//   import { roles } from './roles/index.js'
//   Workflow({ args: { config: { roles } } })
import newUser from './new-user.js'
import dataAuditor from './data-auditor.js'
import compliance from './compliance.js'

// 角色库（社区贡献入口）：新增角色 → 建 roles/<key>.js → 在下方 import + 加入数组
export const roles = [newUser, dataAuditor, compliance]
export default roles
