import { Button } from '@radix-ui/themes'
import { GraduationCap, SearchCheck, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface NavbarProps {
  onOpenTracker: () => void
}

export function Navbar({ onOpenTracker }: NavbarProps) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                ProValue Studio
              </span>
              <span className="hidden rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 sm:inline-block">
                Academic Mentorship
              </span>
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              !isAdmin
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Student Portal
          </Link>

          <Button
            type="button"
            variant="soft"
            color="indigo"
            size="2"
            onClick={onOpenTracker}
            className="cursor-pointer"
          >
            <SearchCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Track Ticket</span>
            <span className="sm:hidden">Track</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
