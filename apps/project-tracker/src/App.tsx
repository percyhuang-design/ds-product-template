// project-tracker — Jira 風格專案管理工具 prototype
//
// @story-baseline: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#IconCollapse
//
// 對齊 DS canonical:AppShell `primary-sidebar` + Sidebar(collapsible="icon")+ chrome PageHeader
// (SidebarTrigger / ⌘B)。真實業務情境 = 軟體團隊 Sprint 看板(對齊 mindset #4「範例必真實
// 業務場景:Jira」)。
//
// SSOT 鐵律:
//   - 只 import `@qijenchen/design-system` public exports(Avatar / Badge / Tag / Button / Sidebar …)
//   - 禁修改 DS source、禁自寫 widget bypass DS primitive
//   - 卡片 / 看板 lane 用 DS semantic tokens(--surface / --divider / --secondary …)compose,不重寫 token

import { useMemo, useState } from 'react'
import {
  AppShell,
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarTrigger,
  TooltipProvider,
  Avatar,
  ItemAvatar,
  NameCard,
  Badge,
  Tag,
  Button,
  Input,
  Separator,
  ChipGroup,
  Chip,
} from '@qijenchen/design-system'
import {
  LayoutDashboard,
  ListTodo,
  Kanban,
  CalendarRange,
  CircleDot,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Bookmark,
  SquareCheck,
  Bug,
  Zap,
  ChevronsUp,
  ChevronUp,
  Equal,
  ChevronDown,
  ChevronsDown,
  type LucideIcon,
} from 'lucide-react'

// ──────────────────────────────────────────────────────────────────────────
// Domain model — 「Orbit」mobile app project / Sprint 24
// ──────────────────────────────────────────────────────────────────────────

type AvatarColor =
  | 'neutral' | 'blue' | 'red' | 'green' | 'yellow'
  | 'turquoise' | 'purple' | 'magenta' | 'indigo'

type IssueType = 'story' | 'task' | 'bug' | 'epic'
type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest'
type ColumnId = 'todo' | 'inprogress' | 'inreview' | 'done'

interface Person {
  name: string
  subtitle: string
  color: AvatarColor
}

interface Label {
  text: string
  color: AvatarColor
}

interface Issue {
  key: string
  title: string
  type: IssueType
  priority: Priority
  points: number
  labels: Label[]
  assignee: Person
  column: ColumnId
}

// Issue-type 視覺 canonical(對齊 Jira:Story=綠書籤 / Task=藍勾 / Bug=紅蟲 / Epic=紫閃電)
const TYPE_META: Record<IssueType, { icon: LucideIcon; color: string; label: string }> = {
  story: { icon: Bookmark, color: 'var(--success)', label: 'Story' },
  task: { icon: SquareCheck, color: 'var(--info)', label: 'Task' },
  bug: { icon: Bug, color: 'var(--error)', label: 'Bug' },
  epic: { icon: Zap, color: 'var(--purple-active)', label: 'Epic' },
}

// Priority 視覺 canonical(對齊 Jira:箭頭方向 = 緊急度,色階 red→neutral)
const PRIORITY_META: Record<Priority, { icon: LucideIcon; color: string; label: string }> = {
  highest: { icon: ChevronsUp, color: 'var(--error)', label: 'Highest' },
  high: { icon: ChevronUp, color: 'var(--deep-orange-active)', label: 'High' },
  medium: { icon: Equal, color: 'var(--amber-active)', label: 'Medium' },
  low: { icon: ChevronDown, color: 'var(--info)', label: 'Low' },
  lowest: { icon: ChevronsDown, color: 'var(--fg-muted)', label: 'Lowest' },
}

const PEOPLE: Record<string, Person> = {
  mara: { name: 'Mara Lindqvist', subtitle: 'iOS Engineer', color: 'magenta' },
  devon: { name: 'Devon Carter', subtitle: 'Backend Engineer', color: 'blue' },
  yuki: { name: 'Yuki Tanaka', subtitle: 'Product Designer', color: 'purple' },
  priya: { name: 'Priya Nair', subtitle: 'QA Engineer', color: 'green' },
  sam: { name: 'Sam Okonkwo', subtitle: 'Tech Lead', color: 'indigo' },
}

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'inreview', title: 'In Review' },
  { id: 'done', title: 'Done' },
]

