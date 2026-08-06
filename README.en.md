<div align="center">

# ♾️ claude-self-iterate

### Let Claude optimize your website — like a 15-person product team that audits, reviews, and refactors it every day, until there's nothing left to fix. It stops on its own.

[![Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/duola15/claude-self-iterate/ci.yml?label=CI)](https://github.com/duola15/claude-self-iterate/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub stars](https://img.shields.io/github/stars/duola15/claude-self-iterate?style=social)](https://github.com/duola15/claude-self-iterate/stargazers)

> 🇨🇳 中文版见 [README.md](README.md)

</div>

**A multi-role, self-iterating optimization workflow.** 15+ reviewer roles actually visit every page of your website (new user / power user / data auditor / compliance / performance / visual design / accessibility / SEO / conversion / security / content...), find real pain points with evidence chains, pass a three-gate review, apply minimal fixes, then **self-improve its own workflow** — until the whole matrix is done and it stops.

## 🚀 Quick Start

```bash
git clone https://github.com/duola15/claude-self-iterate && cd claude-self-iterate
bash install.sh                # Windows: use Git Bash or WSL

# Reference config.example.js; pass config via Workflow args (engine reads args, not a config.js file):
Workflow({
  scriptPath: "workflows/self-iterate.js",
  args: { siteUrl: "http://localhost:3000", maxBatches: 1,   // maxBatches: optional, run 1 batch first
          config: { name: "My Site", roles: [...], pageCore: [...] } },
})
```

Run your own website on `localhost:3000` first (the workflow's agents crawl it for real).

## ⚙️ How It Works (5 phases)

```
① Inspect   15+ roles × page matrix → each role really crawls pages, finds pain with evidence, scores 10 dims
② 3-Gate     Constitution gate (extreme words / disclaimers / DB files) → scoring gate (veto) → adversarial review
③ Implement Passed → locate source → minimal fix → scope-creep detection
④ Self-improve Executor scores → Analyst diagnoses → Mutator proposes one fix (next run applies)
⑤ Build      Local build 0 errors (no deploy, no CI cost) → auto-stop when matrix done
```

**Safe by default**: no deploy, no push, no touching database files (unless you opt in). The implement list is given to you for confirmation.

## ✨ Features

- **Multi-role real crawling** — not "AI guessing", 15+ roles actually open pages and capture evidence
- **Self-improvement loop** — Executor/Analyst/Mutator refine the workflow every run
- **3-gate anti-self-congratulation** — hard constitution gates + adversarial review
- **ToolKit** — injects codebase-memory / chrome-devtools / puppeteer / karpathy / systematic-debugging / verification per stage
- **Config-driven** — roles/pages/dims/constitution all configurable; scene templates (e-commerce / docs / SaaS / GitHub repo)

## 📦 Scenes

| Template | For | Use |
|---|---|---|
| 🛒 [ecommerce.js](examples/ecommerce.js) | E-commerce (conversion/price/cart) | `args.config` or copy structure |
| 📚 [docs-site.js](examples/docs-site.js) | Docs site (new user/search/readability) | `args.config` |
| 💼 [saas.js](examples/saas.js) | SaaS (signup/pricing/retention) | `args.config` |
| 🐙 [github-repo.js](examples/github-repo.js) | **GitHub open-source repo (25 people-roles)** | `args.config` |

## 📄 License

[Apache-2.0](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) to add roles / improve the engine.

---

**⭐ Star this repo** if it saves you dozens of manual audits.
