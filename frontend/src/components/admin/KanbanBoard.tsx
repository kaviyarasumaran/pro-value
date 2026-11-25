import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { TICKET_STAGES, type Ticket, type TicketStage } from '../../types/ticket'
import { KanbanColumn } from './KanbanColumn'
import { TicketCard } from './TicketCard'

interface KanbanBoardProps {
  tickets: Ticket[]
  onOpenDetail: (ticket: Ticket) => void
  onChangeStatus: (ticketId: string, newStatus: TicketStage) => void
}

export function KanbanBoard({
  tickets,
  onOpenDetail,
  onChangeStatus,
}: KanbanBoardProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const dragged = event.active.data.current?.ticket as Ticket | undefined
    if (dragged) {
      setActiveTicket(dragged)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTicket(null)

    if (!over) return

    const ticketId = String(active.id)
    const targetStage = String(over.id) as TicketStage
    const draggedTicket = tickets.find((t) => t.ticket_id === ticketId)

    if (
      draggedTicket &&
      TICKET_STAGES.includes(targetStage) &&
      draggedTicket.status !== targetStage
    ) {
      onChangeStatus(ticketId, targetStage)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTicket(null)}
    >
      <div className="kanban-scroll flex gap-3.5 overflow-x-auto pb-4">
        {TICKET_STAGES.map((stage) => {
          const columnTickets = tickets.filter((t) => t.status === stage)
          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              tickets={columnTickets}
              onOpenDetail={onOpenDetail}
              onChangeStatus={onChangeStatus}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTicket ? (
          <div className="w-[290px]">
            <TicketCard
              ticket={activeTicket}
              onOpenDetail={() => {}}
              onChangeStatus={() => {}}
              isDragOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
