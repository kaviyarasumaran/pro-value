import { Button, Dialog } from '@radix-ui/themes'
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { fetchTicketById } from '../api/client'
import { STAGE_META, TICKET_STAGES, type Ticket } from '../types/ticket'
import { BasePaperBadge } from './BasePaperBadge'
import { CategoryBadge } from './CategoryBadge'
import { StageBadge } from './StageBadge'

interface StatusTrackerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTicketId?: string
}

export function StatusTrackerModal({
  open,
  onOpenChange,
  initialTicketId = '',
}: StatusTrackerModalProps) {
  const [ticketId, setTicketId] = useState(initialTicketId)
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)

  const handleLookup = async (event: FormEvent) => {
    event.preventDefault()
    if (!ticketId.trim() || !contact.trim()) {
      setError('Please enter both your Ticket ID and registered email or phone number.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchTicketById(ticketId, contact)
      setTicket(result)
    } catch (err) {
      setTicket(null)
      setError(err instanceof Error ? err.message : 'Unable to locate ticket.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null)
    } else if (initialTicketId && !ticketId) {
      setTicketId(initialTicketId)
    }
    onOpenChange(nextOpen)
  }

  const activeIndex = ticket ? TICKET_STAGES.indexOf(ticket.status) : -1

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content maxWidth="580px" className="rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              Track Project Ticket Status
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-500">
              Enter your Ticket ID (e.g., <span className="font-mono font-medium">PRJ-1001</span>) and
              the email or phone number used during registration.
            </Dialog.Description>
          </div>
          <Dialog.Close>
            <button
              type="button"
              aria-label="Close tracker"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </div>

        <form onSubmit={handleLookup} className="mt-5 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Ticket ID
              </label>
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="PRJ-1001"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 uppercase placeholder:normal-case focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Email or Phone Number
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="aarav.sharma@vitstudent.ac.in"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} size="2" color="indigo">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Check Status
                </>
              )}
            </Button>
          </div>
        </form>

        {ticket && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-indigo-700">
                    {ticket.ticket_id}
                  </span>
                  <StageBadge stage={ticket.status} size="2" />
                </div>
                <h4 className="mt-1 text-sm font-semibold text-slate-900">
                  {ticket.project_title}
                </h4>
                <p className="text-xs text-slate-500">
                  {ticket.student_name} · {ticket.college} ({ticket.department})
                </p>
              </div>
              <BasePaperBadge status={ticket.base_paper_status} compact />
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium text-slate-700">
                Current Stage: <span className="text-slate-900">{ticket.status}</span> —{' '}
                <span className="font-normal text-slate-500">
                  {STAGE_META[ticket.status].description}
                </span>
              </p>

              <div className="mt-3 grid grid-cols-7 gap-1">
                {TICKET_STAGES.map((stage, idx) => {
                  const isDone = idx < activeIndex
                  const isCurrent = idx === activeIndex
                  return (
                    <div key={stage} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-1.5 w-full rounded-full ${
                          isCurrent
                            ? 'bg-indigo-600'
                            : isDone
                              ? 'bg-emerald-500'
                              : 'bg-slate-200'
                        }`}
                      />
                      <span
                        className={`text-center text-[10px] leading-tight ${
                          isCurrent
                            ? 'font-semibold text-indigo-700'
                            : isDone
                              ? 'font-medium text-emerald-700'
                              : 'text-slate-400'
                        }`}
                      >
                        {stage}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {ticket.categories.map((cat) => (
                <CategoryBadge key={cat} category={cat} />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Submitted {new Date(ticket.created_at).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1">
                {ticket.status === 'Closed' || ticket.status === 'Delivery' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                )}
                {ticket.team_size} · {ticket.academic_year}
              </span>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}