const ISSUES: Issue[] = [
  {
    key: 'ORB-142', type: 'story', priority: 'high', points: 5, column: 'todo',
    title: 'Onboarding carousel for first-time sign-in',
    labels: [{ text: 'mobile', color: 'blue' }, { text: 'growth', color: 'turquoise' }],
    assignee: PEOPLE.yuki,
  },
  {
    key: 'ORB-150', type: 'task', priority: 'medium', points: 3, column: 'todo',
    title: 'Migrate analytics SDK to v4 batching API',
    labels: [{ text: 'tech-debt', color: 'neutral' }],
    assignee: PEOPLE.devon,
  },
  {
    key: 'ORB-158', type: 'bug', priority: 'highest', points: 2, column: 'todo',
    title: 'Push token not refreshed after re-login on iOS 18',
    labels: [{ text: 'ios', color: 'indigo' }, { text: 'regression', color: 'red' }],
    assignee: PEOPLE.mara,
  },
  {
    key: 'ORB-128', type: 'story', priority: 'high', points: 8, column: 'inprogress',
    title: 'Offline draft sync for trip itineraries',
    labels: [{ text: 'mobile', color: 'blue' }, { text: 'sync', color: 'purple' }],
    assignee: PEOPLE.mara,
  },
  {
    key: 'ORB-133', type: 'task', priority: 'medium', points: 3, column: 'inprogress',
    title: 'Add rate-limiting to public search endpoint',
    labels: [{ text: 'backend', color: 'green' }],
    assignee: PEOPLE.devon,
  },
  {
    key: 'ORB-119', type: 'bug', priority: 'high', points: 2, column: 'inreview',
    title: 'Map pin clustering flickers when zooming quickly',
    labels: [{ text: 'maps', color: 'turquoise' }],
    assignee: PEOPLE.sam,
  },
  {
    key: 'ORB-121', type: 'story', priority: 'low', points: 5, column: 'inreview',
    title: 'Dark-mode polish for settings & profile screens',
    labels: [{ text: 'design', color: 'magenta' }, { text: 'mobile', color: 'blue' }],
    assignee: PEOPLE.yuki,
  },
  {
    key: 'ORB-104', type: 'task', priority: 'lowest', points: 1, column: 'done',
    title: 'Bump CI runners to Node 22 LTS',
    labels: [{ text: 'infra', color: 'neutral' }],
    assignee: PEOPLE.sam,
  },
  {
    key: 'ORB-110', type: 'story', priority: 'medium', points: 5, column: 'done',
    title: 'Saved-places quick filter on the home map',
    labels: [{ text: 'maps', color: 'turquoise' }, { text: 'mobile', color: 'blue' }],
    assignee: PEOPLE.priya,
  },
]

// ── Sidebar 導覽(planning + tracking groups,對齊 Jira software project nav)──
interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  count?: number
}

const PLANNING_NAV: NavItem[] = [
  { id: 'roadmap', label: 'Roadmap', icon: LayoutDashboard },
  { id: 'backlog', label: 'Backlog', icon: ListTodo, count: 24 },
  { id: 'board', label: 'Board', icon: Kanban, count: ISSUES.length },
  { id: 'sprints', label: 'Sprints', icon: CalendarRange },
]

const TRACKING_NAV: NavItem[] = [
  { id: 'issues', label: 'Issues', icon: CircleDot },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function ProjectSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Chrome header:entity avatar 用 raw <Avatar square>,非 row context(per header-canonical.spec.md)*/}
        <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
          <Avatar alt="Orbit" size={24} shape="square" color="indigo" solid />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="text-body font-medium truncate leading-tight">Orbit</div>
            <div className="text-footnote text-fg-secondary truncate">Software project</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Planning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PLANNING_NAV.map(({ id, label, icon, count }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton id={id} startIcon={icon} tooltip={label}>
                    {label}
                  </SidebarMenuButton>
                  {count != null && <SidebarMenuBadge count={count} />}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tracking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TRACKING_NAV.map(({ id, label, icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton id={id} startIcon={icon} tooltip={label}>
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* UserFooter canonical:asChild + role="group" + data-sidebar="menu-label"(per sidebar.stories.tsx)*/}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div role="group" aria-label="目前使用者">
                <ItemAvatar alt="Sam Okonkwo" color="indigo" />
                <span data-sidebar="menu-label" className="min-w-0 flex-1 truncate">Sam Okonkwo</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// ── PageHeader(chrome header:SidebarTrigger + 標題 + 團隊頭像堆疊 + Create)──
function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center gap-3 h-[var(--chrome-header-height)] px-[var(--layout-space-loose)] bg-surface border-b border-divider">
      <SidebarTrigger />
      <div className="min-w-0 flex-1">
        <div className="text-footnote text-fg-secondary leading-tight">Orbit / Sprint 24</div>
        <h1 className="text-body-lg font-medium truncate leading-tight">{title}</h1>
      </div>
      <AvatarStack people={Object.values(PEOPLE)} />
      <Separator orientation="vertical" className="h-6" />
      <Button variant="primary" size="md" startIcon={Plus}>Create</Button>
    </header>
  )
}

// 團隊頭像堆疊(對齊 Jira facepile,hover 出 NameCard)
function AvatarStack({ people }: { people: Person[] }) {
  return (
    <div className="flex items-center -space-x-1.5">
      {people.map((p) => (
        <Avatar
          key={p.name}
          alt={p.name}
          size={24}
          color={p.color}
          className="ring-2 ring-surface rounded-full"
          hoverCard={<NameCard name={p.name} subtitle={p.subtitle} avatar={{ alt: p.name, color: p.color }} />}
        />
      ))}
    </div>
  )
}

// ── Board toolbar(search + quick filters)──
function BoardToolbar() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Input startIcon={Search} placeholder="Search board" className="w-60" aria-label="Search board" />
      <ChipGroup type="multiple" aria-label="快速篩選">
        <Chip value="mine" startIcon={Filter}>Only my issues</Chip>
        <Chip value="bugs" startIcon={Bug}>Bugs</Chip>
        <Chip value="recent">Recently updated</Chip>
      </ChipGroup>
    </div>
  )
}

