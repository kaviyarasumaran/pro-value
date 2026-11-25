import { Theme } from '@radix-ui/themes'
import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { StatusTrackerModal } from './components/StatusTrackerModal'
import { ToastProvider } from './components/ToastContext'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { StudentPortalPage } from './pages/StudentPortalPage'

export function App() {
  const [trackerOpen, setTrackerOpen] = useState(false)
  const [trackerInitialId, setTrackerInitialId] = useState('')

  const handleOpenTracker = (ticketId?: string) => {
    if (ticketId) {
      setTrackerInitialId(ticketId)
    }
    setTrackerOpen(true)
  }

  return (
    <Theme accentColor="indigo" grayColor="slate" radius="medium" scaling="100%">
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar onOpenTracker={() => handleOpenTracker()} />
            <main>
              <Routes>
                <Route
                  path="/"
                  element={<StudentPortalPage onOpenTracker={handleOpenTracker} />}
                />
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Routes>
            </main>
            <StatusTrackerModal
              open={trackerOpen}
              onOpenChange={setTrackerOpen}
              initialTicketId={trackerInitialId}
            />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </Theme>
  )
}

export default App
