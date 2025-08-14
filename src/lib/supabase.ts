import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  role: 'admin' | 'staff' | 'student'
  full_name: string
  created_at: string
}

export interface Department {
  id: string
  name: string
  head: string
  description?: string
  created_at: string
}

export interface Program {
  id: string
  name: string
  department_id: string
  duration_years: number
  description?: string
  created_at: string
}

export interface Course {
  id: string
  name: string
  code: string
  program_id: string
  credits: number
  semester: number
  description?: string
  created_at: string
}

export interface Student {
  id: string
  student_id: string
  full_name: string
  email: string
  phone?: string
  address?: string
  program_id: string
  status: 'active' | 'graduated' | 'suspended' | 'withdrawn'
  enrollment_date: string
  created_at: string
}

export interface Application {
  id: string
  applicant_name: string
  email: string
  phone?: string
  address?: string
  program_id: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  documents?: string[]
  applied_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface Assessment {
  id: string
  title: string
  course_id: string
  type: 'exam' | 'assignment' | 'project' | 'quiz'
  total_marks: number
  date: string
  created_at: string
}

export interface Grade {
  id: string
  student_id: string
  assessment_id: string
  marks_obtained: number
  grade: string
  remarks?: string
  graded_at: string
  graded_by: string
}
