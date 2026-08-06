# Changelog

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。未发布版本见 [Releases](https://github.com/duola15/claude-self-iterate/releases)。

## [0.1.0] - 2026-08-05

### 新增
- 多角色自迭代工作流引擎（`workflows/self-iterate.js`）：巡检 → 三道门 → 实施 → 自我改进 → build
- 5 个场景模板：`examples/`（ecommerce / docs-site / saas / github-repo + sample-report）
- `install.sh` 一键安装到 Claude Code；`SKILL.md` skill 外壳（agentskills.io）
- 3 个标准 issue 模板 + PR 模板 + CODE_OF_CONDUCT + CI + 单元测试（38 项）

### 修复
- README 配置方式澄清：引擎只读 `args.config`，不读 `config.js`（曾误导用户编辑无效文件）
- 断点续跑 / memoryDir：如实标注为规划中（曾声明未实现功能）
- 决裁逻辑：`final:true` 角色投"驳回"现为绝对否决（曾可被 3:1 翻盘）
- 版本号统一 v0.1；commit 历史措辞中性化

### 安全
- 引擎零第三方依赖、零文件写入、零外传；不部署、不 push、不碰数据库文件（默认）
