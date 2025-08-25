import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

/**
 * POST /api/staff/employments
 * Body: { staff_id, department_id, position_title?, start_date?, is_primary?: boolean }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      staff_id: string
      department_id: string
      position_title?: string
      start_date?: string
      is_primary?: boolean
    }

    if (!body.staff_id || !body.department_id) {
      return NextResponse.json({ success: false, error: 'staff_id and department_id are required' }, { status: 400 })
    }

    // default to non-primary for "Attach dept" flow
    const isPrimary = body.is_primary === true

    const sb = supabaseServer()
    const { error } = await sb.from('staff_employments').insert([{
      staff_id: body.staff_id,
      department_id: body.department_id,
      position_title: body.position_title ?? null,
      start_date: body.start_date ?? null,
      is_primary: isPrimary,
    }])

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
