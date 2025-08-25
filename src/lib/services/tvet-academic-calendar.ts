// src/lib/services/tvet-academic-calendar.ts
// Adjust this import if you use a path alias (e.g. '@/lib/supabase')
import { supabase } from '../supabase'

/* =========================================================
   Type Interfaces (keep here or import from your own types)
   ========================================================= */

export interface ProgramType {
  id: string
  code: string
  name: string
  description?: string
  default_lecturing_days: number
  default_staff_service_days: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TVETAcademicYear {
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
  program_type?: ProgramType
  total_lecturing_days?: number
  total_staff_service_days?: number
  total_terms?: number
  terms_per_semester?: number
}

export interface TVETTerm {
  id: string
  academic_year_id: string
  term_code: string
  term_name: string
  term_number: number
  semester_group: number
  lecturing_starts: string
  classes_commence: string
  lectures_end_exam_start: string
  college_closes: string
  lecturing_staff_days: number
  total_staff_service_days: number
  is_current: boolean
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
  academic_year?: TVETAcademicYear
}

export interface TVETTermWeek {
  id: string
  term_id: string
  week_number: number
  week_start_date: string
  week_end_date: string
  week_type: 'lecturing' | 'exam' | 'break' | 'orientation' | 'registration'
  is_lecturing_week: boolean
  is_staff_service_week: boolean
  lecturing_days_in_week: number
  staff_service_days_in_week: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface TVETSupplementaryPeriod {
  id: string
  academic_year_id: string
  term_id?: string
  period_name: string
  period_type: 'supplementary_exam' | 'life_skills' | 'computer_literacy'
  start_date: string
  end_date: string
  exam_period_start?: string
  exam_period_end?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CurrentTVETContext {
  academic_year_id: string
  year_code: string
  year_name: string
  program_type: string
  term_id: string
  term_code: string
  term_name: string
  term_number: number
  semester_group: number
  lecturing_starts: string
  classes_commence: string
  lectures_end_exam_start: string
  college_closes: string
  lecturing_staff_days: number
  total_staff_service_days: number
}

export interface CreateTVETYearData {
  year_code: string
  year_name: string
  start_date: string
  end_date: string
  program_type_id: string
  description?: string
}

export interface CreateTVETTermData {
  academic_year_id: string
  term_code: string
  term_name: string
  term_number: number
  semester_group: number
  lecturing_starts: string
  classes_commence: string
  lectures_end_exam_start: string
  college_closes: string
  lecturing_staff_days: number
  total_staff_service_days: number
  description?: string
}

export interface SystemConfiguration {
  institution_name?: string
  academic_year_format?: string
  default_program_type?: string
  enable_hostel_management?: boolean
  enable_fee_management?: boolean
  current_academic_year?: string
  current_semester?: string
}

/* =========================================================
   Service
   ========================================================= */

export class TVETAcademicCalendarService {
  // ==================== CONFIGURATION MANAGEMENT ====================

  /** Get all program types from database */
  static async getProgramTypes(): Promise<ProgramType[]> {
    try {
      const { data, error } = await supabase
        .from('program_types')
        .select('*')
        .eq('is_active', true)
        .order('code')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching program types:', error)
      throw new Error(`Failed to fetch program types: ${error.message || 'Unknown error'}`)
    }
  }

  /** Get system configuration (from VIEW `system_settings`) */
  static async getSystemConfiguration(): Promise<SystemConfiguration> {
    try {
      const { data, error } = await supabase
        .from('system_settings') // VIEW exposing: setting_key, setting_value (jsonb), setting_type, is_active
        .select('setting_key, setting_value, setting_type')
        .eq('is_active', true)

      if (error) throw error

      const config: Record<string, any> = {}
      const rows: any[] = Array.isArray(data) ? data : []

      for (const row of rows) {
        const type = row?.setting_type ? String(row.setting_type) : ''
        const val = row?.setting_value
        let parsed: any

        if (type === 'boolean') parsed = typeof val === 'boolean' ? val : String(val).toLowerCase() === 'true'
        else if (type === 'number') parsed = typeof val === 'number' ? val : Number(val)
        else if (type === 'string') parsed = typeof val === 'string' ? val : JSON.stringify(val)
        else if (type === 'null') parsed = null
        else parsed = val // object / array / unknown → keep as-is

        if (row?.setting_key) config[row.setting_key] = parsed
      }

      return config as SystemConfiguration
    } catch (error: any) {
      console.error('Error fetching system configuration:', error)
      throw new Error(`Failed to fetch system configuration: ${error.message || 'Unknown error'}`)
    }
  }

  /** Get dropdown options from database */
  static async getDropdownOptions(
    dropdownType: string
  ): Promise<Array<{ key: string; label: string; value: string }>> {
    try {
      const { data, error } = await supabase
        .from('dropdown_options')
        .select('option_key, option_label, option_value')
        .eq('dropdown_type', dropdownType)
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error

      return (data || []).map((item: any) => ({
        key: item.option_key,
        label: item.option_label,
        value: item.option_value || item.option_key,
      }))
    } catch (error: any) {
      console.error('Error fetching dropdown options:', error)
      throw new Error(`Failed to fetch dropdown options: ${error.message || 'Unknown error'}`)
    }
  }

  // ==================== TVET ACADEMIC YEARS ====================

  /** Get all TVET academic years with nested config */
  static async getAllTVETAcademicYears(): Promise<TVETAcademicYear[]> {
    try {
      const { data, error } = await supabase
        .from('academic_years')
        .select(`
          *,
          academic_year_config (
            total_lecturing_days,
            total_staff_service_days,
            total_terms,
            terms_per_semester
          )
        `)
        .order('year_code', { ascending: false })

      if (error) throw error

      const tvetYears: TVETAcademicYear[] = (data ?? []).map((year: any) => {
        const cfg = Array.isArray(year.academic_year_config) ? year.academic_year_config[0] : undefined

        return {
          id: year.id,
          year_code: year.year_code,
          year_name: year.year_name,
          start_date: year.start_date,
          end_date: year.end_date,
          is_current: !!year.is_current,
          is_active: year.is_active ?? true,
          description: year.description ?? '',
          created_at: year.created_at,
          updated_at: year.updated_at,

          // Config values
          total_lecturing_days: cfg?.total_lecturing_days,
          total_staff_service_days: cfg?.total_staff_service_days,
          total_terms: cfg?.total_terms,
          terms_per_semester: cfg?.terms_per_semester,
          // program_type intentionally not populated (no deep join)
        }
      })

      return tvetYears
    } catch (error: any) {
      console.error('Error fetching TVET academic years:', error)
      throw new Error(`Failed to fetch TVET academic years: ${error.message || 'Unknown error'}`)
    }
  }

  /** Get current TVET academic year */
  static async getCurrentTVETAcademicYear(): Promise<TVETAcademicYear | null> {
    try {
      const config = await this.getSystemConfiguration()

      if (config.current_academic_year) {
        const { data, error } = await supabase
          .from('academic_years')
          .select(`
            *,
            academic_year_config (
              total_lecturing_days,
              total_staff_service_days,
              total_terms,
              terms_per_semester
            )
          `)
          .eq('id', config.current_academic_year)
          .maybeSingle()

        if (!error && data) {
          const cfg = Array.isArray(data.academic_year_config) ? data.academic_year_config[0] : undefined

          return {
            id: data.id,
            year_code: data.year_code,
            year_name: data.year_name,
            start_date: data.start_date,
            end_date: data.end_date,
            is_current: true,
            is_active: data.is_active ?? true,
            description: data.description ?? '',
            created_at: data.created_at,
            updated_at: data.updated_at,

            // Config values
            total_lecturing_days: cfg?.total_lecturing_days,
            total_staff_service_days: cfg?.total_staff_service_days,
            total_terms: cfg?.total_terms,
            terms_per_semester: cfg?.terms_per_semester,
            // program_type intentionally not populated
          }
        }
      }

      const years = await this.getAllTVETAcademicYears()
      return years.length > 0 ? { ...years[0], is_current: true } : null
    } catch (error: any) {
      console.error('Error fetching current TVET academic year:', error)
      return null
    }
  }

  /** Create new TVET academic year with config */
  static async createTVETAcademicYear(yearData: CreateTVETYearData): Promise<TVETAcademicYear> {
    try {
      const { data: existing } = await supabase
        .from('academic_years')
        .select('year_code')
        .eq('year_code', yearData.year_code)
        .maybeSingle()

      if (existing) throw new Error(`TVET academic year ${yearData.year_code} already exists`)

      const { data: programType, error: programError } = await supabase
        .from('program_types')
        .select('*')
        .eq('id', yearData.program_type_id)
        .single()

      if (programError || !programType) throw new Error('Invalid program type selected')

      const { data: academicYear, error: yearError } = await supabase
        .from('academic_years')
        .insert([{
          year_code: yearData.year_code,
          year_name: yearData.year_name,
          start_date: yearData.start_date,
          end_date: yearData.end_date,
          description: yearData.description,
        }])
        .select()
        .single()

      if (yearError) throw yearError

      const { error: configError } = await supabase
        .from('academic_year_config')
        .insert([{
          academic_year_id: academicYear.id,
          program_type_id: yearData.program_type_id,
          total_lecturing_days: programType.default_lecturing_days,
          total_staff_service_days: programType.default_staff_service_days,
          total_terms: 4,
          terms_per_semester: 2,
        }])

      if (configError) throw configError

      return {
        ...academicYear,
        program_type: programType,
        total_lecturing_days: programType.default_lecturing_days,
        total_staff_service_days: programType.default_staff_service_days,
        total_terms: 4,
        terms_per_semester: 2,
        is_active: true,
      }
    } catch (error: any) {
      console.error('Error creating TVET academic year:', error)
      throw new Error(`Failed to create TVET academic year: ${error.message || 'Unknown error'}`)
    }
  }

  /** Set current TVET academic year */
  static async setCurrentTVETAcademicYear(yearId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_system_setting', {
        p_setting_key: 'current_academic_year',
        p_setting_value: yearId,
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Error setting current TVET academic year:', error)
      throw new Error(`Failed to set current TVET academic year: ${error.message || 'Unknown error'}`)
    }
  }

  // ==================== TVET TERMS ====================

  /** Get terms for an academic year */
  static async getTVETTermsByYear(academicYearId: string): Promise<TVETTerm[]> {
    try {
      const { data, error } = await supabase
        .from('academic_semesters')
        .select(`
          *,
          term_config (*),
          academic_years (*)
        `)
        .eq('academic_year_id', academicYearId)
        .order('semester_number')

      if (error) throw error

      const tvetTerms: TVETTerm[] = (data || []).map((semester: any) => {
        const termConfig = semester.term_config?.[0]
        return {
          id: semester.id,
          academic_year_id: semester.academic_year_id,
          term_code: semester.semester_code,
          term_name: semester.semester_name,
          term_number: termConfig?.term_number || semester.semester_number,
          semester_group: termConfig?.semester_group || Math.ceil(semester.semester_number / 2),
          lecturing_starts: termConfig?.lecturing_starts || semester.start_date,
          classes_commence: termConfig?.classes_commence || semester.start_date,
          lectures_end_exam_start: termConfig?.lectures_end_exam_start || semester.end_date,
          college_closes: termConfig?.college_closes || semester.end_date,
          lecturing_staff_days: termConfig?.lecturing_staff_days || 0,
          total_staff_service_days: termConfig?.total_staff_service_days || 0,
          is_current: semester.is_current || false,
          is_active: semester.is_active || true,
          description: semester.description || '',
          created_at: semester.created_at,
          updated_at: semester.updated_at,
          academic_year: semester.academic_years,
        }
      })

      return tvetTerms
    } catch (error: any) {
      console.error('Error fetching TVET terms:', error)
      throw new Error(`Failed to fetch TVET terms: ${error.message || 'Unknown error'}`)
    }
  }

  /** Set current TVET term */
  static async setCurrentTVETTerm(termId: string): Promise<void> {
    try {
      // Clear current flags except the one we're about to set
      await supabase.from('academic_semesters').update({ is_current: false }).neq('id', termId)

      const { error } = await supabase
        .from('academic_semesters')
        .update({ is_current: true })
        .eq('id', termId)

      if (error) throw error

      await supabase.rpc('set_system_setting', {
        p_setting_key: 'current_semester',
        p_setting_value: termId,
      })
    } catch (error: any) {
      console.error('Error setting current TVET term:', error)
      throw new Error(`Failed to set current TVET term: ${error.message || 'Unknown error'}`)
    }
  }

  /** Get weeks for a term */
  static async getTVETWeeksByTerm(termId: string): Promise<TVETTermWeek[]> {
    try {
      const { data, error } = await supabase
        .from('tvet_term_weeks')
        .select('*')
        .eq('term_id', termId)
        .order('week_number')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching TVET term weeks:', error)
      return []
    }
  }

  /** Get supplementary periods for an academic year */
  static async getTVETSupplementaryPeriods(academicYearId: string): Promise<TVETSupplementaryPeriod[]> {
    try {
      const { data, error } = await supabase
        .from('tvet_supplementary_periods')
        .select('*')
        .eq('academic_year_id', academicYearId)
        .order('start_date')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching TVET supplementary periods:', error)
      return []
    }
  }

  /** Create a term */
  static async createTVETTerm(termData: CreateTVETTermData): Promise<TVETTerm> {
    try {
      const { data: semester, error: semesterError } = await supabase
        .from('academic_semesters')
        .insert([{
          academic_year_id: termData.academic_year_id,
          semester_code: termData.term_code,
          semester_name: termData.term_name,
          semester_number: termData.term_number,
          start_date: termData.lecturing_starts,
          end_date: termData.college_closes,
          total_weeks: Math.ceil(
            (new Date(termData.college_closes).getTime() - new Date(termData.lecturing_starts).getTime()) /
            (1000 * 60 * 60 * 24 * 7)
          ),
          description: termData.description,
          is_current: false,
          is_active: true,
        }])
        .select()
        .single()

      if (semesterError) throw semesterError

      const { error: configError } = await supabase
        .from('term_config')
        .insert([{
          semester_id: semester.id,
          term_number: termData.term_number,
          semester_group: termData.semester_group,
          lecturing_starts: termData.lecturing_starts,
          classes_commence: termData.classes_commence,
          lectures_end_exam_start: termData.lectures_end_exam_start,
          college_closes: termData.college_closes,
          lecturing_staff_days: termData.lecturing_staff_days,
          total_staff_service_days: termData.total_staff_service_days,
        }])

      if (configError) throw configError

      return {
        id: semester.id,
        academic_year_id: semester.academic_year_id,
        term_code: semester.semester_code,
        term_name: semester.semester_name,
        term_number: termData.term_number,
        semester_group: termData.semester_group,
        lecturing_starts: termData.lecturing_starts,
        classes_commence: termData.classes_commence,
        lectures_end_exam_start: termData.lectures_end_exam_start,
        college_closes: termData.college_closes,
        lecturing_staff_days: termData.lecturing_staff_days,
        total_staff_service_days: termData.total_staff_service_days,
        is_current: false,
        is_active: true,
        description: termData.description || '',
        created_at: semester.created_at,
        updated_at: semester.updated_at,
      }
    } catch (error: any) {
      console.error('Error creating TVET term:', error)
      throw new Error(`Failed to create TVET term: ${error.message || 'Unknown error'}`)
    }
  }

  // ==================== CALENDAR OVERVIEW ====================

  /** Flattened “overview” for UI tables */
  static async getTVETCalendarOverview(): Promise<any[]> {
    try {
      const years = await this.getAllTVETAcademicYears()
      const overview: any[] = []

      for (const year of years) {
        const terms = await this.getTVETTermsByYear(year.id)
        for (const term of terms) {
          overview.push({
            year_code: year.year_code,
            year_name: year.year_name,
            program_type: year.program_type?.code || 'Unknown',
            term_name: term.term_name,
            term_number: term.term_number,
            semester_group: term.semester_group,
            lecturing_starts: term.lecturing_starts,
            classes_commence: term.classes_commence,
            lectures_end_exam_start: term.lectures_end_exam_start,
            college_closes: term.college_closes,
            lecturing_staff_days: term.lecturing_staff_days,
            total_staff_service_days: term.total_staff_service_days,
            weeks_configured: 0,
          })
        }
      }

      return overview
    } catch (error: any) {
      console.error('Error fetching TVET calendar overview:', error)
      throw new Error(`Failed to fetch TVET calendar overview: ${error.message || 'Unknown error'}`)
    }
  }

  // ==================== CURRENT CONTEXT ====================

  /** Current context (year + current/first term) */
  static async getCurrentTVETContext(): Promise<CurrentTVETContext | null> {
    try {
      const [year, config] = await Promise.all([
        this.getCurrentTVETAcademicYear(),
        this.getSystemConfiguration(),
      ])

      if (!year) return null

      let currentTerm: any = null

      if ((config as any).current_semester) {
        const { data } = await supabase
          .from('academic_semesters')
          .select(`*, term_config (*)`)
          .eq('id', (config as any).current_semester)
          .maybeSingle()

        if (data) {
          const termConfig = data.term_config?.[0]
          currentTerm = {
            id: data.id,
            term_code: data.semester_code,
            term_name: data.semester_name,
            term_number: termConfig?.term_number || data.semester_number,
            semester_group: termConfig?.semester_group || Math.ceil(data.semester_number / 2),
            lecturing_starts: termConfig?.lecturing_starts || data.start_date,
            classes_commence: termConfig?.classes_commence || data.start_date,
            lectures_end_exam_start: termConfig?.lectures_end_exam_start || data.end_date,
            college_closes: termConfig?.college_closes || data.end_date,
            lecturing_staff_days: termConfig?.lecturing_staff_days || 0,
            total_staff_service_days: termConfig?.total_staff_service_days || 0,
          }
        }
      }

      if (!currentTerm) {
        const terms = await this.getTVETTermsByYear(year.id)
        currentTerm = terms.length > 0 ? terms[0] : null
      }

      if (!currentTerm) return null

      return {
        academic_year_id: year.id,
        year_code: year.year_code,
        year_name: year.year_name,
        program_type: year.program_type?.code || 'Unknown',
        term_id: currentTerm.id,
        term_code: currentTerm.term_code,
        term_name: currentTerm.term_name,
        term_number: currentTerm.term_number,
        semester_group: currentTerm.semester_group,
        lecturing_starts: currentTerm.lecturing_starts,
        classes_commence: currentTerm.classes_commence,
        lectures_end_exam_start: currentTerm.lectures_end_exam_start,
        college_closes: currentTerm.college_closes,
        lecturing_staff_days: currentTerm.lecturing_staff_days,
        total_staff_service_days: currentTerm.total_staff_service_days,
      }
    } catch (error: any) {
      console.error('Error fetching current TVET context:', error)
      return null
    }
  }

  // ==================== UTILITY ====================

  /** Calculate number of weeks for a term */
  static async generateTVETTermWeeks(termId: string): Promise<number> {
    try {
      const { data: semester } = await supabase
        .from('academic_semesters')
        .select('start_date, end_date')
        .eq('id', termId)
        .maybeSingle()

      if (!semester) return 0

      const startDate = new Date(semester.start_date)
      const endDate = new Date(semester.end_date)
      const weeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
      return weeks
    } catch (error: any) {
      console.error('Error generating TVET term weeks:', error)
      throw new Error(`Failed to generate TVET term weeks: ${error.message || 'Unknown error'}`)
    }
  }
}
