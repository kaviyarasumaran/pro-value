import { Badge } from '@radix-ui/themes'
import { STAGE_META, type TicketStage } from '../types/ticket'

interface StageBadgeProps {
  stage: TicketStage
  size?: '1' | '2' | '3'
}

export function StageBadge({ stage, size = '1' }: StageBadgeProps) {
  const meta = STAGE_META[stage]
  return (
    <Badge color={meta.radixColor} variant="soft" radius="full" size={size}>
      <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
      {stage}
    </Badge>
  )
}
