import { supabase } from '@/lib/supabase'
import { SystemConfigService, type DropdownOption } from './system-config'
import { TVETAcademicCalendarService } from './tvet-academic-calendar'

// =============================================================================
// ENHANCED COURSE TYPES (Database-Driven)
// =============================================================================

export interface CourseLevel {
  id: string
  level_code: string
  level_name: string
  description?: string
  sort_order: number
  is_active: boolean
}

export interface CreditHourRule {
  id: string
  program_type: string
  min_credits: number
  max_credits: number
  default_credits: number
  is_active: boolean
}

export interface CoursePrerequisite {
  id: string
  course_id: string
  prerequisite_course_id: string
  prerequisite_type: 'required' | 'recommended' | 'concurrent'
  created_at: string
}

export interface EnhancedCourse {
  id: string
  course_code: string
  course_name: string
  description?: string

  // Database-driven associations
  department_id: string
  program_id: string
  level_id: string
  term_id?: string

  // TVET-specific fields
  credit_hours: number
  contact_hours: number
  practical_hours: number
  theory_hours: number

  // Delivery configuration
  delivery_mode: string // 'face_to_face', 'online', 'blended'
  assessment_mode: string // 'continuous', 'final_exam', 'mixed'

  // Status and metadata
  is_active: boolean
  is_core: boolean
  is_elective: boolean

  // Relationships
  department?: any
  program?: any
  level?: CourseLevel
  prerequisites?: CoursePrerequisite[]

  created_at: string
  updated_at: string
}

export interface CreateCourseData {
  course_code: string
  course_name: string
  description?: string
  department_id: string
  program_id: string
  level_id: string
  term_id?: string
  credit_hours: number
  contact_hours: number
  practical_hours?: number
  theory_hours?: number
  delivery_mode: string
  assessment_mode: string
  is_core: boolean
  is_elective: boolean
}

// =============================================================================
// ENHANCED COURSE SERVICE (Database-Driven)
// =============================================================================

export class EnhancedCourseService {

  // ==================== COURSE LEVELS ====================

  /**
   * Get all course levels from database
   */
  static async getCourseLevels(): Promise<CourseLevel[]> {
    try {
      const { data, error } = await supabase
        .from('course_levels')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching course levels:', error)
      // Fallback to system dropdown options
      const dropdownOptions = await SystemConfigService.getDropdownOptions('course_levels')
      return dropdownOptions.map((option, index) => ({
        id: option.id,
        level_code: option.option_key,
        level_name: option.option_label,
        description: `${option.option_label} level courses`,
        sort_order: option.sort_order || index,
        is_active: true
      }))
    }
  }

  /**
   * Get fallback course levels if database is unavailable
   */
  private static getDefaultCourseLevels(): CourseLevel[] {
    return [
      { id: '1', level_code: 'CERT', level_name: 'Certificate Level', description: 'Certificate level courses', sort_order: 1, is_active: true },
      { id: '2', level_code: 'DIP', level_name: 'Diploma Level', description: 'Diploma level courses', sort_order: 2, is_active: true },
      { id: '3', level_code: 'ADV_DIP', level_name: 'Advanced Diploma', description: 'Advanced diploma level courses', sort_order: 3, is_active: true },
      { id: '4', level_code: 'DEGREE', level_name: 'Degree Level', description: 'Degree level courses', sort_order: 4, is_active: true }
    ]
  }

  // ==================== CREDIT HOUR RULES ====================

  /**
   * Get credit hour rules from database
   */
  static async getCreditHourRules(): Promise<CreditHourRule[]> {
    try {
      const { data, error } = await supabase
        .from('credit_hour_rules')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching credit hour rules:', error)
      return this.getDefaultCreditHourRules()
    }
  }

  /**
   * Get default credit hour rules
   */
  private static getDefaultCreditHourRules(): CreditHourRule[] {
    return [
      { id: '1', program_type: 'NCV', min_credits: 1, max_credits: 6, default_credits: 3, is_active: true },
      { id: '2', program_type: 'NC(V)', min_credits: 1, max_credits: 6, default_credits: 3, is_active: true },
      { id: '3', program_type: 'Report191', min_credits: 2, max_credits: 8, default_credits: 4, is_active: true },
      { id: '4', program_type: 'Other', min_credits: 1, max_credits: 6, default_credits: 3, is_active: true }
    ]
  }

