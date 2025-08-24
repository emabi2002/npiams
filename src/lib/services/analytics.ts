import { supabase } from '@/lib/supabase'

// =============================================
// ANALYTICS TYPES
// =============================================

export interface EnrollmentStats {
  totalStudents: number
  activeStudents: number
  newEnrollments: number
  enrollmentTrend: Array<{ date: string; count: number }>
  departmentDistribution: Array<{ department: string; count: number; percentage: number }>
  programDistribution: Array<{ program: string; count: number; percentage: number }>
  nqfLevelDistribution: Array<{ level: number; count: number; percentage: number }>
}

export interface PerformanceStats {
  overallGPA: number
  passRate: number
  completionRate: number
  performanceTrend: Array<{ period: string; gpa: number; passRate: number }>
  departmentPerformance: Array<{ department: string; gpa: number; passRate: number }>
  programPerformance: Array<{ program: string; gpa: number; passRate: number }>
  assessmentStats: Array<{ type: string; avgScore: number; count: number }>
}

export interface InstructorStats {
  totalInstructors: number
  activeInstructors: number
  avgCoursesPerInstructor: number
  avgStudentsPerInstructor: number
  instructorEffectiveness: Array<{
    instructor: string
    avgGrade: number
    studentCount: number
    courseCount: number
    satisfaction?: number
  }>
}

export interface FinancialStats {
  totalRevenue: number
  totalFees: number
  paidFees: number
  outstandingFees: number
  paymentTrend: Array<{ month: string; amount: number }>
  departmentRevenue: Array<{ department: string; amount: number }>
  programRevenue: Array<{ program: string; amount: number }>
}

export interface ResourceStats {
  totalCourses: number
  activeCourses: number
  totalAssessments: number
  completedAssessments: number
  avgClassSize: number
  resourceUtilization: Array<{ resource: string; utilizationRate: number }>
  facilityOccupancy: Array<{ facility: string; occupancyRate: number }>
}

export interface ComprehensiveAnalytics {
  enrollment: EnrollmentStats
  performance: PerformanceStats
  instructors: InstructorStats
  financial: FinancialStats
  resources: ResourceStats
  lastUpdated: string
}

export interface DashboardFilters {
  department?: string
  program?: string
  academicYear?: string
  term?: string
  startDate?: string
  endDate?: string
}

// =============================================
// ANALYTICS SERVICE
// =============================================

export class AnalyticsService {

  // =============================================
  // ENROLLMENT ANALYTICS
  // =============================================

