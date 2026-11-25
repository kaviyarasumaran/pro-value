export const TICKET_STAGES = [
  'Request',
  'Verify Contact',
  'Hold',
  'Dev',
  'Test',
  'Delivery',
  'Closed',
] as const

export type TicketStage = (typeof TICKET_STAGES)[number]

export const PROJECT_CATEGORIES = [
  'AI / Machine Learning Apps',
  'Mobile Apps (Android/iOS)',
  'Web Applications',
  'SaaS Platforms',
  'ERP / Management Systems',
  'E-Commerce',
  'IoT / Hardware Integration',
  'Other',
] as const

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export const ACADEMIC_YEARS = ['Pre-Final Year', 'Final Year'] as const
export type AcademicYear = (typeof ACADEMIC_YEARS)[number]

export const TEAM_SIZES = ['Individual', 'Group of 2–4'] as const
export type TeamSize = (typeof TEAM_SIZES)[number]

export const BASE_PAPER_STATUSES = [
  'Yes',
  'No',
  'Need Guidance Selecting One',
] as const
export type BasePaperStatus = (typeof BASE_PAPER_STATUSES)[number]

export const SERVICE_TYPES = [
  'Full Project Development',
  'Code Debugging & Support',
  'Documentation & Report',
  'Base Paper Implementation',
  '1-on-1 Mentorship',
] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

export const DEPARTMENTS = [
  'CSE',
  'IT',
  'AI&DS',
  'AI&ML',
  'ECE',
  'EEE',
  'Mechanical',
  'Other',
] as const

export interface MentorNote {
  id: number
  ticket_id: string
  author: string
  content: string
  created_at: string
}

export interface Ticket {
  id: number
  ticket_id: string
  student_name: string
  email: string
  phone: string
  college: string
  department: string
  academic_year: AcademicYear
  team_size: TeamSize
  project_title: string
  project_description: string
  categories: ProjectCategory[]
  base_paper_status: BasePaperStatus
  base_paper_reference: string | null
  service_types: ServiceType[]
  status: TicketStage
  created_at: string
  updated_at: string
  notes: MentorNote[]
}

export interface TicketCreatePayload {
  student_name: string
  email: string
  phone: string
  college: string
  department: string
  academic_year: AcademicYear
  team_size: TeamSize
  project_title: string
  project_description: string
  categories: ProjectCategory[]
  base_paper_status: BasePaperStatus
  base_paper_reference?: string | null
  service_types: ServiceType[]
}

export interface TicketStats {
  total_requests: number
  active_in_dev: number
  pending_verification: number
  delivered: number
  by_status: Record<TicketStage, number>
}

export type RadixColor =
  | 'indigo'
  | 'amber'
  | 'orange'
  | 'blue'
  | 'purple'
  | 'green'
  | 'gray'
  | 'violet'
  | 'cyan'
  | 'teal'
  | 'crimson'
  | 'plum'

export interface StageMeta {
  label: TicketStage
  description: string
  radixColor: RadixColor
  headerBg: string
  headerBorder: string
  dotColor: string
}

export const STAGE_META: Record<TicketStage, StageMeta> = {
  Request: {
    label: 'Request',
    description: 'New incoming student submissions',
    radixColor: 'indigo',
    headerBg: 'bg-[var(--indigo-2)]',
    headerBorder: 'border-[var(--indigo-6)]',
    dotColor: 'bg-[var(--indigo-9)]',
  },
  'Verify Contact': {
    label: 'Verify Contact',
    description: 'Validating details & scheduling consultation',
    radixColor: 'amber',
    headerBg: 'bg-[var(--amber-2)]',
    headerBorder: 'border-[var(--amber-6)]',
    dotColor: 'bg-[var(--amber-9)]',
  },
  Hold: {
    label: 'Hold',
    description: 'Waiting on student, paper approval, or advance',
    radixColor: 'orange',
    headerBg: 'bg-[var(--orange-2)]',
    headerBorder: 'border-[var(--orange-6)]',
    dotColor: 'bg-[var(--orange-9)]',
  },
  Dev: {
    label: 'Dev',
    description: 'Active development & coding phase',
    radixColor: 'blue',
    headerBg: 'bg-[var(--blue-2)]',
    headerBorder: 'border-[var(--blue-6)]',
    dotColor: 'bg-[var(--blue-9)]',
  },
  Test: {
    label: 'Test',
    description: 'QA, bug fixing, and student demo',
    radixColor: 'purple',
    headerBg: 'bg-[var(--purple-2)]',
    headerBorder: 'border-[var(--purple-6)]',
    dotColor: 'bg-[var(--purple-9)]',
  },
  Delivery: {
    label: 'Delivery',
    description: 'Final handover, documentation & viva prep',
    radixColor: 'green',
    headerBg: 'bg-[var(--green-2)]',
    headerBorder: 'border-[var(--green-6)]',
    dotColor: 'bg-[var(--green-9)]',
  },
  Closed: {
    label: 'Closed',
    description: 'Completed or cancelled tickets',
    radixColor: 'gray',
    headerBg: 'bg-[var(--slate-2)]',
    headerBorder: 'border-[var(--slate-6)]',
    dotColor: 'bg-[var(--slate-9)]',
  },
}

export const CATEGORY_COLORS: Record<ProjectCategory, RadixColor> = {
  'AI / Machine Learning Apps': 'violet',
  'Mobile Apps (Android/iOS)': 'cyan',
  'Web Applications': 'blue',
  'SaaS Platforms': 'indigo',
  'ERP / Management Systems': 'teal',
  'E-Commerce': 'crimson',
  'IoT / Hardware Integration': 'amber',
  Other: 'gray',
}
