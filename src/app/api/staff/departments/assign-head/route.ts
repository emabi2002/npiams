import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      department_id: string
      staff_id: string
      start_date?: string   // 'YYYY-MM-DD'
      make_coordinator?: boolean
    }

    if (!body.department_id || !body.staff_id) {
      return NextResponse.json({ success: false, error: 'department_id and staff_id are required' }, { status: 400 })
    }

    const sb = supabaseServer()
    const { error } = await sb.rpc('assign_department_head', {
      p_department_id: body.department_id,
      p_staff_id: body.staff_id,
      p_start_date: body.start_date ?? null,
      p_make_coordinator: !!body.make_coordinator,
    })
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
