#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
# claude-self-iterate — 一键安装到 Claude Code
# 用法: bash install.sh   （在仓库根目录运行）
# 把 SKILL.md + workflows + 示例装到 ~/.claude/skills/self-iterate/
# ═══════════════════════════════════════════════════════════
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/self-iterate"

echo "📦 安装 claude-self-iterate → $DEST"

mkdir -p "$DEST/workflows" "$DEST/docs" "$DEST/examples"
cp "$HERE/SKILL.md" "$DEST/"
cp "$HERE/workflows/self-iterate.js" "$DEST/workflows/"
cp "$HERE/config.example.js" "$DEST/"
cp "$HERE/docs"/*.md "$DEST/docs/"
cp "$HERE/examples"/*.js "$DEST/examples/" 2>/dev/null || true
cp "$HERE/examples"/*.md "$DEST/examples/" 2>/dev/null || true

echo "✅ 已安装。接下来："
echo ""
echo "  1) 复制配置: cp $DEST/config.example.js $DEST/config.js   # 改 siteUrl/name"
echo "  2) 本地起 dev server（端口与 config.siteUrl 一致）"
echo "  3) 在 Claude Code 里说: 运行 self-iterate，对 localhost:3000 跑一轮巡检"
echo "     或: Workflow({ scriptPath: \"$DEST/workflows/self-iterate.js\", args: { maxBatches: 1 } })"
echo ""
echo "📖 文档: $DEST/docs/ · 场景模板: $DEST/examples/ (ecommerce / docs-site / saas)"
