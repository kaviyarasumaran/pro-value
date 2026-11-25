import { Badge, Button, Dialog, Select } from '@radix-ui/themes'
import {
  Building2,
  Calendar,
  GraduationCap,
  Link2,
  Loader2,
  Mail,
  MessageSquarePlus,
  Phone,
  Users,
  X,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import {
  STAGE_META,
  TICKET_STAGES,
  type Ticket,
  type TicketStage,
} from '../../types/ticket'
import { BasePaperBadge } from '../BasePaperBadge'
import { CategoryBadge } from '../CategoryBadge'
import { StageBadge } from '../StageBadge'

interface TicketDetailDialogProps {
  ticket: Ticket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChangeStatus: (ticketId: string, newStatus: TicketStage) => Promise<void> | void
  onAddNote: (ticketId: string, content: string, author: string) => Promise<void>
}

export function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
  onChangeStatus,
  onAddNote,
}: TicketDetailDialogProps) {
  const [noteContent, setNoteContent] = useState('')
  const [noteAuthor, setNoteAuthor] = useState('Mentor')
  const [submittingNote, setSubmittingNote] = useState(false)

  if (!ticket) return null

  const handleSubmitNote = async (event: FormEvent) => {
    event.preventDefault()
    if (!noteContent.trim()) return
    setSubmittingNote(true)
    try {
      await onAddNote(ticket.ticket_id, noteContent.trim(), noteAuthor.trim() || 'Mentor')
      setNoteContent('')
    } finally {
      setSubmittingNote(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="760px"
        className="max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700">
                {ticket.ticket_id}
              </span>
              <StageBadge stage={ticket.status} size="2" />
              <BasePaperBadge status={ticket.base_paper_status} />
            </div>
            <Dialog.Title className="mt-2 text-lg font-semibold text-slate-900">
              {ticket.project_title}
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Submitted {new Date(ticket.created_at).toLocaleString()}
              </span>
              <span>•</span>
              <span>Updated {new Date(ticket.updated_at).toLocaleString()}</span>
            </Dialog.Description>
          </div>

          <div className="flex items-center gap-2">
            <Select.Root
              value={ticket.status}
              onValueChange={(value) => onChangeStatus(ticket.ticket_id, value as TicketStage)}
            >
              <Select.Trigger aria-label="Ticket stage" />
              <Select.Content>
                {TICKET_STAGES.map((stage) => (
                  <Select.Item key={stage} value={stage}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${STAGE_META[stage].dotColor}`}
                      />
                      {stage}
                    </span>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Dialog.Close>
              <button
                type="button"
                aria-label="Close ticket detail"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-5">
          {/* Student Contact Card */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
            <div className="space-y-2 text-xs">
              <p className="font-semibold tracking-wide text-slate-400 uppercase">
                Student Details
              </p>
              <p className="text-sm font-semibold text-slate-900">{ticket.student_name}</p>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <a
                  href={`mailto:${ticket.email}`}
                  className="text-indigo-700 hover:underline"
                >
                  {ticket.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{ticket.phone}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold tracking-wide text-slate-400 uppercase">
                Academic Context
              </p>
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium">{ticket.college}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {ticket.department} · {ticket.academic_year}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>{ticket.team_size}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Idea Summary & Requirements
            </h4>
            <p className="mt-2 rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-700">
              {ticket.project_description}
            </p>
          </div>

          {/* Categories & Services */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Project Categories
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ticket.categories.map((category) => (
                  <CategoryBadge key={category} category={category} size="2" />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Services Requested
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ticket.service_types.map((service) => (
                  <Badge key={service} color="gray" variant="surface" size="1">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              IEEE / Base Paper Details
            </h4>
            <div className="mt-2 space-y-2 text-xs text-slate-700">
                <p className="font-medium">{ticket.base_paper_status}</p>
                {ticket.base_paper_reference && (
                  <div className="flex items-start gap-1.5 rounded-lg bg-slate-50 p-2 text-slate-600">
                    <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
                    {ticket.base_paper_reference.startsWith('http') ? (
                      <a
                        href={ticket.base_paper_reference}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-indigo-700 hover:underline"
                      >
                        {ticket.base_paper_reference}
                      </a>
                    ) : (
                      <span>{ticket.base_paper_reference}</span>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Internal Mentor Notes */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Internal Mentor Notes ({ticket.notes.length})
            </h4>

            <form onSubmit={handleSubmitNote} className="mt-3 space-y-2.5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  placeholder="Mentor name"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none sm:w-44"
                />
                <input
                  type="text"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder='Add internal note (e.g., "Called student, agreed on React + FastAPI stack")'
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
                <Button
                  type="submit"
                  size="2"
                  color="indigo"
                  disabled={submittingNote || !noteContent.trim()}
                >
                  {submittingNote ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                  )}
                  Add Note
                </Button>
              </div>
            </form>

            <div className="mt-3 space-y-2">
              {ticket.notes.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                  No mentor notes yet. Add a consultation or engineering update above.
                </p>
              ) : (
                ticket.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-800">{note.author}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-700">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
