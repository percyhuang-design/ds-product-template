# Product Workspace

Monorepo for product team apps consuming [`@qijenchen/design-system`](https://github.com/ajenchen/design-system).

## Status

- **2026-05-25** scaffold landed (Phase 5 deliverable per `design-system/.claude/planning/team-distribution-roadmap.md`)
- Active apps: `apps/_template/`(canary)
- Add a new app: `npm run create-app <kebab-case-name>`

## Quick start(Day 0)

```bash
# 1. clone
git clone git@github.com:ajenchen/product-workspace.git
cd product-workspace

# 2. install workspace deps(pulls @qijenchen/design-system@beta + storybook-config)
npm install

# 3. spawn a new app
npm run create-app order-dashboard
cd apps/order-dashboard
npm run dev
```

## Layout

```
product-workspace/
├── apps/                       ← Product apps (each is independent Vite + React)
│   └── _template/              ← Copy this via `npm run create-app <name>`
│       ├── src/
│       │   ├── main.tsx        ← React root + TooltipProvider
│       │   ├── App.tsx         ← Replace with your product UI
│       │   └── globals.css     ← @import tailwindcss + DS tokens
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/                   ← Cross-app shared utilities (if any)
├── scripts/
│   ├── create-app.mjs          ← `npm run create-app <name>` generator
│   └── lint-ds-internal-imports.mjs  ← Guard against importing DS internals
├── .claude/
│   └── settings.json           ← Claude Code config (plugin marketplace flow)
├── .storybook/                 ← Shared Storybook config (imports @qijenchen/storybook-config)
├── .github/
│   ├── CODEOWNERS              ← Code review routing
│   └── workflows/
│       ├── audit.yml           ← tsc + lint + build per push/PR
│       └── deploy.yml          ← Per-app Netlify deploy
├── package.json                ← workspaces + DS deps
├── tsconfig.json               ← Base TS config (apps extend)
└── README.md                   ← You are here
```

## Claude Code plugin setup(first time)

```
/plugin marketplace add github:ajenchen/design-system
/plugin install design-system@qijenchen-ds
```

Then plugin auto-enables (`.claude/settings.json` `defaultMode: "auto"`). You get:
- 22+ skills (`/component-quality-gate`, `/visual-audit`, etc.)
- 38+ hooks (auto-fire pre/post tool events)
- 31 active M-rules (CLAUDE.md instructions inherit on every session)

## Important rules(read CLAUDE.md from `design-system` repo via plugin)

- **Never modify** `node_modules/@qijenchen/design-system/`(install another copy if you need experimental changes — file PR to DS repo instead)
- Import only from public surface: `@qijenchen/design-system` top barrel,`@qijenchen/design-system/styles/tokens`,`@qijenchen/design-system/hooks/<name>`
- Run `npm run lint:imports` before commit to catch internal-path leaks

## CI secrets needed

See `docs/01-first-time-setup.md`(Phase 6 onboarding doc — write me next).

## License

UNLICENSED — internal use only.
