import * as Toast from '@radix-ui/react-toast'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  title: string
  description?: string
  tone: ToastTone
}

interface ToastContextValue {
  showToast: (title: string, description?: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    (title: string, description?: string, tone: ToastTone = 'info') => {
      const id = Date.now() + Math.floor(Math.random() * 1000)
      setToasts((prev) => [...prev, { id, title, description, tone }])
    },
    [],
  )

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right" duration={4500}>
        {children}
        {toasts.map((item) => (
          <Toast.Root
            key={item.id}
            open
            onOpenChange={(open) => {
              if (!open) removeToast(item.id)
            }}
            className="pointer-events-auto flex w-[360px] items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out"
          >
            <div className="mt-0.5 shrink-0">
              {item.tone === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              {item.tone === 'error' && <AlertCircle className="h-5 w-5 text-rose-600" />}
              {item.tone === 'info' && <Info className="h-5 w-5 text-indigo-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <Toast.Title className="text-sm font-semibold text-slate-900">
                {item.title}
              </Toast.Title>
              {item.description && (
                <Toast.Description className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  {item.description}
                </Toast.Description>
              )}
            </div>
            <Toast.Close
              aria-label="Close notification"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed right-4 bottom-4 z-[100] flex max-w-full flex-col gap-2 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