  // ==================== DELIVERY MODES ====================

  /**
   * Get delivery modes from database
   */
  static async getDeliveryModes(): Promise<DropdownOption[]> {
    try {
      const options = await SystemConfigService.getDropdownOptions('delivery_modes')
      return options.length > 0 ? options : this.getDefaultDeliveryModes()
    } catch (error: any) {
      console.error('Error fetching delivery modes:', error)
      return this.getDefaultDeliveryModes()
    }
  }

  private static getDefaultDeliveryModes(): DropdownOption[] {
    return [
      { id: '1', dropdown_type: 'delivery_modes', option_key: 'face_to_face', option_label: 'Face-to-Face', sort_order: 1, is_active: true },
      { id: '2', dropdown_type: 'delivery_modes', option_key: 'online', option_label: 'Online', sort_order: 2, is_active: true },
      { id: '3', dropdown_type: 'delivery_modes', option_key: 'blended', option_label: 'Blended Learning', sort_order: 3, is_active: true },
      { id: '4', dropdown_type: 'delivery_modes', option_key: 'practical', option_label: 'Practical/Workshop', sort_order: 4, is_active: true }
    ]
  }

  // ==================== ASSESSMENT MODES ====================

  /**
   * Get assessment modes from database
   */
  static async getAssessmentModes(): Promise<DropdownOption[]> {
    try {
      const options = await SystemConfigService.getDropdownOptions('assessment_modes')
      return options.length > 0 ? options : this.getDefaultAssessmentModes()
    } catch (error: any) {
      console.error('Error fetching assessment modes:', error)
      return this.getDefaultAssessmentModes()
    }
  }

  private static getDefaultAssessmentModes(): DropdownOption[] {
    return [
      { id: '1', dropdown_type: 'assessment_modes', option_key: 'continuous', option_label: 'Continuous Assessment', sort_order: 1, is_active: true },
      { id: '2', dropdown_type: 'assessment_modes', option_key: 'final_exam', option_label: 'Final Examination', sort_order: 2, is_active: true },
      { id: '3', dropdown_type: 'assessment_modes', option_key: 'mixed', option_label: 'Mixed Assessment', sort_order: 3, is_active: true },
      { id: '4', dropdown_type: 'assessment_modes', option_key: 'practical_based', option_label: 'Practical-Based', sort_order: 4, is_active: true }
    ]
  }

  // ==================== TERMS/SEMESTERS ====================

  /**
   * Get available terms/semesters from TVET calendar
   */
  static async getAvailableTerms(academicYearId?: string): Promise<any[]> {
    try {
      if (academicYearId) {
        return await TVETAcademicCalendarService.getTVETTermsByYear(academicYearId)
      }

      // Get current academic year terms
      const currentYear = await TVETAcademicCalendarService.getCurrentTVETAcademicYear()
      if (currentYear) {
        return await TVETAcademicCalendarService.getTVETTermsByYear(currentYear.id)
      }

      return []
    } catch (error: any) {
      console.error('Error fetching terms:', error)
      return this.getDefaultTerms()
    }
  }

  private static getDefaultTerms(): any[] {
    return [
      { id: '1', term_code: 'TERM1', term_name: 'Term 1', term_number: 1 },
      { id: '2', term_code: 'TERM2', term_name: 'Term 2', term_number: 2 },
      { id: '3', term_code: 'TERM3', term_name: 'Term 3', term_number: 3 },
      { id: '4', term_code: 'TERM4', term_name: 'Term 4', term_number: 4 }
    ]
  }

  // ==================== COURSE MANAGEMENT ====================

