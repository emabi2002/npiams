'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, Search, UserPlus, Briefcase } from 'lucide-react'

type StaffRow = {
  staff_id: string
  staff_no: string | null
  staff_type: 'academic' | 'non_academic'
  first_name: string | null
  last_name: string | null
  email: string | null
  department_id: string | null          // primary dept from v_staff_summary
  department_name?: string | null       // if your view exposes it
}

type DeptOption = { id: string; name: string; code: string | null }

export default function StaffPage() {
  // list
  const [rows, setRows] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)

  // filters
  const [q, setQ] = useState('')
  const [type, setType] = useState<'all' | 'academic' | 'non_academic'>('all')
  const [dept, setDept] = useState<string>('all')

  // deps for selects
  const [departments, setDepartments] = useState<DeptOption[]>([])

  // dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAttachOpen, setIsAttachOpen] = useState(false)
  const [attachFor, setAttachFor] = useState<StaffRow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // create form state
  const [cType, setCType] = useState<'academic' | 'non_academic'>('academic')
  const [cStaffNo, setCStaffNo] = useState('')
  const [cFirst, setCFirst] = useState('')
  const [cLast, setCLast] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cPrimDept, setCPrimDept] = useState<string>('')
  const [cPrimTitle, setCPrimTitle] = useState('')
  const [cPrimStart, setCPrimStart] = useState('')

  // attach secondary
  const [aDept, setADept] = useState<string>('')
  const [aTitle, setATitle] = useState('')
  const [aStart, setAStart] = useState('')

  useEffect(() => {
    void refresh()
    void loadDepartments()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (type !== 'all') params.set('type', type)
      if (dept !== 'all') params.set('dept', dept)
      if (q.trim()) params.set('q', q.trim())
      const r = await fetch(`/api/staff?${params.toString()}`, { cache: 'no-store' })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Failed to load staff')
      setRows(j.rows as StaffRow[])
    } catch (e) {
      console.error(e)
      alert('Failed to load staff. See console.')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const r = await fetch('/api/departments', { cache: 'no-store' })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Load departments failed')
      const opts: DeptOption[] = (j.rows as any[]).map(d => ({
        id: d.id, name: d.name, code: d.code ?? null,
      }))
      setDepartments(opts)
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = useMemo(() => {
    const needle = q.toLowerCase()
    let list = rows
    if (type !== 'all') list = list.filter(r => r.staff_type === type)
    if (dept !== 'all') list = list.filter(r => r.department_id === dept)
    if (!needle) return list
    return list.filter(r =>
      (r.first_name ?? '').toLowerCase().includes(needle) ||
      (r.last_name ?? '').toLowerCase().includes(needle) ||
      (r.email ?? '').toLowerCase().includes(needle) ||
      (r.staff_no ?? '').toLowerCase().includes(needle)
    )
  }, [rows, q, type, dept])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const body = {
        staff_type: cType,
        staff_no: cStaffNo || undefined,
        person: {
          first_name: cFirst.trim(),
          last_name: cLast.trim(),
          email: cEmail.trim(),
          phone: cPhone.trim() || undefined,
        },
        primary_employment: cPrimDept
          ? {
              department_id: cPrimDept,
              position_title: cPrimTitle || undefined,
              start_date: cPrimStart || undefined,
            }
          : undefined,
      }
      const r = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Create failed')

      // reset
      setIsCreateOpen(false)
      setCStaffNo(''); setCFirst(''); setCLast(''); setCEmail(''); setCPhone('')
      setCPrimDept(''); setCPrimTitle(''); setCPrimStart('')
      await refresh()
    } catch (e: any) {
      console.error(e)
      alert(`Failed to create staff: ${e.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onAttach = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attachFor) return
    setIsSubmitting(true)
    try {
      const r = await fetch('/api/staff/employments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: attachFor.staff_id,
          department_id: aDept,
          position_title: aTitle || undefined,
          start_date: aStart || undefined,
          is_primary: false,
        }),
      })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Attach failed')
      setIsAttachOpen(false)
      setAttachFor(null)
      setADept(''); setATitle(''); setAStart('')
      await refresh()
    } catch (e: any) {
      console.error(e)
      alert(`Failed to attach department: ${e.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header & filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            Staff
          </h1>
          <p className="text-gray-600 mt-2">Manage academic and non-academic staff profiles.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, staff no…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 w-64"
              onKeyDown={(e) => e.key === 'Enter' && void refresh()}
            />
          </div>

          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="non_academic">Non-academic</SelectItem>
            </SelectContent>
          </Select>

            <Select value={dept} onValueChange={(v: any) => setDept(v)}>
              <SelectTrigger className="w-[220px]">
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

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Staff</DialogTitle>
                <DialogDescription>Creates person + staff, and optionally primary department.</DialogDescription>
              </DialogHeader>

              <form onSubmit={onCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={cType} onValueChange={(v: any) => setCType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="non_academic">Non-academic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Staff No.</Label>
                    <Input value={cStaffNo} onChange={e => setCStaffNo(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>First name</Label>
                    <Input value={cFirst} onChange={e => setCFirst(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <Input value={cLast} onChange={e => setCLast(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input value={cPhone} onChange={e => setCPhone(e.target.value)} />
                  </div>
                  <div>
                    <Label>Primary Department</Label>
                    <Select value={cPrimDept} onValueChange={(v: any) => setCPrimDept(v)}>
                      <SelectTrigger><SelectValue placeholder="(optional)" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}{d.code ? ` (${d.code})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Position title</Label>
                    <Input value={cPrimTitle} onChange={e => setCPrimTitle(e.target.value)} placeholder="e.g. Lecturer" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Start date</Label>
                    <Input type="date" value={cPrimStart} onChange={e => setCPrimStart(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff ({filtered.length})</CardTitle>
          <CardDescription>Live list from <code>v_staff_summary</code>.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Staff No.</TableHead>
                  <TableHead>Primary Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No staff found.</TableCell></TableRow>
                ) : filtered.map(r => {
                  const name = `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || '—'
                  return (
                    <TableRow key={r.staff_id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>{r.email ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {r.staff_type === 'academic' ? 'Academic' : 'Non-academic'}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.staff_no ?? '—'}</TableCell>
                      <TableCell>{r.department_name || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isAttachOpen && attachFor?.staff_id === r.staff_id} onOpenChange={(o) => {
                          setIsAttachOpen(o)
                          if (!o) setAttachFor(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setAttachFor(r); setIsAttachOpen(true) }}
                              title="Attach secondary department"
                            >
                              <Briefcase className="h-4 w-4 mr-1" />
                              Attach dept
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Attach department</DialogTitle>
                              <DialogDescription>Creates a non-primary employment for this staff.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={onAttach} className="space-y-4">
                              <div>
                                <Label>Department</Label>
                                <Select value={aDept} onValueChange={(v: any) => setADept(v)}>
                                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                  <SelectContent>
                                    {departments.map(d => (
                                      <SelectItem key={d.id} value={d.id}>
                                        {d.name}{d.code ? ` (${d.code})` : ''}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Position title</Label>
                                  <Input value={aTitle} onChange={e => setATitle(e.target.value)} />
                                </div>
                                <div>
                                  <Label>Start date</Label>
                                  <Input type="date" value={aStart} onChange={e => setAStart(e.target.value)} />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsAttachOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting || !aDept}>
                                  {isSubmitting ? 'Saving…' : 'Attach'}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
