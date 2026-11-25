import { Button, Select, Tabs } from '@radix-ui/themes'
import {
  Kanban,
  ListFilter,
  Loader2,
  RefreshCw,
  Search,
  Table2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  addMentorNote,
  fetchStats,
  fetchTickets,
  updateTicketStatus,
} from '../api/client'
import { useToast } from '../components/ToastContext'
import { KanbanBoard } from '../components/admin/KanbanBoard'
import { StatsHeader } from '../components/admin/StatsHeader'
import { TicketDetailDialog } from '../components/admin/TicketDetailDialog'
import { TicketTable } from '../components/admin/TicketTable'
import {
  ACADEMIC_YEARS,
  BASE_PAPER_STATUSES,
  PROJECT_CATEGORIES,
  type Ticket,
  type TicketStage,
  type TicketStats,
} from '../types/ticket'

export function AdminDashboardPage() {
  const { showToast } = useToast()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'kanban' | 'table'>('kanban')

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [paperFilter, setPaperFilter] = useState('ALL')

  // Detail modal
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const [ticketsData, statsData] = await Promise.all([
        fetchTickets({
          search: search || undefined,
          category: categoryFilter === 'ALL' ? undefined : categoryFilter,
          academic_year: yearFilter === 'ALL' ? undefined : yearFilter,
          base_paper_status: paperFilter === 'ALL' ? undefined : paperFilter,
        }),
        fetchStats(),
      ])
      setTickets(ticketsData)
      setStats(statsData)
    } catch (err) {
      showToast(
        'Failed to load dashboard',
        err instanceof Error ? err.message : 'Unable to reach FastAPI server.',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, yearFilter, paperFilter, showToast])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboard()
    }, 150)
    return () => clearTimeout(timer)
  }, [loadDashboard])

  const handleChangeStatus = async (ticketId: string, newStatus: TicketStage) => {
    const previousTickets = tickets
    const target = tickets.find((t) => t.ticket_id === ticketId)
    if (!target || target.status === newStatus) return

    // Optimistic UI update
    setTickets((prev) =>
      prev.map((t) => (t.ticket_id === ticketId ? { ...t, status: newStatus } : t)),
    )

    try {
      const updated = await updateTicketStatus(ticketId, newStatus)
      setTickets((prev) => prev.map((t) => (t.ticket_id === ticketId ? updated : t)))
      const latestStats = await fetchStats()
      setStats(latestStats)
      showToast(
        `${ticketId} moved to ${newStatus}`,
        `${updated.student_name}'s project stage updated.`,
        'success',
      )
    } catch (err) {
      setTickets(previousTickets)
      showToast(
        'Stage update failed',
        err instanceof Error ? err.message : 'Could not update ticket stage.',
        'error',
      )
    }
  }

  const handleAddNote = async (ticketId: string, content: string, author: string) => {
    try {
      const createdNote = await addMentorNote(ticketId, content, author)
      setTickets((prev) =>
        prev.map((t) =>
          t.ticket_id === ticketId ? { ...t, notes: [createdNote, ...t.notes] } : t,
        ),
      )
      showToast('Mentor note saved', `Added internal note to ${ticketId}.`, 'success')
    } catch (err) {
      showToast(
        'Could not save note',
        err instanceof Error ? err.message : 'Error saving mentor note.',
        'error',
      )
    }
  }

  const hasActiveFilters =
    Boolean(search.trim()) ||
    categoryFilter !== 'ALL' ||
    yearFilter !== 'ALL' ||
    paperFilter !== 'ALL'

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('ALL')
    setYearFilter('ALL')
    setPaperFilter('ALL')
  }

  const selectedTicket =
    tickets.find((t) => t.ticket_id === selectedTicketId) ?? null

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 px-4 py-6 sm:px-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Mentor Ticket Board & Operations
          </h1>
          <p className="text-xs text-slate-500">
            Drag cards across lifecycle stages, inspect requirements, and record internal mentor
            notes.
          </p>
        </div>

        <Button
          type="button"
          variant="soft"
          color="gray"
          size="2"
          onClick={() => void loadDashboard()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Summary Metrics */}
      <StatsHeader stats={stats} loading={loading} />

      {/* Search, Filters & View Switcher */}
      <Tabs.Root
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'kanban' | 'table')}
      >
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs xl:flex-row xl:items-center xl:justify-between">
          {/* Search + Dropdown Filters */}
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[230px] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Ticket ID, Student, Title, College..."
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-3 pl-9 text-xs text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ListFilter className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <Select.Root value={categoryFilter} onValueChange={setCategoryFilter} size="2">
              <Select.Trigger placeholder="Category" />
              <Select.Content>
                <Select.Item value="ALL">All Categories</Select.Item>
                {PROJECT_CATEGORIES.map((category) => (
                  <Select.Item key={category} value={category}>
                    {category}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root value={yearFilter} onValueChange={setYearFilter} size="2">
              <Select.Trigger placeholder="Academic Year" />
              <Select.Content>
                <Select.Item value="ALL">All Years</Select.Item>
                {ACADEMIC_YEARS.map((year) => (
                  <Select.Item key={year} value={year}>
                    {year}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root value={paperFilter} onValueChange={setPaperFilter} size="2">
              <Select.Trigger placeholder="Base Paper" />
              <Select.Content>
                <Select.Item value="ALL">All Base Paper States</Select.Item>
                {BASE_PAPER_STATUSES.map((status) => (
                  <Select.Item key={status} value={status}>
                    Paper: {status}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                color="gray"
                size="2"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>

          {/* Radix Tabs View Switcher */}
          <Tabs.List size="2" className="shrink-0">
            <Tabs.Trigger value="kanban">
              <Kanban className="mr-1.5 h-3.5 w-3.5" />
              Kanban Board
            </Tabs.Trigger>
            <Tabs.Trigger value="table">
              <Table2 className="mr-1.5 h-3.5 w-3.5" />
              List / Table View
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <div className="mt-4">
          <Tabs.Content value="kanban">
            <KanbanBoard
              tickets={tickets}
              onOpenDetail={(ticket) => setSelectedTicketId(ticket.ticket_id)}
              onChangeStatus={handleChangeStatus}
            />
          </Tabs.Content>

          <Tabs.Content value="table">
            <TicketTable
              tickets={tickets}
              onOpenDetail={(ticket) => setSelectedTicketId(ticket.ticket_id)}
              onChangeStatus={handleChangeStatus}
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      {/* Ticket Detail Modal */}
      <TicketDetailDialog
        ticket={selectedTicket}
        open={Boolean(selectedTicket)}
        onOpenChange={(open) => {
          if (!open) setSelectedTicketId(null)
        }}
        onChangeStatus={handleChangeStatus}
        onAddNote={handleAddNote}
      />
    </div>
  )
}