  /**
   * Get all enhanced courses with full relationships
   */
  static async getAllEnhancedCourses(): Promise<EnhancedCourse[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          departments (id, name, code),
          programs (id, name, code),
          course_levels (id, level_name, level_code),
          course_prerequisites (
            id,
            prerequisite_course_id,
            prerequisite_type,
            courses!course_prerequisites_prerequisite_course_id_fkey (course_code, course_name)
          )
        `)
        .eq('is_active', true)
        .order('course_code')

      if (error) throw error

      return (data || []).map(course => ({
        ...course,
        level: course.course_levels,
        prerequisites: course.course_prerequisites || []
      }))
    } catch (error: any) {
      console.error('Error fetching enhanced courses:', error)
      throw new Error(`Failed to fetch courses: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Create enhanced course with validation
   */
  static async createEnhancedCourse(courseData: CreateCourseData): Promise<EnhancedCourse> {
    try {
      // Validate course data using database rules
      await this.validateCourseData(courseData)

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...courseData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          departments (id, name, code),
          programs (id, name, code),
          course_levels (id, level_name, level_code)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error creating enhanced course:', error)
      throw new Error(`Failed to create course: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Update enhanced course
   */
  static async updateEnhancedCourse(courseId: string, courseData: Partial<CreateCourseData>): Promise<EnhancedCourse> {
    try {
      // Validate course data using database rules
      if (Object.keys(courseData).length > 0) {
        await this.validateCourseData(courseData as CreateCourseData)
      }

      const { data, error } = await supabase
        .from('courses')
        .update({
          ...courseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select(`
          *,
          departments (id, name, code),
          programs (id, name, code),
          course_levels (id, level_name, level_code)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error updating enhanced course:', error)
      throw new Error(`Failed to update course: ${error.message || 'Unknown error'}`)
    }
  }

  // ==================== VALIDATION ====================

  /**
   * Validate course data against database rules
   */
  static async validateCourseData(courseData: Partial<CreateCourseData>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Check if course code already exists (if provided)
      if (courseData.course_code) {
        const { data: existingCourse } = await supabase
          .from('courses')
          .select('id')
          .eq('course_code', courseData.course_code)
          .single()

        if (existingCourse) {
          errors.push(`Course code '${courseData.course_code}' already exists`)
        }
      }

      // Validate credit hours against program rules
      if (courseData.credit_hours && courseData.program_id) {
        const { data: program } = await supabase
          .from('programs')
          .select('program_type')
          .eq('id', courseData.program_id)
          .single()

        if (program) {
          const creditRules = await this.getCreditHourRules()
          const rule = creditRules.find(r => r.program_type === program.program_type)

          if (rule) {
            if (courseData.credit_hours < rule.min_credits || courseData.credit_hours > rule.max_credits) {
              errors.push(`Credit hours must be between ${rule.min_credits} and ${rule.max_credits} for ${program.program_type} programs`)
            }
          }
        }
      }

      // Validate contact hours calculation
      if (courseData.contact_hours && courseData.theory_hours && courseData.practical_hours) {
        const totalHours = (courseData.theory_hours || 0) + (courseData.practical_hours || 0)
        if (Math.abs(totalHours - courseData.contact_hours) > 0.1) {
          errors.push('Contact hours must equal the sum of theory and practical hours')
        }
      }

      // Validate department and program relationship
      if (courseData.department_id && courseData.program_id) {
        const { data: program } = await supabase
          .from('programs')
          .select('department_id')
          .eq('id', courseData.program_id)
          .single()

        if (program && program.department_id !== courseData.department_id) {
          errors.push('Selected program does not belong to the selected department')
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error: any) {
      console.error('Error validating course data:', error)
      return {
        isValid: false,
        errors: ['Validation failed due to system error']
      }
    }
  }

  // ==================== PREREQUISITES ====================

  /**
   * Add course prerequisite
   */
  static async addCoursePrerequisite(courseId: string, prerequisiteCourseId: string, prerequisiteType: 'required' | 'recommended' | 'concurrent' = 'required'): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_prerequisites')
        .insert([{
          course_id: courseId,
          prerequisite_course_id: prerequisiteCourseId,
          prerequisite_type: prerequisiteType
        }])

      if (error) throw error
    } catch (error: any) {
      console.error('Error adding course prerequisite:', error)
      throw new Error(`Failed to add prerequisite: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Remove course prerequisite
   */
  static async removeCoursePrerequisite(courseId: string, prerequisiteCourseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_prerequisites')
        .delete()
        .eq('course_id', courseId)
        .eq('prerequisite_course_id', prerequisiteCourseId)

      if (error) throw error
    } catch (error: any) {
      console.error('Error removing course prerequisite:', error)
      throw new Error(`Failed to remove prerequisite: ${error.message || 'Unknown error'}`)
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get course form configuration based on program type
   */
  static async getCourseFormConfiguration(programId?: string): Promise<{
    creditRules: CreditHourRule[]
    deliveryModes: DropdownOption[]
    assessmentModes: DropdownOption[]
    courseLevels: CourseLevel[]
    availableTerms: any[]
  }> {
    try {
      const [creditRules, deliveryModes, assessmentModes, courseLevels] = await Promise.all([
        this.getCreditHourRules(),
        this.getDeliveryModes(),
        this.getAssessmentModes(),
        this.getCourseLevels()
      ])

      const availableTerms = await this.getAvailableTerms()

      return {
        creditRules,
        deliveryModes,
        assessmentModes,
        courseLevels,
        availableTerms
      }
    } catch (error: any) {
      console.error('Error getting course form configuration:', error)
      throw new Error(`Failed to get form configuration: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Get default course data based on program
   */
  static async getDefaultCourseData(programId: string): Promise<Partial<CreateCourseData>> {
    try {
      const { data: program } = await supabase
        .from('programs')
        .select('program_type, department_id')
        .eq('id', programId)
        .single()

      if (!program) {
        throw new Error('Program not found')
      }

      const creditRules = await this.getCreditHourRules()
      const rule = creditRules.find(r => r.program_type === program.program_type)

      const deliveryModes = await this.getDeliveryModes()
      const assessmentModes = await this.getAssessmentModes()

      return {
        department_id: program.department_id,
        program_id: programId,
        credit_hours: rule?.default_credits || 3,
        contact_hours: (rule?.default_credits || 3) * 15, // Assuming 15 contact hours per credit
        theory_hours: Math.floor(((rule?.default_credits || 3) * 15) * 0.6), // 60% theory
        practical_hours: Math.ceil(((rule?.default_credits || 3) * 15) * 0.4), // 40% practical
        delivery_mode: deliveryModes[0]?.option_key || 'face_to_face',
        assessment_mode: assessmentModes[0]?.option_key || 'mixed',
        is_core: true,
        is_elective: false
      }
    } catch (error: any) {
      console.error('Error getting default course data:', error)
      return {}
    }
  }

  /**
   * Search courses with advanced filters
   */
  static async searchCourses(filters: {
    search?: string
    department_id?: string
    program_id?: string
    level_id?: string
    term_id?: string
    delivery_mode?: string
    is_core?: boolean
  }): Promise<EnhancedCourse[]> {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          departments (id, name, code),
          programs (id, name, code),
          course_levels (id, level_name, level_code)
        `)
        .eq('is_active', true)

      if (filters.search) {
        query = query.or(`course_code.ilike.%${filters.search}%,course_name.ilike.%${filters.search}%`)
      }

      if (filters.department_id) {
        query = query.eq('department_id', filters.department_id)
      }

      if (filters.program_id) {
        query = query.eq('program_id', filters.program_id)
      }

      if (filters.level_id) {
        query = query.eq('level_id', filters.level_id)
      }

      if (filters.term_id) {
        query = query.eq('term_id', filters.term_id)
      }

      if (filters.delivery_mode) {
        query = query.eq('delivery_mode', filters.delivery_mode)
      }

      if (filters.is_core !== undefined) {
        query = query.eq('is_core', filters.is_core)
      }

      const { data, error } = await query.order('course_code')

      if (error) throw error

      return (data || []).map(course => ({
        ...course,
        level: course.course_levels
      }))
    } catch (error: any) {
      console.error('Error searching courses:', error)
      throw new Error(`Failed to search courses: ${error.message || 'Unknown error'}`)
    }
  }
}
