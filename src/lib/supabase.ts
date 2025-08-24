import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const createSupabaseClient = () => {
  return createClientComponentClient()
}

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          student_id: string
          name: string
          dob: string
          gender: 'male' | 'female' | 'other'
          address: string
          email: string
          phone: string
          program_id: string
          intake_period: string
          residency_status: 'day' | 'boarding' | 'lodging'
          biometric_data: Record<string, unknown> | null
          photo_url: string | null
          registration_status: 'pending' | 'paid' | 'verified' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          name: string
          dob: string
          gender: 'male' | 'female' | 'other'
          address: string
          email: string
          phone: string
          program_id: string
          intake_period: string
          residency_status?: 'day' | 'boarding' | 'lodging'
          biometric_data?: Record<string, unknown> | null
          photo_url?: string | null
          registration_status?: 'pending' | 'paid' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          name?: string
          dob?: string
          gender?: 'male' | 'female' | 'other'
          address?: string
          email?: string
          phone?: string
          program_id?: string
          intake_period?: string
          residency_status?: 'day' | 'boarding' | 'lodging'
          biometric_data?: Record<string, unknown> | null
          photo_url?: string | null
          registration_status?: 'pending' | 'paid' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          name: string
          code: string
          level: 'certificate' | 'diploma'
          department: string
          duration_months: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          level: 'certificate' | 'diploma'
          department: string
          duration_months: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          level?: 'certificate' | 'diploma'
          department?: string
          duration_months?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          payment_id: string
          student_id: string
          amount: number
          payment_type: 'online' | 'bank_deposit' | 'campus'
          receipt_url: string | null
          verified_by: string | null
          status: 'pending' | 'verified' | 'rejected'
          transaction_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          payment_id?: string
          student_id: string
          amount: number
          payment_type: 'online' | 'bank_deposit' | 'campus'
          receipt_url?: string | null
          verified_by?: string | null
          status?: 'pending' | 'verified' | 'rejected'
          transaction_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          payment_id?: string
          student_id?: string
          amount?: number
          payment_type?: 'online' | 'bank_deposit' | 'campus'
          receipt_url?: string | null
          verified_by?: string | null
          status?: 'pending' | 'verified' | 'rejected'
          transaction_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fees: {
        Row: {
          fee_id: string
          fee_name: string
          amount: number
          program_id: string | null
          mandatory: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          fee_id?: string
          fee_name: string
          amount: number
          program_id?: string | null
          mandatory?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          fee_id?: string
          fee_name?: string
          amount?: number
          program_id?: string | null
          mandatory?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
