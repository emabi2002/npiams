'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, UsersRound, GraduationCap, History } from 'lucide-react'

type ProgramRow = {
  id: string
  name: string
  code: string | null
  department_id: string | null
  department_name: string | null
  coordinator_name: string | null
  coordinator_email: string | null
  coordinator_start: string | null
}

type DeptOption = { id: string; name: string; code: string | null }
type StaffOption = { id: string; name: string; email: string | null }

export default function ProgramsPage() {
  const [rows, setRows] = useState<ProgramRow[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [dept, setDept] = useState<string>('all')

  const [departments, setDepartments] = useState<DeptOption[]>([])

  // Assign dialog
  const [openAssign, setOpenAssign] = useState(false)
  const [assignFor, setAssignFor] = useState<ProgramRow | null>(null)
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([])
  const [staffSearch, setStaffSearch] = useState('')
  const [staffId, setStaffId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')

  // History dialog
  const [openHistory, setOpenHistory] = useState(false)
  const [historyFor, setHistoryFor] = useState<ProgramRow | null>(null)
  const [history, setHistory] = useState<{ id: string; name: string | null; email: string | null; start_date: string | null; end_date: string | null; is_current: boolean }[]>([])

  useEffect(() => {
    void refresh()
    void loadDepartments()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dept !== 'all') params.set('dept', dept)
      if (q.trim()) params.set('q', q.trim())
      const r = await fetch(`/api/programs?${params.toString()}`, { cache: 'no-store' })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Load programs failed')
      setRows(j.rows as ProgramRow[])
    } catch (e) {
      console.error(e)
      alert('Failed to load programs.')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const r = await fetch('/api/departments', { cache: 'no-store' })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Load departments failed')
      const opts: DeptOption[] = (j.rows as any[]).map(d => ({ id: d.id, name: d.name, code: d.code ?? null }))
      setDepartments(opts)
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = useMemo(() => {
    const needle = q.toLowerCase()
    let list = rows
    if (dept !== 'all') list = list.filter(r => r.department_id === dept)
    if (!needle) return list
    return list.filter(r =>
      (r.name ?? '').toLowerCase().includes(needle) ||
      (r.code ?? '').toLowerCase().includes(needle) ||
      (r.department_name ?? '').toLowerCase().includes(needle) ||
      (r.coordinator_name ?? '').toLowerCase().includes(needle)
    )
  }, [rows, q, dept])

  // open assign dialog
  const openAssignFor = async (p: ProgramRow) => {
    setAssignFor(p); setOpenAssign(true); setStaffOptions([]); setStaffId(''); setStartDate('')
    await loadStaffForProgram(p, '')
  }

  const loadStaffForProgram = async (p: ProgramRow, q: string) => {
    // academic staff of program's department, with search
    const params = new URLSearchParams()
    params.set('type', 'academic')
    if (p.department_id) params.set('dept', p.department_id)
    if (q.trim()) params.set('q', q.trim())
    const r = await fetch(`/api/staff?${params.toString()}`, { cache: 'no-store' })
    const j = await r.json()
    if (!j.success) throw new Error(j.error || 'Load staff failed')

    const opts: StaffOption[] = (j.rows as any[]).map((s: any) => ({
      id: s.staff_id,
      name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || '(no name)',
      email: s.email ?? null,
    }))
    setStaffOptions(opts)
  }

  const submitAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignFor || !staffId) return
    try {
      const r = await fetch('/api/programs/assign-coordinator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: assignFor.id,
          staff_id: staffId,
          start_date: startDate || undefined,
        }),
      })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Assign failed')
      setOpenAssign(false)
      await refresh()
    } catch (e: any) {
      console.error(e)
      alert(`Failed to assign coordinator: ${e.message}`)
    }
  }

  const openHistoryFor = async (p: ProgramRow) => {
    setHistoryFor(p); setOpenHistory(true); setHistory([])
    const r = await fetch(`/api/programs/roles?program_id=${p.id}`, { cache: 'no-store' })
    const j = await r.json()
    if (j.success) setHistory(j.rows as any[])
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header & filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Programs
          </h1>
          <p className="text-gray-600 mt-2">Program list with current coordinators.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search program, code, coordinator…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 w-72"
              onKeyDown={(e) => e.key === 'Enter' && void refresh()}
            />
          </div>

          <Select value={dept} onValueChange={(v: any) => setDept(v)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}{d.code ? ` (${d.code})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => void refresh()}>Apply</Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Programs ({filtered.length})</CardTitle>
          <CardDescription>Live from programs + program_roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Coordinator</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No programs found.</TableCell></TableRow>
                ) : filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="outline">{p.code ?? '—'}</Badge></TableCell>
                    <TableCell>{p.department_name ?? '—'}</TableCell>
                    <TableCell>
                      {p.coordinator_name ? (
                        <>
                          <div className="font-medium">{p.coordinator_name}</div>
                          <div className="text-xs text-muted-foreground">{p.coordinator_email ?? ''}</div>
                        </>
                      ) : <span className="text-muted-foreground">No coordinator</span>}
                    </TableCell>
                    <TableCell>{p.coordinator_start ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openHistoryFor(p)}>
                          <History className="h-4 w-4 mr-1" />
                          History
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openAssignFor(p)}>
                          <UsersRound className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign dialog */}
      <Dialog open={openAssign} onOpenChange={setOpenAssign}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Assign Program Coordinator</DialogTitle>
            <DialogDescription>
              This will close any current coordinator and create a new one for this program.
            </DialogDescription>
          </DialogHeader>

          {assignFor && (
            <form onSubmit={submitAssign} className="space-y-4">
              <div className="text-sm">
                <div><strong>Program:</strong> {assignFor.name}</div>
                <div><strong>Department:</strong> {assignFor.department_name ?? '—'}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Find academic staff</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type to search staff…"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && assignFor) {
                          e.preventDefault()
                          await loadStaffForProgram(assignFor, staffSearch)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => assignFor && loadStaffForProgram(assignFor, staffSearch)}
                    >
                      Search
                    </Button>
                  </div>
                </div>

                <div className="col-span-2">
                  <Label>Select coordinator</Label>
                  <Select value={staffId} onValueChange={(v: any) => setStaffId(v)}>
                    <SelectTrigger><SelectValue placeholder="Choose staff" /></SelectTrigger>
                    <SelectContent>
                      {staffOptions.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}{s.email ? ` – ${s.email}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Start date</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpenAssign(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!staffId}>
                  Assign
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={openHistory} onOpenChange={setOpenHistory}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Coordinator History</DialogTitle>
            <DialogDescription>Past and current coordinators for this program.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {historyFor && (
              <div className="text-sm">
                <div><strong>Program:</strong> {historyFor.name}</div>
                <div><strong>Department:</strong> {historyFor.department_name ?? '—'}</div>
              </div>
            )}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">No history.</TableCell></TableRow>
                  ) : history.map(h => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.name ?? '—'}</TableCell>
                      <TableCell>{h.email ?? '—'}</TableCell>
                      <TableCell>{h.start_date ?? '—'}</TableCell>
                      <TableCell>{h.end_date ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={h.is_current ? 'default' : 'outline'}>
                          {h.is_current ? 'Current' : 'Past'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
