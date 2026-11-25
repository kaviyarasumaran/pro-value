import { Button, Checkbox, Dialog, RadioGroup, Select } from '@radix-ui/themes'
import {
  Check,
  CheckCircle2,
  ClipboardCopy,
  Layers,
  Loader2,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { createTicket } from '../api/client'
import { useToast } from '../components/ToastContext'
import {
  ACADEMIC_YEARS,
  BASE_PAPER_STATUSES,
  DEPARTMENTS,
  PROJECT_CATEGORIES,
  SERVICE_TYPES,
  TEAM_SIZES,
  type AcademicYear,
  type BasePaperStatus,
  type ProjectCategory,
  type ServiceType,
  type TeamSize,
  type Ticket,
} from '../types/ticket'

interface StudentPortalPageProps {
  onOpenTracker: (ticketId?: string) => void
}

export function StudentPortalPage({ onOpenTracker }: StudentPortalPageProps) {
  const { showToast } = useToast()

  // Student Details
  const [studentName, setStudentName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState<string>('CSE')
  const [customDepartment, setCustomDepartment] = useState('')
  const [academicYear, setAcademicYear] = useState<AcademicYear>('Final Year')
  const [teamSize, setTeamSize] = useState<TeamSize>('Group of 2–4')

  // Project Details
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [basePaperStatus, setBasePaperStatus] = useState<BasePaperStatus>('No')
  const [basePaperReference, setBasePaperReference] = useState('')
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(['Full Project Development'])

  // Submission & Confirmation Dialog
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmedTicket, setConfirmedTicket] = useState<Ticket | null>(null)
  const [copiedId, setCopiedId] = useState(false)

  const toggleCategory = (category: ProjectCategory) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleService = (service: ServiceType) => {
    setServiceTypes((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    )
  }

  const resetForm = () => {
    setStudentName('')
    setEmail('')
    setPhone('')
    setCollege('')
    setDepartment('CSE')
    setCustomDepartment('')
    setAcademicYear('Final Year')
    setTeamSize('Group of 2–4')
    setProjectTitle('')
    setProjectDescription('')
    setCategories([])
    setBasePaperStatus('No')
    setBasePaperReference('')
    setServiceTypes(['Full Project Development'])
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const resolvedDepartment =
      department === 'Other' ? customDepartment.trim() || 'Other' : department

    if (categories.length === 0) {
      setFormError('Please select at least one Project Category.')
      return
    }
    if (serviceTypes.length === 0) {
      setFormError('Please select at least one Service Type needed.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createTicket({
        student_name: studentName,
        email,
        phone,
        college,
        department: resolvedDepartment,
        academic_year: academicYear,
        team_size: teamSize,
        project_title: projectTitle,
        project_description: projectDescription,
        categories,
        base_paper_status: basePaperStatus,
        base_paper_reference: basePaperStatus === 'Yes' ? basePaperReference : null,
        service_types: serviceTypes,
      })

      setConfirmedTicket(created)
      showToast(
        `Ticket ${created.ticket_id} registered`,
        'Our mentorship coordinator will verify your contact details shortly.',
        'success',
      )
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit project request.'
      setFormError(message)
      showToast('Submission failed', message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyTicketId = async () => {
    if (!confirmedTicket) return
    await navigator.clipboard.writeText(confirmedTicket.ticket_id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      {/* Hero Banner */}
      <div className="mb-8 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs lg:flex-row lg:items-center lg:p-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Pre-Final & Final Year Academic Project Portal
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Build & Deliver Your Academic Project with Dedicated Engineering Mentors
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Submit your project idea, IEEE base paper, or architecture requirements below. You will
            receive an instant Ticket ID to track progress from initial consultation through testing,
            documentation, and viva preparation.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col">
          <Button
            type="button"
            size="3"
            variant="outline"
            color="indigo"
            onClick={() => onOpenTracker()}
            className="cursor-pointer"
          >
            <SearchCheck className="h-4 w-4" />
            Track Existing Ticket
          </Button>
          <div className="flex items-center gap-4 px-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              IEEE & Viva Ready
            </span>
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              7-Stage Tracking
            </span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Student Details */}
          <div className="space-y-6 lg:col-span-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900">1. Student Details</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Used for mentor consultation scheduling and ticket verification.
                </p>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g., Aarav Sharma"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@college.edu"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    College / University Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g., Vellore Institute of Technology"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <Select.Root value={department} onValueChange={setDepartment}>
                      <Select.Trigger className="w-full" />
                      <Select.Content>
                        {DEPARTMENTS.map((dept) => (
                          <Select.Item key={dept} value={dept}>
                            {dept}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Academic Year <span className="text-rose-500">*</span>
                    </label>
                    <Select.Root
                      value={academicYear}
                      onValueChange={(val) => setAcademicYear(val as AcademicYear)}
                    >
                      <Select.Trigger className="w-full" />
                      <Select.Content>
                        {ACADEMIC_YEARS.map((year) => (
                          <Select.Item key={year} value={year}>
                            {year}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </div>
                </div>

                {department === 'Other' && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Specify Department
                    </label>
                    <input
                      required
                      type="text"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      placeholder="e.g., Robotics & Automation"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">
                    Team Size <span className="text-rose-500">*</span>
                  </label>
                  <RadioGroup.Root
                    value={teamSize}
                    onValueChange={(val) => setTeamSize(val as TeamSize)}
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      {TEAM_SIZES.map((size) => (
                        <label
                          key={size}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            teamSize === size
                              ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <RadioGroup.Item value={size} />
                          {size}
                        </label>
                      ))}
                    </div>
                  </RadioGroup.Root>
                </div>
              </div>
            </section>

            {/* Service Type Needed */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900">
                  2. Service Type Needed <span className="text-rose-500">*</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select all mentorship or engineering services you require.
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                {SERVICE_TYPES.map((service) => {
                  const checked = serviceTypes.includes(service)
                  return (
                    <label
                      key={service}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        checked
                          ? 'border-indigo-400 bg-indigo-50/60 text-indigo-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleService(service)}
                        color="indigo"
                      />
                      <span>{service}</span>
                    </label>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Project Details & Base Paper */}
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900">
                  3. Project Details & Categorization
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Tell us about your problem statement, domain, and base paper status.
                </p>
              </div>

              <div className="mt-4 space-y-5">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Project Title / Idea Summary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    minLength={3}
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g., AI-Powered Chest X-Ray Triage System using Federated Learning"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Detailed Project Description & Goals <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    minLength={10}
                    rows={4}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe the core features, target users, dataset or hardware components, and your college submission timeline..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  />
                </div>

                {/* Project Categories (Multi-select Radix Checkboxes) */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">
                    Project Categories (Select one or more) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {PROJECT_CATEGORIES.map((category) => {
                      const checked = categories.includes(category)
                      return (
                        <label
                          key={category}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            checked
                              ? 'border-indigo-400 bg-indigo-50/60 text-indigo-950'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCategory(category)}
                            color="indigo"
                          />
                          <span>{category}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Base Paper Status */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <label className="mb-2 block text-xs font-semibold text-slate-800">
                    Do you already have an IEEE / Base Paper?{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <RadioGroup.Root
                    value={basePaperStatus}
                    onValueChange={(val) => setBasePaperStatus(val as BasePaperStatus)}
                  >
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {BASE_PAPER_STATUSES.map((status) => (
                        <label
                          key={status}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            basePaperStatus === status
                              ? 'border-indigo-500 bg-white text-indigo-900 shadow-2xs'
                              : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                          }`}
                        >
                          <RadioGroup.Item value={status} />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup.Root>

                  {basePaperStatus === 'Yes' && (
                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Paper Title or IEEE Xplore / DOI Link
                      </label>
                      <input
                        type="text"
                        value={basePaperReference}
                        onChange={(e) => setBasePaperReference(e.target.value)}
                        placeholder="https://ieeexplore.ieee.org/document/... or Paper Title"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError}
              </div>
            )}

            <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
              <p className="text-xs text-slate-500">
                Submitting generates an instant <span className="font-mono font-semibold">PRJ-XXXX</span>{' '}
                Ticket ID for live status tracking.
              </p>
              <Button
                type="submit"
                size="3"
                color="indigo"
                disabled={submitting}
                className="cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Project Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Registration Confirmation Radix Dialog */}
      <Dialog.Root
        open={Boolean(confirmedTicket)}
        onOpenChange={(open) => {
          if (!open) setConfirmedTicket(null)
        }}
      >
        <Dialog.Content maxWidth="480px" className="rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <Dialog.Title className="mt-4 text-xl font-semibold text-slate-900">
              Project Request Registered!
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm text-slate-600">
              Save your Ticket ID below. You can track mentor review and development milestones at
              any time using your Ticket ID and registered email or phone.
            </Dialog.Description>

            {confirmedTicket && (
              <div className="mt-5 w-full rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
                <p className="text-[11px] font-semibold tracking-wider text-indigo-700 uppercase">
                  Your Unique Ticket ID
                </p>
                <div className="mt-1.5 flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight text-indigo-950">
                    {confirmedTicket.ticket_id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTicketId}
                    className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                  >
                    {copiedId ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {confirmedTicket.project_title} · Stage:{' '}
                  <span className="font-semibold text-indigo-800">{confirmedTicket.status}</span>
                </p>
              </div>
            )}

            <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="soft"
                color="indigo"
                onClick={() => {
                  const id = confirmedTicket?.ticket_id
                  setConfirmedTicket(null)
                  onOpenTracker(id)
                }}
              >
                <SearchCheck className="h-4 w-4" />
                Track Status Now
              </Button>
              <Dialog.Close>
                <Button type="button" color="indigo">
                  Done
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
