import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

// Shape of the nested row Supabase returns for the current head
type HeadRow = {
  staff_id: string
  start_date: string | null
  end_date: string | null
  staff: {
    id: string
    staff_type: 'academic' | 'non_academic' | null
    person: {
      first_name: string | null
      last_name: string | null
      email: string | null
    } | null
  } | null
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get('department_id')

    if (!departmentId) {
      return NextResponse.json(
        { success: false, error: 'department_id is required' },
        { status: 400 }
      )
    }

    const sb = supabaseServer()
    const { data, error } = await sb
      .from('department_heads')
      .select(
        `
        staff_id,
        start_date,
        end_date,
        staff:staff_id (
          id,
          staff_type,
          person:person_id (
            first_name,
            last_name,
            email
          )
        )
      `
      )
      .eq('department_id', departmentId)
      .is('end_date', null) // current head only
      .order('start_date', { ascending: false })
      .limit(1)
      .returns<HeadRow[]>()

    if (error) throw error

    const row = data?.[0] ?? null
    if (!row) {
      return NextResponse.json(
        { success: true, row: null },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const first = row.staff?.person?.first_name ?? ''
    const last = row.staff?.person?.last_name ?? ''
    const name = first || last ? `${first} ${last}`.trim() : null

    return NextResponse.json(
      {
        success: true,
        row: {
          staff_id: row.staff_id,
          name,
          email: row.staff?.person?.email ?? null,
          staff_type: row.staff?.staff_type ?? null,
          start_date: row.start_date ?? null,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 400 }
    )
  }
}
