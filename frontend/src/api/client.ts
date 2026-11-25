import type {
  MentorNote,
  Ticket,
  TicketCreatePayload,
  TicketStage,
  TicketStats,
} from '../types/ticket'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const payload = await response.json()
      if (typeof payload?.detail === 'string') {
        detail = payload.detail
      } else if (Array.isArray(payload?.detail)) {
        detail = payload.detail
          .map((item: { msg?: string; loc?: string[] }) =>
            item.loc ? `${item.loc[item.loc.length - 1]}: ${item.msg}` : item.msg,
          )
          .join('; ')
      }
    } catch {
      // Ignore non-JSON error body
    }
    throw new Error(detail)
  }

  return response.json() as Promise<T>
}

export interface TicketFilters {
  status?: string
  category?: string
  academic_year?: string
  base_paper_status?: string
  search?: string
}

export async function fetchTickets(filters: TicketFilters = {}): Promise<Ticket[]> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.academic_year) params.set('academic_year', filters.academic_year)
  if (filters.base_paper_status) params.set('base_paper_status', filters.base_paper_status)
  if (filters.search?.trim()) params.set('search', filters.search.trim())

  const query = params.toString()
  return request<Ticket[]>(`/api/tickets${query ? `?${query}` : ''}`)
}

export async function fetchTicketById(ticketId: string, contact?: string): Promise<Ticket> {
  const params = new URLSearchParams()
  if (contact !== undefined) {
    params.set('contact', contact)
  }
  const query = params.toString()
  return request<Ticket>(
    `/api/tickets/${encodeURIComponent(ticketId.trim().toUpperCase())}${query ? `?${query}` : ''}`,
  )
}

export async function createTicket(payload: TicketCreatePayload): Promise<Ticket> {
  return request<Ticket>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStage,
): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${encodeURIComponent(ticketId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function addMentorNote(
  ticketId: string,
  content: string,
  author = 'Mentor',
): Promise<MentorNote> {
  return request<MentorNote>(`/api/tickets/${encodeURIComponent(ticketId)}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content, author }),
  })
}

export async function fetchStats(): Promise<TicketStats> {
  return request<TicketStats>('/api/stats')
}
