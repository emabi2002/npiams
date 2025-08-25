'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Building2, Search, Users, BookOpen, UserCheck, Crown, Shield } from 'lucide-react'

type DeptRow = {
  id: string
  name: string
  code: string | null
  head_name: string | null
  head_email: string | null
  courses_count: number
  staff_count: number
  students_count: number
  description?: string | null
  category: 'academic' | 'administration' | 'service'   // <-- added
}

type StaffOption = {
  staff_id: string
  first_name: string
  last_name: string
  email: string
  staff_type: 'academic'|'non_academic'
  department_name: string | null
  department_code: string | null
}

export default function DepartmentsPage() {
  const { user } = useAuth()
  const canManageDepartments = user?.role === 'admin'

  const [rows, setRows] = useState<DeptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Assign Head dialog
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignDept, setAssignDept] = useState<DeptRow | null>(null)
  const [staffQ, setStaffQ] = useState('')
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')

  useEffect(() => { refresh() }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/departments', { cache: 'no-store' })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Failed to load departments')
      setRows(j.rows as DeptRow[])
    } catch (e) {
      console.error(e)
      alert('Failed to load departments. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return rows
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.code ?? '').toLowerCase().includes(q) ||
      (r.head_name ?? '').toLowerCase().includes(q) ||
      (r.head_email ?? '').toLowerCase().includes(q)
    )
  }, [rows, search])

  const searchStaff = async (q: string) => {
    setStaffLoading(true)
    try {
      const usp = new URLSearchParams()
      if (q && q.trim()) usp.set('q', q.trim())
      // ⬇️ If the department is academic, only fetch academic staff
      if (assignDept?.category === 'academic') usp.set('type', 'academic')

      const r = await fetch(`/api/staff?${usp.toString()}`, { cache: 'no-store' })
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Failed to search staff')
      const opts = (j.rows as any[]).map(s => ({
        staff_id: s.staff_id,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        staff_type: s.staff_type,
        department_name: s.department_name,
        department_code: s.department_code
      })) as StaffOption[]
      setStaffOptions(opts)
    } catch (e) {
      console.error(e)
      alert('Failed to search staff')
    } finally {
      setStaffLoading(false)
    }
  }

  useEffect(() => {
    if (assignOpen) {
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      setStartDate(`${y}-${m}-${d}`)
      setSelectedStaffId('')
      setStaffQ('')
      setStaffOptions([])
    }
  }, [assignOpen])

  const onOpenAssign = (dept: DeptRow) => {
    setAssignDept(dept)
    setAssignOpen(true)
  }

  const onAssignHead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignDept || !selectedStaffId) {
      alert('Please select a staff member.')
      return
    }
    try {
      const res = await fetch('/api/departments/assign-head', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: assignDept.id,
          staff_id: selectedStaffId,
          start_date: startDate || undefined
        })
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.error || 'Failed to assign head')
      setAssignOpen(false)
      await refresh()
      alert('Department head assigned successfully.')
    } catch (e: any) {
      console.error(e)
      alert(e.message || 'Failed to assign head')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading departments…</p>
          </div>
        </div>
      </div>
    )
  }

  const totalCourses = filtered.reduce((s, r) => s + (r.courses_count || 0), 0)
  const totalStaff   = filtered.reduce((s, r) => s + (r.staff_count || 0), 0)
  const withHeads    = filtered.filter(r => !!r.head_name).length

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Departments
          </h1>
          <p className="text-gray-600 mt-2">Manage academic & administrative departments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filtered.length}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">Primary attachments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Heads</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{withHeads}</div>
            <p className="text-xs text-muted-foreground">Have current head</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Departments</CardTitle>
          <CardDescription>Find by name, code, or current head</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search departments…" value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments ({filtered.length})</CardTitle>
          <CardDescription>Live from v_department_summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Students</TableHead>
                  {canManageDepartments && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManageDepartments ? 8 : 7} className="text-center py-8 text-muted-foreground">
                      No departments found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-medium">{d.name}</div>
                      {d.description ? <div className="text-sm text-muted-foreground">{d.description}</div> : null}
                    </TableCell>
                    <TableCell><Badge variant="outline">{d.code ?? '—'}</Badge></TableCell>
                    <TableCell>
                      {d.head_name ? (
                        <>
                          <div className="font-medium">{d.head_name}</div>
                          {d.head_email && <div className="text-xs text-muted-foreground">{d.head_email}</div>}
                        </>
                      ) : <span className="text-muted-foreground">No head assigned</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{d.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{d.courses_count}</TableCell>
                    <TableCell>{d.staff_count}</TableCell>
                    <TableCell>{d.students_count}</TableCell>
                    {canManageDepartments && (
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => onOpenAssign(d)}>
                          <Crown className="h-4 w-4 mr-2" />
                          Assign Head
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Head Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Department Head</DialogTitle>
            <DialogDescription>
              {assignDept ? (
                <>
                  Set the head for <strong>{assignDept.name}</strong>.&nbsp;
                  {assignDept.category === 'academic' && (
                    <span className="text-orange-600 font-medium">
                      Academic department: only academic staff are eligible.
                    </span>
                  )}
                </>
              ) : 'Select a department head'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onAssignHead} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="staffQ">Find Staff</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="staffQ"
                    className="pl-9"
                    placeholder={assignDept?.category === 'academic' ? 'Search academic staff…' : 'Search staff…'}
                    value={staffQ}
                    onChange={(e)=>setStaffQ(e.target.value)}
                    onKeyDown={(e)=>{ if (e.key==='Enter'){ e.preventDefault(); searchStaff(staffQ); } }}
                  />
                </div>
                <div className="mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={()=>searchStaff(staffQ)} disabled={staffLoading}>
                    {staffLoading ? 'Searching…' : 'Search'}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="start">Start Date</Label>
                <Input id="start" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
              </div>
            </div>

            <div className="max-h-64 overflow-auto rounded border">
              {staffOptions.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No results yet. Search to find staff.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pick</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Current Dept</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffOptions.map(s => (
                      <TableRow key={s.staff_id} className="hover:bg-gray-50">
                        <TableCell className="w-16">
                          <input
                            type="radio"
                            name="selectedStaff"
                            value={s.staff_id}
                            checked={selectedStaffId === s.staff_id}
                            onChange={()=>setSelectedStaffId(s.staff_id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.staff_type === 'academic' ? 'Academic' : 'Non-Academic'}</Badge>
                        </TableCell>
                        <TableCell>
                          {s.department_name ? `${s.department_name}${s.department_code ? ` (${s.department_code})` : ''}` : '—'}
                        </TableCell>
                        <TableCell>{s.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={()=>setAssignOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!selectedStaffId}>Assign Head</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
