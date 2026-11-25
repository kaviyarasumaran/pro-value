import { Badge } from '@radix-ui/themes'
import { CATEGORY_COLORS, type ProjectCategory } from '../types/ticket'

interface CategoryBadgeProps {
  category: ProjectCategory
  size?: '1' | '2'
}

export function CategoryBadge({ category, size = '1' }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] ?? 'gray'
  return (
    <Badge color={color} variant="soft" radius="full" size={size}>
      {category}
    </Badge>
  )
}
