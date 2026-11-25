import { Code2, Inbox, PackageCheck, PhoneCall } from 'lucide-react'
import type { TicketStats } from '../../types/ticket'

interface StatsHeaderProps {
  stats: TicketStats | null
  loading: boolean
}

export function StatsHeader({ stats, loading }: StatsHeaderProps) {
  const cards = [
    {
      label: 'Total Requests',
      value: stats?.total_requests ?? 0,
      hint: 'All submitted student tickets',
      icon: Inbox,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Pending Verification',
      value: stats?.pending_verification ?? 0,
      hint: 'Awaiting consultation call',
      icon: PhoneCall,
      accent: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Active in Dev',
      value: stats?.active_in_dev ?? 0,
      hint: 'Currently in build sprint',
      icon: Code2,
      accent: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Delivered',
      value: stats?.delivered ?? 0,
      hint: 'Handover & viva preparation',
      icon: PackageCheck,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-2xs"
          >
            <div>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {loading && !stats ? '—' : card.value}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">{card.hint}</p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${card.accent}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
