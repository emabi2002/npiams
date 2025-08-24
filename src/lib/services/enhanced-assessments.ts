import { supabase } from '@/lib/supabase'
import { SystemConfigService, type DropdownOption } from './system-config'

// =============================================================================
// ENHANCED ASSESSMENT TYPES (Database-Driven)
// =============================================================================

export interface AssessmentType {
  id: string
  type_key: string
  type_name: string
  description?: string
  default_weight: number
  max_weight: number
  min_weight: number
  is_active: boolean
  sort_order: number
}

export interface GradeScale {
  id: string
  grade_code: string
  grade_name: string
  min_percentage: number
  max_percentage: number
  gpa_value: number
  pass_grade: boolean
  honor_grade: boolean
  is_active: boolean
  sort_order: number
}

export interface AssessmentWeighting {
  id: string
  course_id: string
  academic_year_id: string
  semester_id: string
  assessment_type_id: string
  weight_percentage: number
  max_marks: number
  number_of_assessments: number
  is_active: boolean
}

export interface EnhancedAssessmentConfig {
  id: string
  course_id: string
  academic_year_id: string
  semester_id: string
  total_marks: number
  pass_threshold: number
  honor_threshold: number
  weightings: AssessmentWeighting[]
  grade_scale_id: string
  created_at: string
  updated_at: string
}

export interface ValidationRule {
  id: string
  rule_name: string
  rule_type: 'weight_total' | 'minimum_assessments' | 'maximum_marks' | 'grade_threshold'
  rule_value: string
  error_message: string
  is_active: boolean
}

export interface AssessmentRecord {
  id: string
  student_id: string
  assessment_config_id: string
  assessment_type_id: string
  marks_obtained: number
  max_marks: number
  percentage: number
  grade_code: string
  submission_date: string
  graded_date?: string
  graded_by?: string
  comments?: string
  is_submitted: boolean
  is_graded: boolean
}

export interface StudentGradeSummary {
  student_id: string
  student_name: string
  student_number: string
  assessment_records: AssessmentRecord[]
  total_weighted_score: number
  final_percentage: number
  final_grade: string
  gpa_value: number
  is_passed: boolean
  is_honor: boolean
}

export interface CourseAnalytics {
  course_id: string
  total_students: number
  submitted_assessments: number
  graded_assessments: number
  average_score: number
  median_score: number
  standard_deviation: number
  pass_rate: number
  honor_rate: number
  grade_distribution: Record<string, number>
  assessment_completion_rates: Record<string, number>
}

// =============================================================================
// ENHANCED ASSESSMENT SERVICE (Database-Driven)
// =============================================================================

export class EnhancedAssessmentService {

  // ==================== ASSESSMENT TYPES ====================

