# Product Workspace — Claude Code Instructions

This repo consumes `@qijenchen/design-system`. **All design governance lives in the DS plugin** — install via `/plugin marketplace add github:ajenchen/design-system` and inherit 31+ M-rules / 22+ skills / 38+ hooks automatically.

## Local-only rules(not in DS plugin)

### Consumer canonical(this repo specific)

1. **禁** import DS internals(`@qijenchen/design-system/src/...` or `/dist/...`)— 用 public surface only。Hook + `npm run lint:imports` 攔。
2. **禁** 修 `node_modules/@qijenchen/design-system/` — 有需求 file PR 回 DS repo,不在 product workspace fork。
3. 每新 app(`npm run create-app <name>`)務必走 _template/(已配 TooltipProvider + globals.css 標準 import)。
4. App-level CSS 只 extend / override,**不重寫** DS tokens(`--color-*` / `--space-*` 等)。

### Task navigation

| 任務 | Skill |
|------|-------|
| 建新 product UI / 開新 page | `/prototype` |
| 元件用法問題 | 看 DS Storybook https://ajenchen.github.io/design-system/ |
| App 完成要 ship | `/component-quality-gate` 走過 review |
| Bug fix | 查 DS spec + grep 本 repo apps/* 用法 |

## Stack

Vite + React 19 + TypeScript + Tailwind v4 + Storybook 9 + `@qijenchen/design-system@beta`.

## CI

- `audit.yml` — tsc + lint:imports + build per push/PR
- `deploy.yml` — per-app Netlify(需 set Netlify secrets)
