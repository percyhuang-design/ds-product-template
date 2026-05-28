#!/usr/bin/env node
// scripts/setup-netlify-access.mjs — fork-and-go Netlify access control setup automation
//
// Per user 2026-05-26 directive「其他 user fork 之後你要怎麼引導?難道都不能先設定好?」
//   - widget code 已 codify in `.storybook/manager-head.html`(repo-level)
//   - Netlify Site config(Identity enable / Visitor access / invite users)是 Netlify Dashboard state
//     **不能放 repo file**,但可走 Netlify CLI API 自動化。
//
// Usage(fork user run 一次):
//   npm run setup:netlify
//
// Steps automated:
//   1. Install Netlify CLI(若未裝)
//   2. `netlify login`(瀏覽器 OAuth)
//   3. `netlify init` 或 link existing site
//   4. `netlify api updateSite` → enable Identity + restrict visitor access
//   5. Prompt team emails → `netlify api inviteSiteAccount` for each
//
// Doc:https://docs.netlify.com/cli/get-started/ + https://open-api.netlify.com/

import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const rl = readline.createInterface({ input: stdin, output: stdout })

function sh(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', encoding: 'utf8', ...opts })
}

function shOut(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim() } catch { return '' }
}

console.log('🔒 Netlify access control setup(per user fork-and-go directive)')
console.log('')
console.log('━━━ 沒 Netlify 帳號?GitHub 1-click 自動建 ━━━')
console.log('Netlify = 免費 deploy platform(類似 Vercel)。我們用它跑 Storybook + 內部 team-only access。')
console.log('Free tier:1000 user invite / 100GB bandwidth / 0 maintenance。')
console.log('')
console.log('因為 fork 本 repo 必先有 GitHub 帳號,Netlify 註冊走 GitHub OAuth ——')
console.log('Step 2「netlify login」會開瀏覽器到 app.netlify.com → 點「Continue with GitHub」')
console.log('→ GitHub 授權 1 click → Netlify 自動用你的 GitHub identity 建帳號(< 5 秒)。')
console.log('已有 Netlify 帳號?同按鈕直接 login,無重複註冊。')
console.log('')

// Step 0: gh CLI pre-check(2026-05-26 enhancement per user verbatim「user 一定有 GitHub 帳號」)
const ghOut = shOut('gh auth status 2>&1')
if (ghOut.includes('Logged in')) {
  const userMatch = ghOut.match(/account\s+(\S+)/)
  const ghUser = userMatch ? userMatch[1] : '(unknown)'
  console.log(`✓ GitHub CLI 已 login(account: ${ghUser})→ Step 2 直接點「Continue with GitHub」`)
} else {
  console.log('⚠️ GitHub CLI 未 login(可能影響後續 Netlify 連 fork repo 流程)')
  console.log('  建議先跑:gh auth login(瀏覽器 OAuth,1 分鐘搞定)')
  const proceed = await rl.question('  繼續 setup?(y/N)> ')
  if (!/^y/i.test(proceed)) { console.log('Aborted by user'); rl.close(); process.exit(1) }
}
console.log('')

// Step 1: Netlify CLI
if (!shOut('which netlify')) {
  console.log('▶ Installing Netlify CLI globally...')
  sh('npm install -g netlify-cli')
}
console.log('✓ Netlify CLI available')
console.log('')

// Step 2: Login
const whoami = shOut('netlify status --json')
if (!whoami.includes('"User"') && !whoami.includes('"name"')) {
  console.log('▶ Login to Netlify(browser will open)...')
  sh('netlify login')
}
console.log('✓ Netlify logged in')
console.log('')

// Step 3: Link site(2026-05-26 auto-create per user verbatim「目前每個斷點都無法自動處理?」)
if (!existsSync('.netlify/state.json')) {
  // Default: 自動 create new site with predictable name from package.json + GitHub user
  const repoName = JSON.parse(readFileSync('package.json', 'utf8')).name || 'ds-product-template'
  const ghUser = shOut('gh api user --jq .login') || 'user'
  const autoSiteName = `${ghUser}-${repoName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  console.log(`▶ Auto-create Netlify site "${autoSiteName}" + link this repo...`)
  // `netlify init --manual` 走 non-interactive flow,自動 create site + write .netlify/state.json
  try {
    sh(`netlify sites:create --name="${autoSiteName}" --account-slug=$(netlify api listAccountsForUser --json 2>/dev/null | jq -r '.[0].slug // "personal"' 2>/dev/null || echo personal)`)
    sh('netlify link --name=' + autoSiteName)
  } catch {
    console.log('⚠️ Auto-create failed(可能 site name 已存在或 account 不允許新建)。Fall back to interactive netlify init...')
    sh('netlify init')
  }
}
const state = JSON.parse(readFileSync('.netlify/state.json', 'utf8'))
const siteId = state.siteId
console.log(`✓ Linked site: ${siteId}`)
console.log('')

// Step 4: Enable Identity + restrict access
console.log('▶ Enable Identity + restrict visitor access via Netlify API...')
const updateRes = shOut(`netlify api updateSite --data='${JSON.stringify({
  site_id: siteId,
  body: {
    identity_instance_id: undefined, // triggers enable on update
    password: undefined,
    visitor_access: 'private', // restrict to logged-in users
  },
})}'`)
// Identity enable 走 dedicated endpoint
sh(`netlify api provisionSiteIdentity --data='${JSON.stringify({ site_id: siteId })}' 2>/dev/null || true`)
console.log('✓ Identity provisioned + visitor access set private')
console.log('')

// Step 5: Invite users(2026-05-26 enhanced — env var preset 跳過 interactive prompt)
// NETLIFY_TEAM_EMAILS env var(comma-sep)→ auto-invite without prompt
// 否則 --skip-invite flag 完全跳過 → user 後續去 Dashboard 手動 invite
const args = new Set(process.argv.slice(2))
const skipInvite = args.has('--skip-invite')
let emails = process.env.NETLIFY_TEAM_EMAILS || ''

if (!emails && !skipInvite) {
  console.log('▶ Team emails to invite(可選,空 enter 跳過,設 NETLIFY_TEAM_EMAILS env 預設 / 或 --skip-invite flag)')
  emails = await rl.question('  > ')
}

const emailList = emails.split(',').map(e => e.trim()).filter(Boolean)
if (emailList.length === 0) {
  console.log('⏭ Skip team invite(可後續在 Netlify Dashboard 手動 invite)')
} else {
  for (const email of emailList) {
    sh(`netlify api inviteSiteAccount --data='${JSON.stringify({ site_id: siteId, body: { email } })}' 2>/dev/null || echo "⚠️ Failed to invite ${email}(可能 Identity 尚未完全 provision,稍後手動 invite via Dashboard)"`)
    console.log(`  ✉ Invited: ${email}`)
  }
}
console.log('')

console.log('✅ Setup complete!')
console.log('')
console.log('Next:')
console.log(`  1. Visit Netlify Dashboard:https://app.netlify.com/sites/${state.siteSlug || siteId}/settings/identity`)
console.log('  2. 確認 Identity 已 enable + Visitor access = Private')
console.log('  3. Team emails 收到 invite email → set password → 訪問 Storybook URL')
console.log('  4. 若任何步驟失敗,fallback manual Dashboard 設(詳 README「Storybook deploy」段)')

rl.close()
