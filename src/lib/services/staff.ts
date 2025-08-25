export type StaffType = 'academic' | 'non_academic'

export type StaffRow = {
  staff_id: string
  staff_no: string | null
  staff_type: StaffType
  status: 'active' | 'on_leave' | 'terminated'
  hire_date: string | null
  termination_date: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  department_id: string | null
  department_name: string | null
  department_code: string | null
  position_title: string | null
}

export async function fetchStaff(params?: { type?: StaffType; dept?: string; q?: string }): Promise<StaffRow[]> {
  const usp = new URLSearchParams()
  if (params?.type) usp.set('type', params.type)
  if (params?.dept) usp.set('dept', params.dept)
  if (params?.q) usp.set('q', params.q)
  const res = await fetch(`/api/staff?${usp.toString()}`, { cache: 'no-store' })
  const j = await res.json()
  if (!j.success) throw new Error(j.error || 'Failed to load staff')
  return j.rows as StaffRow[]
}

export async function createStaff(payload: {
  staff_type: StaffType
  staff_no?: string
  person: { first_name: string; last_name: string; email: string; phone?: string }
  primary_employment?: { department_id: string; position_title?: string; start_date?: string }
}) {
  const res = await fetch('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const j = await res.json()
  if (!res.ok || !j.success) throw new Error(j.error || 'Create failed')
  return true
}
