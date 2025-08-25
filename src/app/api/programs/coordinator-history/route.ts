import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const programId = searchParams.get('program_id')
    if (!programId) {
      return NextResponse.json({ success: false, error: 'program_id is required' }, { status: 400 })
    }

    const sb = supabaseServer()
    const { data, error } = await sb
      .from('program_roles')
      .select(`
        id, role, start_date, end_date,
        staff:staff_id (
          id,
          staff_type,
          person:person_id ( first_name, last_name, email )
        )
      `)
      .eq('program_id', programId)
      .ilike('role', 'coordinator')
      .order('start_date', { ascending: false })

    if (error) throw error

    const rows = (data || []).map((r: any) => ({
      id: r.id,
      role: r.role,
      start_date: r.start_date,
      end_date: r.end_date,
      staff_id: r.staff?.id,
      staff_type: r.staff?.staff_type,
      name: r.staff?.person ? `${r.staff.person.first_name} ${r.staff.person.last_name}` : null,
      email: r.staff?.person?.email ?? null,
    }))

    return NextResponse.json({ success: true, rows })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
