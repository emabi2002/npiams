import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/db'

/**
 * POST /api/programs/assign-coordinator
 * Body: { program_id: string, staff_id: string, start_date?: string }
 * - closes any open coordinator role
 * - inserts new coordinator role
 */
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      program_id: string
      staff_id: string
      start_date?: string
    }
    if (!body.program_id || !body.staff_id) {
      return NextResponse.json({ success: false, error: 'program_id and staff_id are required' }, { status: 400 })
    }
    const startDate = body.start_date ?? new Date().toISOString().slice(0, 10)

    const sb = supabaseServer()

    // 1) Close any open coordinator role
    const { error: updErr } = await sb
      .from('program_roles')
      .update({ end_date: startDate })
      .eq('program_id', body.program_id)
      .eq('role', 'coordinator')
      .is('end_date', null)
    if (updErr) throw updErr

    // 2) Insert new coordinator role
    const { error: insErr } = await sb
      .from('program_roles')
      .insert([{
        program_id: body.program_id,
        staff_id: body.staff_id,
        role: 'coordinator',
        start_date: startDate,
      }])
    if (insErr) throw insErr

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
