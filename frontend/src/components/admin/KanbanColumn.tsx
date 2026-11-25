import { useDroppable } from '@dnd-kit/core'
import { Badge } from '@radix-ui/themes'
import { STAGE_META, type Ticket, type TicketStage } from '../../types/ticket'
import { TicketCard } from './TicketCard'

interface KanbanColumnProps {
  stage: TicketStage
  tickets: Ticket[]
  onOpenDetail: (ticket: Ticket) => void
  onChangeStatus: (ticketId: string, newStatus: TicketStage) => void
}

export function KanbanColumn({
  stage,
  tickets,
  onOpenDetail,
  onChangeStatus,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const meta = STAGE_META[stage]

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-h-[540px] w-[305px] shrink-0 flex-col rounded-xl border transition-colors ${
        isOver
          ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/15'
          : 'border-slate-200/90 bg-slate-100/70'
      }`}
    >
      {/* Color-coded stage header using Radix UI color scales */}
      <div
        className={`flex items-center justify-between rounded-t-xl border-b px-3.5 py-2.5 ${meta.headerBg} ${meta.headerBorder}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotColor}`} />
          <h3 className="truncate text-xs font-semibold tracking-wide text-slate-900 uppercase">
            {meta.label}
          </h3>
        </div>
        <Badge color={meta.radixColor} variant="solid" radius="full" size="1">
          {tickets.length}
        </Badge>
      </div>

      {/* Column Cards */}
      <div className="kanban-scroll flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
        {tickets.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300/80 p-4 text-center">
            <p className="text-xs text-slate-400">Drop ticket here</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.ticket_id}
              ticket={ticket}
              onOpenDetail={onOpenDetail}
              onChangeStatus={onChangeStatus}
            />
          ))
        )}
      </div>
    </div>
  )
}