// ── Issue card(無 DS Card primitive → 用 semantic tokens compose,非自寫 widget)──
function IssueCard({ issue }: { issue: Issue }) {
  const type = TYPE_META[issue.type]
  const priority = PRIORITY_META[issue.priority]
  const TypeIcon = type.icon
  const PriorityIcon = priority.icon
  return (
    <article className="rounded-md border border-divider bg-surface p-3 shadow-xs transition-colors hover:border-border-hover cursor-pointer">
      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {issue.labels.map((l) => (
            <Tag key={l.text} size="sm" color={l.color}>{l.text}</Tag>
          ))}
        </div>
      )}
      <p className="text-body text-foreground mb-3 line-clamp-2">{issue.title}</p>
      <div className="flex items-center gap-2">
        <TypeIcon size={16} style={{ color: type.color }} aria-label={type.label} />
        <span className="text-caption text-fg-secondary font-medium">{issue.key}</span>
        <PriorityIcon size={16} style={{ color: priority.color }} aria-label={`${priority.label} priority`} />
        <span className="flex-1" />
        <span
          className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-secondary text-footnote text-fg-secondary font-medium"
          title={`${issue.points} story points`}
        >
          {issue.points}
        </span>
        <Avatar
          alt={issue.assignee.name}
          size={24}
          color={issue.assignee.color}
          hoverCard={
            <NameCard
              name={issue.assignee.name}
              subtitle={issue.assignee.subtitle}
              avatar={{ alt: issue.assignee.name, color: issue.assignee.color }}
            />
          }
        />
      </div>
    </article>
  )
}

// ── Board column(lane:bg-secondary + sticky header + count Badge + add issue)──
function BoardColumn({ title, issues }: { title: string; issues: Issue[] }) {
  return (
    <section className="flex w-72 shrink-0 flex-col rounded-lg bg-secondary">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <h2 className="text-caption font-semibold uppercase tracking-wide text-fg-secondary">{title}</h2>
        <Badge count={issues.length} />
      </div>
      <div className="flex flex-col gap-2 px-2 pb-2 overflow-y-auto">
        {issues.map((issue) => (
          <IssueCard key={issue.key} issue={issue} />
        ))}
        <Button variant="text" size="sm" startIcon={Plus} fullWidth className="justify-start text-fg-secondary">
          Add issue
        </Button>
      </div>
    </section>
  )
}

function BoardPage() {
  const grouped = useMemo(() => {
    const map: Record<ColumnId, Issue[]> = { todo: [], inprogress: [], inreview: [], done: [] }
    for (const issue of ISSUES) map[issue.column].push(issue)
    return map
  }, [])

  return (
    <div className="flex h-full flex-col gap-4 px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]">
      <BoardToolbar />
      <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <BoardColumn key={col.id} title={col.title} issues={grouped[col.id]} />
        ))}
      </div>
    </div>
  )
}

const ALL_NAV = [...PLANNING_NAV, ...TRACKING_NAV]

export default function App() {
  const [activeId, setActiveId] = useState<string>('board')
  const current = ALL_NAV.find((n) => n.id === activeId) ?? PLANNING_NAV[2]
  const title = current.id === 'board' ? 'Sprint 24 board' : current.label
  // TooltipProvider self-wrap(Storybook story render 跳過 main.tsx → App 必自帶 context)
  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <SidebarProvider activeId={activeId} onActiveChange={setActiveId}>
        <AppShell
          layout="primary-sidebar"
          sidebar={<ProjectSidebar />}
          header={<PageHeader title={title} />}
        >
          <BoardPage />
        </AppShell>
      </SidebarProvider>
    </TooltipProvider>
  )
}