  /**
   * Get comprehensive enrollment statistics
   */
  static async getEnrollmentStats(filters?: DashboardFilters): Promise<EnrollmentStats> {
    try {
      // Base query for student enrollments
      let baseQuery = supabase
        .from('student_enrollments')
        .select(`
          *,
          students!inner (
            user_id,
            users!inner (full_name, created_at)
          ),
          courses!inner (
            name,
            department_id,
            departments!inner (name),
            programs!inner (
              name,
              enhanced_programs!inner (nqf_level)
            )
          )
        `)

      // Apply filters
      if (filters?.department) {
        baseQuery = baseQuery.eq('courses.department_id', filters.department)
      }
      if (filters?.program) {
        baseQuery = baseQuery.eq('courses.program_id', filters.program)
      }
      if (filters?.startDate && filters?.endDate) {
        baseQuery = baseQuery.gte('enrolled_at', filters.startDate).lte('enrolled_at', filters.endDate)
      }

      const { data: enrollments, error } = await baseQuery

      if (error) throw new Error(`Failed to fetch enrollment data: ${error.message}`)

      // Calculate statistics
      const totalStudents = new Set(enrollments?.map(e => e.student_id)).size
      const activeStudents = enrollments?.filter(e => e.status === 'enrolled').length || 0

      // New enrollments in last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const newEnrollments = enrollments?.filter(e =>
        new Date(e.enrolled_at) >= thirtyDaysAgo
      ).length || 0

      // Enrollment trend (last 12 months)
      const enrollmentTrend = this.calculateEnrollmentTrend(enrollments || [])

      // Department distribution
      const departmentCounts = this.groupBy(enrollments || [], 'courses.departments.name')
      const departmentDistribution = Object.entries(departmentCounts).map(([dept, count]) => ({
        department: dept,
        count: count as number,
        percentage: Math.round((count as number / totalStudents) * 100)
      }))

      // Program distribution
      const programCounts = this.groupBy(enrollments || [], 'courses.programs.name')
      const programDistribution = Object.entries(programCounts).map(([program, count]) => ({
        program: program,
        count: count as number,
        percentage: Math.round((count as number / totalStudents) * 100)
      }))

      // NQF Level distribution
      const nqfCounts = this.groupBy(enrollments || [], 'courses.programs.enhanced_programs.nqf_level')
      const nqfLevelDistribution = Object.entries(nqfCounts).map(([level, count]) => ({
        level: parseInt(level) || 0,
        count: count as number,
        percentage: Math.round((count as number / totalStudents) * 100)
      }))

      return {
        totalStudents,
        activeStudents,
        newEnrollments,
        enrollmentTrend,
        departmentDistribution,
        programDistribution,
        nqfLevelDistribution
      }
    } catch (error: any) {
      console.error('Error fetching enrollment stats:', error)
      return {
        totalStudents: 0,
        activeStudents: 0,
        newEnrollments: 0,
        enrollmentTrend: [],
        departmentDistribution: [],
        programDistribution: [],
        nqfLevelDistribution: []
      }
    }
  }

  // =============================================
  // PERFORMANCE ANALYTICS
  // =============================================

  /**
   * Get comprehensive performance statistics
   */
  static async getPerformanceStats(filters?: DashboardFilters): Promise<PerformanceStats> {
    try {
      // Get student grades and assessment results
      let gradesQuery = supabase
        .from('student_grades')
        .select(`
          *,
          assessments!inner (
            id,
            title,
            total_marks,
            courses!inner (
              name,
              department_id,
              departments!inner (name),
              programs!inner (name)
            )
          ),
          students!inner (
            user_id,
            users!inner (full_name)
          )
        `)

      // Apply filters
      if (filters?.department) {
        gradesQuery = gradesQuery.eq('assessments.courses.department_id', filters.department)
      }
      if (filters?.startDate && filters?.endDate) {
        gradesQuery = gradesQuery.gte('created_at', filters.startDate).lte('created_at', filters.endDate)
      }

      const { data: grades, error: gradesError } = await gradesQuery

      if (gradesError) throw new Error(`Failed to fetch grades: ${gradesError.message}`)

      // Calculate performance metrics
      const validGrades = grades?.filter(g => g.marks_obtained !== null && g.total_marks > 0) || []

      // Overall GPA calculation (assuming 4.0 scale)
      const percentages = validGrades.map(g => (g.marks_obtained / g.total_marks) * 100)
      const avgPercentage = percentages.length > 0 ?
        percentages.reduce((sum, p) => sum + p, 0) / percentages.length : 0
      const overallGPA = this.percentageToGPA(avgPercentage)

      // Pass rate (assuming 50% is passing)
      const passRate = percentages.length > 0 ?
        (percentages.filter(p => p >= 50).length / percentages.length) * 100 : 0

      // Completion rate (assessments submitted vs total assessments)
      const { data: totalAssessments } = await supabase
        .from('assessments')
        .select('id', { count: 'exact' })

      const completionRate = totalAssessments?.count && validGrades.length > 0 ?
        (validGrades.length / totalAssessments.count) * 100 : 0

      // Performance trend (last 6 terms/months)
      const performanceTrend = await this.calculatePerformanceTrend(filters)

      // Department performance
      const departmentPerformance = this.calculateDepartmentPerformance(grades || [])

      // Program performance
      const programPerformance = this.calculateProgramPerformance(grades || [])

      // Assessment type statistics
      const assessmentStats = await this.calculateAssessmentStats(filters)

      return {
        overallGPA,
        passRate,
        completionRate,
        performanceTrend,
        departmentPerformance,
        programPerformance,
        assessmentStats
      }
    } catch (error: any) {
      console.error('Error fetching performance stats:', error)
      return {
        overallGPA: 0,
        passRate: 0,
        completionRate: 0,
        performanceTrend: [],
        departmentPerformance: [],
        programPerformance: [],
        assessmentStats: []
      }
    }
  }

  // =============================================
  // INSTRUCTOR ANALYTICS
  // =============================================

  /**
   * Get instructor effectiveness statistics
   */
  static async getInstructorStats(filters?: DashboardFilters): Promise<InstructorStats> {
    try {
      // Get instructor assignments and performance
      const { data: instructors, error } = await supabase
        .from('course_instructors')
        .select(`
          *,
          users!inner (id, full_name),
          courses!inner (
            id,
            name,
            student_enrollments!inner (student_id),
            assessments!inner (
              student_grades!inner (marks_obtained, total_marks)
            )
          )
        `)

      if (error) throw new Error(`Failed to fetch instructor data: ${error.message}`)

      const totalInstructors = new Set(instructors?.map(i => i.instructor_id)).size
      const activeInstructors = instructors?.filter(i => i.is_active).length || 0

      // Calculate averages
      const coursesPerInstructor = instructors?.length > 0 ?
        instructors.length / totalInstructors : 0

      const totalStudents = instructors?.reduce((sum, instructor) =>
        sum + (instructor.courses?.student_enrollments?.length || 0), 0
      ) || 0
      const studentsPerInstructor = totalInstructors > 0 ?
        totalStudents / totalInstructors : 0

      // Instructor effectiveness
      const instructorEffectiveness = this.calculateInstructorEffectiveness(instructors || [])

      return {
        totalInstructors,
        activeInstructors,
        avgCoursesPerInstructor: Math.round(coursesPerInstructor * 10) / 10,
        avgStudentsPerInstructor: Math.round(studentsPerInstructor * 10) / 10,
        instructorEffectiveness
      }
    } catch (error: any) {
      console.error('Error fetching instructor stats:', error)
      return {
        totalInstructors: 0,
        activeInstructors: 0,
        avgCoursesPerInstructor: 0,
        avgStudentsPerInstructor: 0,
        instructorEffectiveness: []
      }
    }
  }

  // =============================================
  // FINANCIAL ANALYTICS
  // =============================================

  /**
   * Get financial statistics (enhanced with program revenue data)
   */
  static async getFinancialStats(filters?: DashboardFilters): Promise<FinancialStats> {
    try {
      // Get enrollment data with enhanced program financial info
      const { data: enrollments, error } = await supabase
        .from('student_enrollments')
        .select(`
          *,
          students!inner (
            user_id,
            users!inner (full_name)
          ),
          courses!inner (
            name,
            department_id,
            departments!inner (name),
            programs!inner (
              name,
              enhanced_programs!inner (
                tuition_fee_domestic,
                tuition_fee_international,
                materials_fee,
                laboratory_fee,
                other_fees
              )
            )
          )
        `)

      if (error) throw new Error(`Failed to fetch financial data: ${error.message}`)

      // Calculate revenue based on enhanced program fees
      let totalRevenue = 0
      let totalFees = 0
      let paidFees = 0

      const departmentRevenue: Record<string, number> = {}
      const programRevenue: Record<string, number> = {}

      enrollments?.forEach(enrollment => {
        const program = enrollment.courses?.programs
        const enhancedProgram = program?.enhanced_programs?.[0]
        const department = enrollment.courses?.departments?.name || 'Unknown'

        if (enhancedProgram) {
          const tuition = enhancedProgram.tuition_fee_domestic || 0
          const materials = enhancedProgram.materials_fee || 0
          const lab = enhancedProgram.laboratory_fee || 0

          const totalProgramFee = tuition + materials + lab
          totalRevenue += totalProgramFee
          totalFees += totalProgramFee

          // Assume 80% collection rate for demonstration
          paidFees += totalProgramFee * 0.8

          // Department revenue
          departmentRevenue[department] = (departmentRevenue[department] || 0) + totalProgramFee

          // Program revenue
          if (program?.name) {
            programRevenue[program.name] = (programRevenue[program.name] || 0) + totalProgramFee
          }
        }
      })

      const outstandingFees = totalFees - paidFees

      // Payment trend (last 12 months) - mock data for now
      const paymentTrend = this.generatePaymentTrend()

      return {
        totalRevenue,
        totalFees,
        paidFees,
        outstandingFees,
        paymentTrend,
        departmentRevenue: Object.entries(departmentRevenue).map(([dept, amount]) => ({
          department: dept,
          amount
        })),
        programRevenue: Object.entries(programRevenue).map(([program, amount]) => ({
          program,
          amount
        }))
      }
    } catch (error: any) {
      console.error('Error fetching financial stats:', error)
      return {
        totalRevenue: 0,
        totalFees: 0,
        paidFees: 0,
        outstandingFees: 0,
        paymentTrend: [],
        departmentRevenue: [],
        programRevenue: []
      }
    }
  }

  // =============================================
  // RESOURCE ANALYTICS
  // =============================================

  /**
   * Get resource utilization statistics
   */
  static async getResourceStats(filters?: DashboardFilters): Promise<ResourceStats> {
    try {
      const [coursesResult, assessmentsResult] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact' }),
        supabase.from('assessments').select('*', { count: 'exact' })
      ])

      const totalCourses = coursesResult.count || 0
      const activeCourses = coursesResult.data?.filter(c => c.is_active).length || 0
      const totalAssessments = assessmentsResult.count || 0

      // Get completed assessments
      const { data: completedGrades } = await supabase
        .from('student_grades')
        .select('assessment_id')

      const completedAssessments = new Set(completedGrades?.map(g => g.assessment_id)).size

      // Calculate average class size
      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('course_id')

      const classSizes = this.groupBy(enrollments || [], 'course_id')
      const avgClassSize = Object.values(classSizes).length > 0 ?
        Object.values(classSizes).reduce((sum: number, count) => sum + (count as number), 0) / Object.values(classSizes).length : 0

      // Mock resource utilization and facility occupancy
      const resourceUtilization = [
        { resource: 'Classrooms', utilizationRate: 75 },
        { resource: 'Laboratories', utilizationRate: 65 },
        { resource: 'Computer Labs', utilizationRate: 80 },
        { resource: 'Workshop Areas', utilizationRate: 70 },
        { resource: 'Library', utilizationRate: 60 }
      ]

      const facilityOccupancy = [
        { facility: 'Main Building', occupancyRate: 85 },
        { facility: 'Engineering Block', occupancyRate: 78 },
        { facility: 'Business Studies', occupancyRate: 72 },
        { facility: 'Trade Workshops', occupancyRate: 88 }
      ]

      return {
        totalCourses,
        activeCourses,
        totalAssessments,
        completedAssessments,
        avgClassSize: Math.round(avgClassSize * 10) / 10,
        resourceUtilization,
        facilityOccupancy
      }
    } catch (error: any) {
      console.error('Error fetching resource stats:', error)
      return {
        totalCourses: 0,
        activeCourses: 0,
        totalAssessments: 0,
        completedAssessments: 0,
        avgClassSize: 0,
        resourceUtilization: [],
        facilityOccupancy: []
      }
    }
  }

  // =============================================
  // COMPREHENSIVE ANALYTICS
  // =============================================

  /**
   * Get all analytics in one call
   */
  static async getComprehensiveAnalytics(filters?: DashboardFilters): Promise<ComprehensiveAnalytics> {
    try {
      const [enrollment, performance, instructors, financial, resources] = await Promise.all([
        this.getEnrollmentStats(filters),
        this.getPerformanceStats(filters),
        this.getInstructorStats(filters),
        this.getFinancialStats(filters),
        this.getResourceStats(filters)
      ])

      return {
        enrollment,
        performance,
        instructors,
        financial,
        resources,
        lastUpdated: new Date().toISOString()
      }
    } catch (error: any) {
      console.error('Error fetching comprehensive analytics:', error)
      throw new Error(`Failed to fetch analytics: ${error.message}`)
    }
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  private static groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = this.getNestedValue(item, key) || 'Unknown'
      groups[value] = (groups[value] || 0) + 1
      return groups
    }, {})
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private static percentageToGPA(percentage: number): number {
    if (percentage >= 90) return 4.0
    if (percentage >= 80) return 3.0
    if (percentage >= 70) return 2.0
    if (percentage >= 60) return 1.0
    return 0.0
  }

  private static calculateEnrollmentTrend(enrollments: any[]): Array<{ date: string; count: number }> {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        date: date.toISOString().slice(0, 7), // YYYY-MM format
        count: 0
      }
    })

    enrollments.forEach(enrollment => {
      const enrollmentMonth = enrollment.enrolled_at.slice(0, 7)
      const monthData = last12Months.find(m => m.date === enrollmentMonth)
      if (monthData) {
        monthData.count++
      }
    })

    return last12Months
  }

  private static calculateDepartmentPerformance(grades: any[]): Array<{ department: string; gpa: number; passRate: number }> {
    const deptGroups = this.groupGradesByDepartment(grades)

    return Object.entries(deptGroups).map(([dept, deptGrades]: [string, any[]]) => {
      const percentages = deptGrades.map(g => (g.marks_obtained / g.total_marks) * 100)
      const avgPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
      const passRate = (percentages.filter(p => p >= 50).length / percentages.length) * 100

      return {
        department: dept,
        gpa: this.percentageToGPA(avgPercentage),
        passRate
      }
    })
  }

  private static calculateProgramPerformance(grades: any[]): Array<{ program: string; gpa: number; passRate: number }> {
    const programGroups = this.groupGradesByProgram(grades)

    return Object.entries(programGroups).map(([program, programGrades]: [string, any[]]) => {
      const percentages = programGrades.map(g => (g.marks_obtained / g.total_marks) * 100)
      const avgPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
      const passRate = (percentages.filter(p => p >= 50).length / percentages.length) * 100

      return {
        program,
        gpa: this.percentageToGPA(avgPercentage),
        passRate
      }
    })
  }

  private static groupGradesByDepartment(grades: any[]): Record<string, any[]> {
    return grades.reduce((groups, grade) => {
      const dept = grade.assessments?.courses?.departments?.name || 'Unknown'
      if (!groups[dept]) groups[dept] = []
      groups[dept].push(grade)
      return groups
    }, {})
  }

  private static groupGradesByProgram(grades: any[]): Record<string, any[]> {
    return grades.reduce((groups, grade) => {
      const program = grade.assessments?.courses?.programs?.name || 'Unknown'
      if (!groups[program]) groups[program] = []
      groups[program].push(grade)
      return groups
    }, {})
  }

  private static async calculatePerformanceTrend(filters?: DashboardFilters): Promise<Array<{ period: string; gpa: number; passRate: number }>> {
    // Mock implementation - in real scenario, this would aggregate by time periods
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      return {
        period: date.toISOString().slice(0, 7),
        gpa: 2.5 + Math.random() * 1.5,
        passRate: 70 + Math.random() * 20
      }
    })
  }

  private static async calculateAssessmentStats(filters?: DashboardFilters): Promise<Array<{ type: string; avgScore: number; count: number }>> {
    // Mock implementation - would aggregate by assessment types from enhanced_assessments
    return [
      { type: 'Quiz', avgScore: 75, count: 120 },
      { type: 'Assignment', avgScore: 78, count: 85 },
      { type: 'Practical', avgScore: 82, count: 65 },
      { type: 'Exam', avgScore: 73, count: 45 },
      { type: 'Project', avgScore: 80, count: 30 }
    ]
  }

  private static calculateInstructorEffectiveness(instructors: any[]): Array<{ instructor: string; avgGrade: number; studentCount: number; courseCount: number }> {
    return instructors.map(instructor => {
      const grades = instructor.courses?.assessments?.flatMap((a: any) => a.student_grades) || []
      const avgGrade = grades.length > 0 ?
        grades.reduce((sum: number, grade: any) => sum + ((grade.marks_obtained / grade.total_marks) * 100), 0) / grades.length : 0

      return {
        instructor: instructor.users?.full_name || 'Unknown',
        avgGrade,
        studentCount: instructor.courses?.student_enrollments?.length || 0,
        courseCount: 1 // Each record represents one course assignment
      }
    })
  }

  private static generatePaymentTrend(): Array<{ month: string; amount: number }> {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        month: date.toISOString().slice(0, 7),
        amount: 50000 + Math.random() * 100000 // Mock payment amounts
      }
    })
  }
}
