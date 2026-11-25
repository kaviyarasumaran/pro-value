import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { DropdownMenu } from '@radix-ui/themes'
import { Building2, ChevronDown, GripVertical, MessageSquareText, User } from 'lucide-react'
import {
  STAGE_META,
  TICKET_STAGES,
  type Ticket,
  type TicketStage,
} from '../../types/ticket'
import { BasePaperBadge } from '../BasePaperBadge'
import { CategoryBadge } from '../CategoryBadge'

interface TicketCardProps {
  ticket: Ticket
  onOpenDetail: (ticket: Ticket) => void
  onChangeStatus: (ticketId: string, newStatus: TicketStage) => void
  isDragOverlay?: boolean
}

export function TicketCard({
  ticket,
  onOpenDetail,
  onChangeStatus,
  isDragOverlay = false,
}: TicketCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.ticket_id,
    data: { ticket },
    disabled: isDragOverlay,
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) {
          onOpenDetail(ticket)
        }
      }}
      className={`group cursor-pointer rounded-xl border bg-white p-3.5 transition-all select-none ${
        isDragOverlay
          ? 'rotate-1 border-indigo-400 shadow-xl ring-2 ring-indigo-500/20'
          : isDragging
            ? 'border-dashed border-indigo-300 opacity-40 shadow-none'
            : 'border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top row: Ticket ID + Drag indicator & Quick Status Menu */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-400" />
          <span className="font-mono text-xs font-semibold text-indigo-700">
            {ticket.ticket_id}
          </span>
        </div>

        <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button
                type="button"
                aria-label={`Change stage for ${ticket.ticket_id}`}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
              >
                Move
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="1" align="end">
              <DropdownMenu.Label>Move to stage</DropdownMenu.Label>
              {TICKET_STAGES.map((stage) => {
                const meta = STAGE_META[stage]
                const isCurrent = ticket.status === stage
                return (
                  <DropdownMenu.Item
                    key={stage}
                    disabled={isCurrent}
                    onSelect={() => onChangeStatus(ticket.ticket_id, stage)}
                  >
                    <span className={`inline-block h-2 w-2 rounded-full ${meta.dotColor}`} />
                    <span className={isCurrent ? 'font-semibold' : ''}>{stage}</span>
                  </DropdownMenu.Item>
                )
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Project Title */}
      <h4 className="mt-2 line-clamp-2 text-sm leading-snug font-semibold text-slate-900">
        {ticket.project_title}
      </h4>

      {/* Student & College */}
      <div className="mt-2 space-y-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate font-medium text-slate-700">{ticket.student_name}</span>
          <span className="text-slate-300">•</span>
          <span className="shrink-0 text-[11px] text-slate-500">{ticket.academic_year}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{ticket.college}</span>
        </div>
      </div>

      {/* Category Badges */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {ticket.categories.slice(0, 2).map((category) => (
          <CategoryBadge key={category} category={category} />
        ))}
        {ticket.categories.length > 2 && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            +{ticket.categories.length - 2}
          </span>
        )}
      </div>

      {/* Footer: Base Paper Indicator & Notes Count */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <BasePaperBadge status={ticket.base_paper_status} compact />
        {ticket.notes.length > 0 && (
          <span
            title={`${ticket.notes.length} mentor note(s)`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            {ticket.notes.length}
          </span>
        )}
      </div>
    </div>
  )
}
