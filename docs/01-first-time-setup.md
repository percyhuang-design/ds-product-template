# Day 0 — First-Time Setup

5 min to ready-to-code state。

## Prerequisites

- Node 22+(`node -v`)
- npm 10+(`npm -v`)
- Git
- Claude Code CLI installed(https://claude.com/code)

## Steps

```bash
# 1. Clone
git clone git@github.com:ajenchen/ds-product-template.git
cd ds-product-template

# 2. Install workspace deps(pulls @qijenchen/design-system@beta + storybook-config@beta)
npm install --legacy-peer-deps

# 3. Init Claude plugin canonical(symlinks .claude/design-system → DS canonical)
npx qijenchen-ds-init

# 4. Open in Claude Code
claude
# Claude session 自動偵測 .claude/design-system/ → load DS skills + hooks + rules + CLAUDE.md
```

## Verify

- `npm run create-app test-app` → `apps/test-app/` 生成
- `cd apps/test-app && npm run dev` → http://localhost:5173 開瀏覽器看到 "App Template" + Button render
- Claude session 打「/」→ 看到 DS skills 列出(`/design-system-audit`、`/component-quality-gate`、`/visual-audit`、`/prototype` 等)

## Next

→ `docs/02-create-new-product.md` 走第一個產品 onboarding flow
