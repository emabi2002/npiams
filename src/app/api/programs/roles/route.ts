import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

/** DB row shapes for our nested select */
type PersonDB = {
  first_name: string | null
  last_name: string | null
  email: string | null
} | null

type StaffDB = {
  id: string
  person: PersonDB
} | null

type ProgramRoleRow = {
  id: string
  role: string
  start_date: string | null
  end_date: string | null
  staff: StaffDB
}

/**
 * GET /api/programs/roles?program_id=<uuid>
 * Returns coordinator role history (current + past)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const program_id = searchParams.get('program_id')
    if (!program_id) {
      return NextResponse.json(
        { success: false, error: 'program_id is required' },
        { status: 400 }
      )
    }

    const sb = supabaseServer()
    const { data, error } = await sb
      .from('program_roles')
      .select(`
        id, role, start_date, end_date,
        staff:staff_id (
          id,
          person:person_id ( first_name, last_name, email )
        )
      `)
      .eq('program_id', program_id)
      .eq('role', 'coordinator')
      .order('start_date', { ascending: false })

    if (error) throw error

    // Coerce safely and silence TS complaints on the cast
    const list: ProgramRoleRow[] = (data ?? []) as unknown as ProgramRoleRow[]

    const rows = list.map((r) => {
      const person = r.staff?.person
      const name = person
        ? `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim()
        : null
      const email = person?.email ?? null

      return {
        id: r.id,
        start_date: r.start_date ?? null,
        end_date: r.end_date ?? null,
        name,
        email,
        is_current: !r.end_date,
      }
    })

    return NextResponse.json({ success: true, rows })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
