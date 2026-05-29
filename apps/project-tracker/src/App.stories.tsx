// project-tracker — Jira 風格 Sprint 看板 product demo
// 真實業務情境(對齊 mindset #4):軟體團隊的 Sprint board,PM / designer / QA 看業務流程。

import type { Meta, StoryObj } from '@storybook/react'
import App from './App'

const meta: Meta<typeof App> = {
  title: 'Apps/project-tracker/Sprint Board',
  component: App,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Jira 風格專案管理工具 prototype — DS canonical `AppShell + Sidebar + PageHeader` 上 compose 出 Sprint 看板。\n\n' +
          '展示的 product pattern:\n' +
          '- **Sidebar**:project brand + Planning / Tracking 分組導覽 + 未處理數 `SidebarMenuBadge`\n' +
          '- **Chrome header**:`SidebarTrigger`(⌘B)+ 麵包屑標題 + 團隊頭像堆疊(hover 出 `NameCard`)+ `Create`\n' +
          '- **看板**:4 個 status lane(To Do / In Progress / In Review / Done),lane header 帶 `Badge` 計數\n' +
          '- **Issue 卡片**:label `Tag` + 標題 + issue type / priority icon + story points + assignee `Avatar`\n\n' +
          'SSOT 鐵律:只 import `@qijenchen/design-system` exports,卡片 / lane 用 DS semantic tokens compose,**禁修改 DS source、禁自寫 widget**。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof App>

export const Default: Story = {
  name: 'Sprint 24 看板',
}
