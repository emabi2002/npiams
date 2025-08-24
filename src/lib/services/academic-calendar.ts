import { supabase } from '@/lib/supabase'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface AcademicYear {
  id: string
  year_code: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface AcademicSemester {
  id: string
  academic_year_id: string
  semester_code: string
  semester_name: string
  semester_number: number
  start_date: string
  end_date: string
  is_current: boolean
  is_active: boolean
  total_weeks: number
  description?: string
  created_at: string
  updated_at: string
  academic_year?: AcademicYear
}

export interface AcademicWeek {
  id: string
  semester_id: string
  week_number: number
  week_name: string
  start_date: string
  end_date: string
  week_type: 'teaching' | 'break' | 'exam' | 'orientation'
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface AcademicSession {
  id: string
  semester_id: string
  session_name: string
  session_type: 'orientation' | 'teaching' | 'break' | 'exam' | 'registration'
  start_date: string
  end_date: string
  start_week?: number
  end_week?: number
  is_mandatory: boolean
  color_code: string
  description?: string
  created_at: string
  updated_at: string
}

export interface AcademicEvent {
  id: string
  academic_year_id?: string
  semester_id?: string
  week_id?: string
  event_name: string
  event_type: 'holiday' | 'deadline' | 'exam' | 'registration' | 'orientation'
  event_date: string
  end_date?: string
  is_institution_wide: boolean
  department_id?: string
  program_id?: string
  course_id?: string
  priority_level: number
  color_code: string
  description?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CurrentAcademicContext {
  academic_year_id: string
  year_code: string
  year_name: string
  semester_id: string
  semester_code: string
  semester_name: string
  semester_number: number
  semester_start: string
  semester_end: string
  total_weeks: number
}

export interface CreateAcademicYearData {
  year_code: string
  year_name: string
  start_date: string
  end_date: string
  description?: string
}

export interface CreateSemesterData {
  academic_year_id: string
  semester_code: string
  semester_name: string
  semester_number: number
  start_date: string
  end_date: string
  total_weeks: number
  description?: string
}

export interface CreateSessionData {
  semester_id: string
  session_name: string
  session_type: 'orientation' | 'teaching' | 'break' | 'exam' | 'registration'
  start_date: string
  end_date: string
  start_week?: number
  end_week?: number
  is_mandatory?: boolean
  color_code?: string
  description?: string
}

export interface CreateEventData {
  academic_year_id?: string
  semester_id?: string
  week_id?: string
  event_name: string
  event_type: 'holiday' | 'deadline' | 'exam' | 'registration' | 'orientation'
  event_date: string
  end_date?: string
  is_institution_wide?: boolean
  department_id?: string
  program_id?: string
  course_id?: string
  priority_level?: number
  color_code?: string
  description?: string
  created_by?: string
}

// =============================================================================
// ACADEMIC CALENDAR SERVICE
// =============================================================================

export class AcademicCalendarService {

  // ==================== ACADEMIC YEARS ====================

  /**
   * Get all academic years
   */
  static async getAllAcademicYears(): Promise<AcademicYear[]> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('year_code', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching academic years:', error)
      throw new Error(`Failed to fetch academic years: ${error.message}`)
    }
  }

  /**
   * Get current academic year
   */
  static async getCurrentAcademicYear(): Promise<AcademicYear | null> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_current', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error: any) {
      console.error('Error fetching current academic year:', error)
      return null
    }
  }

  /**
   * Create new academic year
   */
  static async createAcademicYear(yearData: CreateAcademicYearData): Promise<AcademicYear> {
    try {
      // Check if year code already exists
      const { data: existing } = await supabase
        .from('academic_years')
        .select('year_code')
        .eq('year_code', yearData.year_code)
        .single()

      if (existing) {
        throw new Error(`Academic year ${yearData.year_code} already exists`)
      }

      const { data, error } = await supabase
        .from('academic_years')
        .insert([yearData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating academic year:', error)
      throw new Error(`Failed to create academic year: ${error.message}`)
    }
  }

  /**
   * Set current academic year
   */
  static async setCurrentAcademicYear(yearId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_current_academic_year', {
        p_year_id: yearId
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Error setting current academic year:', error)
      throw new Error(`Failed to set current academic year: ${error.message}`)
    }
  }

  // ==================== ACADEMIC SEMESTERS ====================

  /**
   * Get semesters for academic year
   */
  static async getSemestersByYear(academicYearId: string): Promise<AcademicSemester[]> {
    try {
      const { data, error } = await supabase
        .from('academic_semesters')
        .select(`
          *,
          academic_year:academic_years(*)
        `)
        .eq('academic_year_id', academicYearId)
        .order('semester_number')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching semesters:', error)
      throw new Error(`Failed to fetch semesters: ${error.message}`)
    }
  }

  /**
   * Get current semester
   */
  static async getCurrentSemester(): Promise<AcademicSemester | null> {
    try {
      const { data, error } = await supabase
        .from('academic_semesters')
        .select(`
          *,
          academic_year:academic_years(*)
        `)
        .eq('is_current', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error: any) {
      console.error('Error fetching current semester:', error)
      return null
    }
  }

  /**
   * Create new semester
   */
  static async createSemester(semesterData: CreateSemesterData): Promise<AcademicSemester> {
    try {
      const { data, error } = await supabase
        .from('academic_semesters')
        .insert([semesterData])
        .select(`
          *,
          academic_year:academic_years(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating semester:', error)
      throw new Error(`Failed to create semester: ${error.message}`)
    }
  }

  /**
   * Set current semester
   */
  static async setCurrentSemester(semesterId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_current_semester', {
        p_semester_id: semesterId
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Error setting current semester:', error)
      throw new Error(`Failed to set current semester: ${error.message}`)
    }
  }

  /**
   * Generate weeks for semester
   */
  static async generateWeeks(semesterId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('generate_academic_weeks', {
        p_semester_id: semesterId
      })

      if (error) throw error
      return data || 0
    } catch (error: any) {
      console.error('Error generating weeks:', error)
      throw new Error(`Failed to generate weeks: ${error.message}`)
    }
  }

  // ==================== ACADEMIC WEEKS ====================

  /**
   * Get weeks for semester
   */
  static async getWeeksBySemester(semesterId: string): Promise<AcademicWeek[]> {
    try {
      const { data, error } = await supabase
        .from('academic_weeks')
        .select('*')
        .eq('semester_id', semesterId)
        .order('week_number')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching weeks:', error)
      throw new Error(`Failed to fetch weeks: ${error.message}`)
    }
  }

  /**
   * Update week type
   */
  static async updateWeekType(weekId: string, weekType: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('academic_weeks')
        .update({
          week_type: weekType,
          updated_at: new Date().toISOString()
        })
        .eq('id', weekId)

      if (error) throw error
    } catch (error: any) {
      console.error('Error updating week type:', error)
      throw new Error(`Failed to update week type: ${error.message}`)
    }
  }

  // ==================== ACADEMIC SESSIONS ====================

  /**
   * Get sessions for semester
   */
  static async getSessionsBySemester(semesterId: string): Promise<AcademicSession[]> {
    try {
      const { data, error } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('semester_id', semesterId)
        .order('start_date')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching sessions:', error)
      throw new Error(`Failed to fetch sessions: ${error.message}`)
    }
  }

  /**
   * Create new session
   */
  static async createSession(sessionData: CreateSessionData): Promise<AcademicSession> {
    try {
      const { data, error } = await supabase
        .from('academic_sessions')
        .insert([{
          ...sessionData,
          is_mandatory: sessionData.is_mandatory ?? false,
          color_code: sessionData.color_code ?? '#3B82F6'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating session:', error)
      throw new Error(`Failed to create session: ${error.message}`)
    }
  }

  /**
   * Update session
   */
  static async updateSession(sessionId: string, updates: Partial<AcademicSession>): Promise<void> {
    try {
      const { error } = await supabase
        .from('academic_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) throw error
    } catch (error: any) {
      console.error('Error updating session:', error)
      throw new Error(`Failed to update session: ${error.message}`)
    }
  }

  /**
   * Delete session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('academic_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting session:', error)
      throw new Error(`Failed to delete session: ${error.message}`)
    }
  }

  // ==================== ACADEMIC EVENTS ====================

  /**
   * Get events for date range
   */
  static async getEventsByDateRange(startDate: string, endDate: string): Promise<AcademicEvent[]> {
    try {
      const { data, error } = await supabase
        .from('academic_events')
        .select('*')
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching events:', error)
      throw new Error(`Failed to fetch events: ${error.message}`)
    }
  }

  /**
   * Create new event
   */
  static async createEvent(eventData: CreateEventData): Promise<AcademicEvent> {
    try {
      const { data, error } = await supabase
        .from('academic_events')
        .insert([{
          ...eventData,
          is_institution_wide: eventData.is_institution_wide ?? true,
          priority_level: eventData.priority_level ?? 1,
          color_code: eventData.color_code ?? '#EF4444'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating event:', error)
      throw new Error(`Failed to create event: ${error.message}`)
    }
  }

  // ==================== CURRENT CONTEXT ====================

  /**
   * Get current academic context (year + semester)
   */
  static async getCurrentContext(): Promise<CurrentAcademicContext | null> {
    try {
      const { data, error } = await supabase
        .from('current_academic_context')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error: any) {
      console.error('Error fetching current context:', error)
      return null
    }
  }

  // ==================== CALENDAR OVERVIEW ====================

  /**
   * Get academic calendar overview
   */
  static async getCalendarOverview(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('academic_calendar_overview')
        .select('*')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching calendar overview:', error)
      throw new Error(`Failed to fetch calendar overview: ${error.message}`)
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if date falls within semester
   */
  static async isDateInSemester(date: string, semesterId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('academic_semesters')
        .select('start_date, end_date')
        .eq('id', semesterId)
        .single()

      if (error) throw error

      const targetDate = new Date(date)
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)

      return targetDate >= startDate && targetDate <= endDate
    } catch (error: any) {
      console.error('Error checking date in semester:', error)
      return false
    }
  }

  /**
   * Get week number for a given date in semester
   */
  static async getWeekNumberForDate(date: string, semesterId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('academic_weeks')
        .select('week_number')
        .eq('semester_id', semesterId)
        .lte('start_date', date)
        .gte('end_date', date)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.week_number || null
    } catch (error: any) {
      console.error('Error getting week number:', error)
      return null
    }
  }
}
