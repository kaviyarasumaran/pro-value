import { DropdownMenu } from '@radix-ui/themes'
import { ChevronDown, ExternalLink, MessageSquareText } from 'lucide-react'
import {
  STAGE_META,
  TICKET_STAGES,
  type Ticket,
  type TicketStage,
} from '../../types/ticket'
import { BasePaperBadge } from '../BasePaperBadge'
import { CategoryBadge } from '../CategoryBadge'
import { StageBadge } from '../StageBadge'

interface TicketTableProps {
  tickets: Ticket[]
  onOpenDetail: (ticket: Ticket) => void
  onChangeStatus: (ticketId: string, newStatus: TicketStage) => void
}

export function TicketTable({
  tickets,
  onOpenDetail,
  onChangeStatus,
}: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
        <p className="text-sm font-medium text-slate-700">No matching tickets found</p>
        <p className="mt-1 text-xs text-slate-500">
          Try clearing one or more filters or adjusting your search query.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Project & Student</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Year / Team</th>
              <th className="px-4 py-3">Base Paper</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.ticket_id}
                onClick={() => onOpenDetail(ticket)}
                className="cursor-pointer transition-colors hover:bg-slate-50/90"
              >
                <td className="px-4 py-3.5 align-top">
                  <span className="font-mono text-xs font-semibold text-indigo-700">
                    {ticket.ticket_id}
                  </span>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="max-w-[300px] px-4 py-3.5 align-top">
                  <div className="font-semibold text-slate-900">{ticket.project_title}</div>
                  <div className="mt-0.5 text-xs text-slate-600">
                    {ticket.student_name} · {ticket.college} ({ticket.department})
                  </div>
                </td>
                <td className="max-w-[220px] px-4 py-3.5 align-top">
                  <div className="flex flex-wrap gap-1">
                    {ticket.categories.map((cat) => (
                      <CategoryBadge key={cat} category={cat} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 align-top text-xs text-slate-600">
                  <div className="font-medium text-slate-800">{ticket.academic_year}</div>
                  <div className="mt-0.5 text-slate-500">{ticket.team_size}</div>
                </td>
                <td className="px-4 py-3.5 align-top">
                  <BasePaperBadge status={ticket.base_paper_status} compact />
                </td>
                <td className="px-4 py-3.5 align-top" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full transition-opacity hover:opacity-85"
                      >
                        <StageBadge stage={ticket.status} size="2" />
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content size="1">
                      {TICKET_STAGES.map((stage) => {
                        const meta = STAGE_META[stage]
                        return (
                          <DropdownMenu.Item
                            key={stage}
                            disabled={ticket.status === stage}
                            onSelect={() => onChangeStatus(ticket.ticket_id, stage)}
                          >
                            <span className={`inline-block h-2 w-2 rounded-full ${meta.dotColor}`} />
                            {stage}
                          </DropdownMenu.Item>
                        )
                      })}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </td>
                <td className="px-4 py-3.5 text-right align-top">
                  <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                    {ticket.notes.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                        <MessageSquareText className="h-3 w-3" />
                        {ticket.notes.length}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenDetail(ticket)
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
