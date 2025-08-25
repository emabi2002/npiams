import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

export const revalidate = 0
export const dynamic = 'force-dynamic'

/* ──────────────────────────────────────────────────────────────
   Types (optionals instead of unions with null)
   ────────────────────────────────────────────────────────────── */
type Person = {
  first_name?: string
  last_name?: string
  email?: string
}

type Staff = {
  id: string
  person?: Person
}

type ProgramRole = {
  id: string
  role: string
  start_date?: string
  end_date?: string | null
  staff?: Staff
}

type Department = {
  id: string
  name?: string
  code?: string | null
}

type ProgramRow = {
  id: string
  name: string
  code?: string | null
  department_id?: string | null
  department?: Department
  roles?: ProgramRole[]
}

/* ──────────────────────────────────────────────────────────────
   GET /api/programs
   Query params:
   - q: string        (search across program/department/coordinator)
   - dept: string     (department_id filter)
   - limit: number    (pagination; default 200)
   - offset: number   (pagination; default 0)
   ────────────────────────────────────────────────────────────── */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').trim().toLowerCase()
    const dept = searchParams.get('dept') ?? undefined

    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '200', 10) || 200, 1),
      1000,
    )
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

    const sb = supabaseServer()

    // Keep LEFT JOIN semantics; compute "current coordinator" in JS
    const sel = `
      id, name, code, department_id,
      department:department_id ( id, name, code ),
      roles:program_roles (
        id, role, start_date, end_date,
        staff:staff_id (
          id,
          person:person_id ( first_name, last_name, email )
        )
      )
    ` as const

    // 👇 Type the response here to eliminate the squiggle later
    const { data, error } = await sb
      .from('programs')
      .select(sel)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)
      .returns<ProgramRow[]>()

    if (error) throw error

    // No cast needed anymore
    const list: ProgramRow[] = data ?? []

    const rows = list.map((p) => {
      const roles = p.roles ?? []

      // current coordinator = coordinator with no end_date
      const current = roles.find((r) => r?.role === 'coordinator' && !r?.end_date)

      const sp = current?.staff?.person
      const coordinator_name = sp
        ? `${sp.first_name ?? ''} ${sp.last_name ?? ''}`.trim().replace(/\s+/g, ' ')
        : null
      const coordinator_email = sp?.email ?? null

      return {
        id: p.id,
        name: p.name,
        code: p.code ?? null,
        department_id: p.department_id ?? null,
        department_name: p.department?.name ?? null,
        department_code: p.department?.code ?? null,
        coordinator_name,
        coordinator_email,
        coordinator_start: current?.start_date ?? null,
      }
    })

    // Apply in-memory filters (safe post-pagination)
    let filtered = rows

    if (dept) {
      filtered = filtered.filter((r) => r.department_id === dept)
    }

    if (q) {
      const qq = q.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          (r.name ?? '').toLowerCase().includes(qq) ||
          (r.code ?? '').toLowerCase().includes(qq) ||
          (r.department_name ?? '').toLowerCase().includes(qq) ||
          (r.coordinator_name ?? '').toLowerCase().includes(qq),
      )
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      rows: filtered,
    })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? 'Unexpected error' },
      { status: 400 },
    )
  }
}
