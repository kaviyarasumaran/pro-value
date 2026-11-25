import { Badge } from '@radix-ui/themes'
import { Compass, FileCheck2, FileQuestion } from 'lucide-react'
import type { BasePaperStatus } from '../types/ticket'

interface BasePaperBadgeProps {
  status: BasePaperStatus
  compact?: boolean
}

export function BasePaperBadge({ status, compact = false }: BasePaperBadgeProps) {
  if (status === 'Yes') {
    return (
      <Badge color="green" variant="outline" radius="medium" size="1">
        <FileCheck2 className="h-3 w-3" />
        {compact ? 'Has Base Paper' : 'Has IEEE / Base Paper'}
      </Badge>
    )
  }

  if (status === 'Need Guidance Selecting One') {
    return (
      <Badge color="amber" variant="outline" radius="medium" size="1">
        <Compass className="h-3 w-3" />
        {compact ? 'Needs Guidance' : 'Needs Paper Guidance'}
      </Badge>
    )
  }

  return (
    <Badge color="gray" variant="outline" radius="medium" size="1">
      <FileQuestion className="h-3 w-3" />
      Needs Paper
    </Badge>
  )
}
