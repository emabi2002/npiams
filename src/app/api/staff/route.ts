import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

/**
 * GET /api/staff?type=academic|non_academic&dept=<uuid>&q=<search>
 * Returns rows from v_staff_summary (live DB view).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'academic' | 'non_academic' | null
    const dept = searchParams.get('dept')
    const q = searchParams.get('q')

    const sb = supabaseServer()
    let query = sb.from('v_staff_summary').select('*')

    if (type) query = query.eq('staff_type', type)
    if (dept) query = query.eq('department_id', dept)
    if (q && q.trim()) {
      const like = `%${q.trim()}%`
      // OR across first/last/email/staff_no
      query = query.or(
        `first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},staff_no.ilike.${like}`
      )
    }

    const { data, error } = await query.order('last_name', { ascending: true })
    if (error) throw error
    return NextResponse.json({ success: true, rows: data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}

/**
 * POST /api/staff
 * Body:
 * {
 *   staff_type: 'academic'|'non_academic',
 *   staff_no?: string,
 *   person: { first_name, last_name, email, phone? },
 *   primary_employment?: { department_id: string, position_title?: string, start_date?: string }
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      staff_type: 'academic' | 'non_academic',
      staff_no?: string,
      person: { first_name: string, last_name: string, email: string, phone?: string },
      primary_employment?: { department_id: string, position_title?: string, start_date?: string }
    }

    const sb = supabaseServer()

    // 1) Upsert person (email unique)
    const { data: person, error: pErr } = await sb
      .from('people')
      .upsert([body.person], { onConflict: 'email' })
      .select('id')
      .single()
    if (pErr) throw pErr

    // 2) Insert staff row
    const { data: staff, error: sErr } = await sb
      .from('staff')
      .insert([{ person_id: person.id, staff_type: body.staff_type, staff_no: body.staff_no ?? null }])
      .select('id')
      .single()
    if (sErr) throw sErr

    // 3) Optional primary employment
    if (body.primary_employment?.department_id) {
      const emp = body.primary_employment
      const { error: eErr } = await sb.from('staff_employments').insert([{
        staff_id: staff.id,
        department_id: emp.department_id,
        position_title: emp.position_title ?? null,
        is_primary: true,
        start_date: emp.start_date ?? null,
      }])
      if (eErr) throw eErr
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