  /**
   * Get all assessment types from database
   */
  static async getAssessmentTypes(): Promise<AssessmentType[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching assessment types:', error)
      // Fallback to system dropdown options
      const dropdownOptions = await SystemConfigService.getAssessmentTypes()
      return dropdownOptions.map((option, index) => ({
        id: option.id,
        type_key: option.option_key,
        type_name: option.option_label,
        description: `${option.option_label} assessment type`,
        default_weight: this.getDefaultWeightForType(option.option_key),
        max_weight: 100,
        min_weight: 0,
        is_active: true,
        sort_order: option.sort_order || index
      }))
    }
  }

  /**
   * Get default weight for assessment type (fallback)
   */
  private static getDefaultWeightForType(typeKey: string): number {
    const weights: Record<string, number> = {
      'assignment': 20,
      'quiz': 10,
      'midterm': 30,
      'practical': 25,
      'final': 40,
      'project': 35
    }
    return weights[typeKey] || 20
  }

  /**
   * Create or update assessment type
   */
  static async saveAssessmentType(assessmentType: Partial<AssessmentType>): Promise<AssessmentType> {
    try {
      const { data, error } = await supabase
        .from('assessment_types')
        .upsert([{
          ...assessmentType,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error saving assessment type:', error)
      throw new Error(`Failed to save assessment type: ${error.message || 'Unknown error'}`)
    }
  }

  // ==================== GRADE SCALES ====================

  /**
   * Get grade scales from database
   */
  static async getGradeScales(): Promise<GradeScale[]> {
    try {
      const { data, error } = await supabase
        .from('grade_scales')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching grade scales:', error)
      // Fallback to system dropdown options
      const dropdownOptions = await SystemConfigService.getGradeScales()
      return dropdownOptions.map((option, index) => ({
        id: option.id,
        grade_code: option.option_key,
        grade_name: option.option_label,
        min_percentage: this.getMinPercentageForGrade(option.option_key),
        max_percentage: this.getMaxPercentageForGrade(option.option_key),
        gpa_value: this.getGPAValueForGrade(option.option_key),
        pass_grade: option.option_key !== 'F',
        honor_grade: ['HD', 'D'].includes(option.option_key),
        is_active: true,
        sort_order: option.sort_order || index
      }))
    }
  }

  /**
   * Get percentage ranges for grades (fallback)
   */
  private static getMinPercentageForGrade(gradeCode: string): number {
    const ranges: Record<string, number> = {
      'HD': 80, 'D': 70, 'C': 60, 'P': 50, 'F': 0,
      'A': 80, 'B': 70, 'CREDIT': 60, 'PASS': 50, 'E': 40, 'FAIL': 0
    }
    return ranges[gradeCode] || 0
  }

  private static getMaxPercentageForGrade(gradeCode: string): number {
    const ranges: Record<string, number> = {
      'HD': 100, 'D': 79, 'C': 69, 'P': 59, 'F': 49,
      'A': 100, 'B': 79, 'CREDIT': 69, 'PASS': 59, 'E': 49, 'FAIL': 39
    }
    return ranges[gradeCode] || 100
  }

  private static getGPAValueForGrade(gradeCode: string): number {
    const gpaValues: Record<string, number> = {
      'HD': 4.0, 'D': 3.0, 'C': 2.0, 'P': 1.0, 'F': 0.0,
      'A': 4.0, 'B': 3.0, 'CREDIT': 2.0, 'PASS': 1.0, 'E': 0.5, 'FAIL': 0.0
    }
    return gpaValues[gradeCode] || 0.0
  }

  /**
   * Calculate grade from percentage using database grade scale
   */
  static async calculateGrade(percentage: number, gradeScaleId?: string): Promise<string> {
    try {
      const gradeScales = await this.getGradeScales()
      const relevantScales = gradeScaleId
        ? gradeScales.filter(g => g.id === gradeScaleId)
        : gradeScales

      // Find the appropriate grade
      for (const scale of relevantScales.sort((a, b) => b.min_percentage - a.min_percentage)) {
        if (percentage >= scale.min_percentage) {
          return scale.grade_code
        }
      }

      return 'F' // Default to fail if no grade found
    } catch (error: any) {
      console.error('Error calculating grade:', error)
      return 'F'
    }
  }

  // ==================== VALIDATION RULES ====================

  /**
   * Get validation rules from database
   */
  static async getValidationRules(): Promise<ValidationRule[]> {
    try {
      const { data, error } = await supabase
        .from('assessment_validation_rules')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching validation rules:', error)
      // Return default validation rules
      return [
        {
          id: '1',
          rule_name: 'Total Weight Validation',
          rule_type: 'weight_total',
          rule_value: '100',
          error_message: 'Total assessment weights must equal 100%',
          is_active: true
        },
        {
          id: '2',
          rule_name: 'Minimum Assessments',
          rule_type: 'minimum_assessments',
          rule_value: '3',
          error_message: 'Course must have at least 3 assessments',
          is_active: true
        },
        {
          id: '3',
          rule_name: 'Maximum Marks Validation',
          rule_type: 'maximum_marks',
          rule_value: '100',
          error_message: 'Maximum marks cannot exceed 100',
          is_active: true
        }
      ]
    }
  }

  /**
   * Validate assessment configuration against database rules
   */
  static async validateAssessmentConfig(config: Partial<EnhancedAssessmentConfig>): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const rules = await this.getValidationRules()
      const errors: string[] = []

      for (const rule of rules) {
        switch (rule.rule_type) {
          case 'weight_total':
            const totalWeight = config.weightings?.reduce((sum, w) => sum + w.weight_percentage, 0) || 0
            const expectedTotal = parseFloat(rule.rule_value)
            if (Math.abs(totalWeight - expectedTotal) > 0.01) {
              errors.push(rule.error_message)
            }
            break

          case 'minimum_assessments':
            const assessmentCount = config.weightings?.length || 0
            const minAssessments = parseInt(rule.rule_value)
            if (assessmentCount < minAssessments) {
              errors.push(rule.error_message)
            }
            break

          case 'maximum_marks':
            const maxMarks = parseFloat(rule.rule_value)
            const hasExcessiveMarks = config.weightings?.some(w => w.max_marks > maxMarks) || false
            if (hasExcessiveMarks) {
              errors.push(rule.error_message)
            }
            break

          case 'grade_threshold':
            const passThreshold = config.pass_threshold || 0
            const minThreshold = parseFloat(rule.rule_value)
            if (passThreshold < minThreshold) {
              errors.push(rule.error_message)
            }
            break
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error: any) {
      console.error('Error validating assessment config:', error)
      return {
        isValid: false,
        errors: ['Validation failed due to system error']
      }
    }
  }

  // ==================== ASSESSMENT CONFIGURATION ====================

  /**
   * Save assessment configuration to database
   */
  static async saveAssessmentConfig(config: Partial<EnhancedAssessmentConfig>): Promise<EnhancedAssessmentConfig> {
    try {
      // Validate first
      const validation = await this.validateAssessmentConfig(config)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const { data, error } = await supabase
        .from('assessment_configurations')
        .upsert([{
          ...config,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Save weightings separately
      if (config.weightings && config.weightings.length > 0) {
        const { error: weightingError } = await supabase
          .from('assessment_weightings')
          .upsert(config.weightings.map(w => ({
            ...w,
            assessment_config_id: data.id
          })))

        if (weightingError) throw weightingError
      }

      return data
    } catch (error: any) {
      console.error('Error saving assessment configuration:', error)
      throw new Error(`Failed to save assessment configuration: ${error.message || 'Unknown error'}`)
    }
  }

  /**
   * Get assessment configuration for course
   */
  static async getAssessmentConfig(courseId: string, academicYearId: string, semesterId: string): Promise<EnhancedAssessmentConfig | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_configurations')
        .select(`
          *,
          assessment_weightings (*)
        `)
        .eq('course_id', courseId)
        .eq('academic_year_id', academicYearId)
        .eq('semester_id', semesterId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No configuration found
        }
        throw error
      }

      return {
        ...data,
        weightings: data.assessment_weightings || []
      }
    } catch (error: any) {
      console.error('Error fetching assessment configuration:', error)
      return null
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Generate course analytics from database
   */
  static async getCourseAnalytics(courseId: string, academicYearId: string, semesterId: string): Promise<CourseAnalytics> {
    try {
      // Get assessment records for the course
      const { data: records, error } = await supabase
        .from('assessment_records')
        .select(`
          *,
          students (id, full_name, student_number),
          assessment_types (type_name)
        `)
        .eq('course_id', courseId)
        .eq('academic_year_id', academicYearId)
        .eq('semester_id', semesterId)

      if (error) throw error

      const gradeScales = await this.getGradeScales()
      const assessmentTypes = await this.getAssessmentTypes()

      // Calculate analytics
      const totalStudents = new Set(records?.map(r => r.student_id)).size || 0
      const submittedAssessments = records?.filter(r => r.is_submitted).length || 0
      const gradedAssessments = records?.filter(r => r.is_graded).length || 0

      const scores = records?.filter(r => r.is_graded).map(r => r.percentage) || []
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      const sortedScores = [...scores].sort((a, b) => a - b)
      const medianScore = sortedScores.length > 0
        ? sortedScores.length % 2 === 0
          ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
          : sortedScores[Math.floor(sortedScores.length / 2)]
        : 0

      const variance = scores.length > 0
        ? scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length
        : 0
      const standardDeviation = Math.sqrt(variance)

      // Grade distribution
      const gradeDistribution: Record<string, number> = {}
      gradeScales.forEach(scale => {
        gradeDistribution[scale.grade_code] = records?.filter(r => r.grade_code === scale.grade_code).length || 0
      })

      // Pass and honor rates
      const passGrades = gradeScales.filter(g => g.pass_grade).map(g => g.grade_code)
      const honorGrades = gradeScales.filter(g => g.honor_grade).map(g => g.grade_code)
      const passedStudents = records?.filter(r => passGrades.includes(r.grade_code)).length || 0
      const honorStudents = records?.filter(r => honorGrades.includes(r.grade_code)).length || 0

      const passRate = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0
      const honorRate = totalStudents > 0 ? (honorStudents / totalStudents) * 100 : 0

      // Assessment completion rates
      const assessmentCompletionRates: Record<string, number> = {}
      assessmentTypes.forEach(type => {
        const typeRecords = records?.filter(r => r.assessment_type_id === type.id) || []
        const submitted = typeRecords.filter(r => r.is_submitted).length
        const total = typeRecords.length
        assessmentCompletionRates[type.type_name] = total > 0 ? (submitted / total) * 100 : 0
      })

      return {
        course_id: courseId,
        total_students: totalStudents,
        submitted_assessments: submittedAssessments,
        graded_assessments: gradedAssessments,
        average_score: Math.round(averageScore * 100) / 100,
        median_score: Math.round(medianScore * 100) / 100,
        standard_deviation: Math.round(standardDeviation * 100) / 100,
        pass_rate: Math.round(passRate * 100) / 100,
        honor_rate: Math.round(honorRate * 100) / 100,
        grade_distribution: gradeDistribution,
        assessment_completion_rates: assessmentCompletionRates
      }
    } catch (error: any) {
      console.error('Error generating course analytics:', error)
      throw new Error(`Failed to generate course analytics: ${error.message || 'Unknown error'}`)
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get system default assessment configuration
   */
  static async getDefaultAssessmentConfig(): Promise<Partial<EnhancedAssessmentConfig>> {
    try {
      const assessmentTypes = await this.getAssessmentTypes()
      const gradeScales = await this.getGradeScales()

      // Create default weightings based on common TVET assessment patterns
      const defaultWeightings: Partial<AssessmentWeighting>[] = assessmentTypes.slice(0, 4).map(type => ({
        assessment_type_id: type.id,
        weight_percentage: type.default_weight,
        max_marks: 100,
        number_of_assessments: 1,
        is_active: true
      }))

      return {
        total_marks: 100,
        pass_threshold: 50,
        honor_threshold: 80,
        weightings: defaultWeightings as AssessmentWeighting[],
        grade_scale_id: gradeScales[0]?.id
      }
    } catch (error: any) {
      console.error('Error getting default assessment config:', error)
      throw new Error(`Failed to get default assessment config: ${error.message || 'Unknown error'}`)
    }
  }
}
