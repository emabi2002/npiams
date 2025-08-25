import { supabaseServer } from '@/lib/db'

export type DepartmentSummary = {
  id: string
  name: string
  code: string | null
  head_name: string | null
  head_email: string | null
  courses_count: number
  staff_count: number
  students_count: number
}

/** Read live rows from DB (no caching so changes show immediately) */
export async function getDepartmentsSummary(): Promise<DepartmentSummary[]> {
  const sb = supabaseServer()
  const { data, error } = await sb
    .from('v_department_summary')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as DepartmentSummary[]
}
