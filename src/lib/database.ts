import { supabase } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']
type Student = Tables['students']['Row']
type Program = Tables['programs']['Row']
type Payment = Tables['payments']['Row']
type Fee = Tables['fees']['Row']

// Programs - Read from real Academic Management System tables
export async function getPrograms() {
  try {
    console.log('🔍 Fetching programs from Academic Management System...')

    // First try to get programs with department information
    const { data: programsData, error: programsError } = await supabase
      .from('programs')
      .select(`
        *,
        departments (
          id,
          name,
          code,
          description
        )
      `)
      .order('name')

    if (!programsError && programsData && programsData.length > 0) {
      console.log(`✅ Found ${programsData.length} programs with departments`)
      return programsData.map(program => ({
        id: program.id,
        name: program.name || program.program_name || program.title,
        code: program.code || program.program_code,
        level: program.level || program.type || 'diploma',
        department: program.departments?.name || program.department_name || 'Unknown Department',
        department_id: program.department_id,
        duration_years: program.duration_years || 2,
        duration_months: (program.duration_years || 2) * 12,
        description: program.description || '',
        is_active: program.is_active || true,
        created_at: program.created_at,
        updated_at: program.updated_at
      }))
    }

    // If that fails, try courses table
    console.log('📚 Trying courses table...')
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select(`
        *,
        departments (
          id,
          name,
          code,
          description
        )
      `)
      .order('name')

    if (!coursesError && coursesData && coursesData.length > 0) {
      console.log(`✅ Found ${coursesData.length} courses with departments`)
      return coursesData.map(course => ({
        id: course.id,
        name: course.name || course.course_name || course.title,
        code: course.code || course.course_code,
        level: course.level || course.type || 'diploma',
        department: course.departments?.name || course.department_name || 'Unknown Department',
        department_id: course.department_id,
        duration_years: course.duration_years || 2,
        duration_months: (course.duration_years || 2) * 12,
        description: course.description || '',
        is_active: course.is_active || true,
        created_at: course.created_at,
        updated_at: course.updated_at
      }))
    }

    // If both fail, try without joins
    console.log('📚 Trying basic programs query...')
    const { data: basicData, error: basicError } = await supabase
      .from('programs')
      .select('*')
      .order('name')

    if (!basicError && basicData && basicData.length > 0) {
      console.log(`✅ Found ${basicData.length} basic programs`)

      // Get departments separately
      const { data: departments } = await supabase
        .from('departments')
        .select('*')

      const departmentMap = departments?.reduce((acc, dept) => {
        acc[dept.id] = dept.name
        return acc
      }, {} as Record<string, string>) || {}

      return basicData.map(program => ({
        id: program.id,
        name: program.name || program.program_name || program.title,
        code: program.code || program.program_code,
        level: program.level || program.type || 'diploma',
        department: departmentMap[program.department_id] || program.department_name || 'Unknown Department',
        department_id: program.department_id,
        duration_years: program.duration_years || 2,
        duration_months: (program.duration_years || 2) * 12,
        description: program.description || '',
        is_active: program.is_active || true,
        created_at: program.created_at,
        updated_at: program.updated_at
      }))
    }

    console.log('❌ No programs found in any table')
    return []
  } catch (error) {
    console.error('❌ Error fetching programs:', error)
    return []
  }
}

// Departments - Get all departments for lookup
export async function getDepartments() {
  try {
    console.log('🏢 Fetching departments from Academic Management System...')

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    if (error) {
      console.error('❌ Error fetching departments:', error)
      return []
    }

    console.log(`✅ Found ${data?.length || 0} departments`)
    return data || []
  } catch (error) {
    console.error('❌ Error in getDepartments:', error)
    return []
  }
}

// Courses - Get all courses for lookup
export async function getCourses() {
  try {
    console.log('📚 Fetching courses from Academic Management System...')

    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        departments (
          id,
          name,
          code
        )
      `)
      .order('name')

    if (error) {
      console.error('❌ Error fetching courses:', error)
      return []
    }

    console.log(`✅ Found ${data?.length || 0} courses`)
    return data || []
  } catch (error) {
    console.error('❌ Error in getCourses:', error)
    return []
  }
}

export async function getProgramById(id: string) {
  // Try existing academic tables first
  const possibleTables = ['courses', 'academic_programs', 'programs'];

  for (const tableName of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        return data
      }
    } catch (err) {
      // Continue to next table
    }
  }

  // Fallback to our table
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching program:', error)
    throw error
  }

  return data
}

// Students
export async function createStudent(studentData: Tables['students']['Insert']) {
  const { data, error } = await supabase
    .from('students')
    .insert(studentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating student:', error)
    throw error
  }

  return data
}

export async function getStudentById(id: string) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      programs (
        id,
        name,
        code,
        level,
        department
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching student:', error)
    throw error
  }

  return data
}

export async function getStudentByStudentId(studentId: string) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      programs (
        id,
        name,
        code,
        level,
        department
      )
    `)
    .eq('student_id', studentId)
    .single()

  if (error) {
    console.error('Error fetching student:', error)
    throw error
  }

  return data
}

export async function getAllStudents(filters?: {
  program_id?: string
  registration_status?: string
  residency_status?: string
}) {
  let query = supabase
    .from('students')
    .select(`
      *,
      programs (
        id,
        name,
        code,
        level,
        department
      )
    `)

  if (filters?.program_id) {
    query = query.eq('program_id', filters.program_id)
  }

  if (filters?.registration_status) {
    query = query.eq('registration_status', filters.registration_status)
  }

  if (filters?.residency_status) {
    query = query.eq('residency_status', filters.residency_status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching students:', error)
    throw error
  }

  return data
}

export async function updateStudent(id: string, updates: Tables['students']['Update']) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating student:', error)
    throw error
  }

  return data
}

// Payments
export async function createPayment(paymentData: Tables['payments']['Insert']) {
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating payment:', error)
    throw error
  }

  return data
}

export async function getPaymentsByStudentId(studentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    throw error
  }

  return data
}

export async function updatePaymentStatus(paymentId: string, status: 'pending' | 'verified' | 'rejected', verifiedBy?: string, notes?: string) {
  const updates: Record<string, string | number> = {
    status,
    updated_at: new Date().toISOString()
  }

  if (verifiedBy) updates.verified_by = verifiedBy
  if (notes) updates.verification_notes = notes
  if (status === 'verified') updates.verification_date = new Date().toISOString()

  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('payment_id', paymentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating payment:', error)
    throw error
  }

  return data
}

// Fees
export async function getFees(programId?: string) {
  let query = supabase
    .from('fees')
    .select('*')

  if (programId) {
    query = query.or(`program_id.eq.${programId},program_id.is.null`)
  }

  const { data, error } = await query.order('fee_name')

  if (error) {
    console.error('Error fetching fees:', error)
    throw error
  }

  return data
}

export async function createFee(feeData: Tables['fees']['Insert']) {
  const { data, error } = await supabase
    .from('fees')
    .insert(feeData)
    .select()
    .single()

  if (error) {
    console.error('Error creating fee:', error)
    throw error
  }

  return data
}

// Intake Periods
export async function getIntakePeriods() {
  const { data, error } = await supabase
    .from('intake_periods')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching intake periods:', error)
    throw error
  }

  return data
}

// Student Documents
export async function createStudentDocument(documentData: {
  student_id: string
  document_type: string
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  verification_status?: 'pending' | 'verified' | 'rejected'
}) {
  const { data, error } = await supabase
    .from('student_documents')
    .insert(documentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    throw error
  }

  return data
}

export async function getStudentDocuments(studentId: string) {
  const { data, error } = await supabase
    .from('student_documents')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    throw error
  }

  return data
}

// Statistics for dashboard
export async function getDashboardStats() {
  try {
    // Get total students
    const { count: totalStudents, error: studentsError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    // Get pending applications
    const { count: pendingApplications, error: pendingError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('registration_status', 'pending')

    // Get verified students
    const { count: verifiedStudents, error: verifiedError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('registration_status', 'verified')

    // Get total programs - try multiple tables
    let totalPrograms = 0
    let programsError = null

    // Try programs table first
    const { count: programsCount, error: progError } = await supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })

    if (!progError && programsCount !== null) {
      totalPrograms = programsCount
    } else {
      // Try courses table if programs fails
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      if (!coursesError && coursesCount !== null) {
        totalPrograms = coursesCount
      } else {
        programsError = progError || coursesError
      }
    }

    // Get pending payments
    const { count: pendingPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Return stats, defaulting to 0 if there are errors (likely due to missing tables)
    return {
      totalStudents: studentsError ? 0 : (totalStudents || 0),
      pendingApplications: pendingError ? 0 : (pendingApplications || 0),
      verifiedStudents: verifiedError ? 0 : (verifiedStudents || 0),
      totalPrograms: programsError ? 0 : (totalPrograms || 0),
      pendingPayments: paymentsError ? 0 : (pendingPayments || 0)
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return default stats if there's an error
    return {
      totalStudents: 0,
      pendingApplications: 0,
      verifiedStudents: 0,
      totalPrograms: 0,
      pendingPayments: 0
    }
  }
}

// Generate unique student ID
export async function generateStudentId(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `NPI${year}`

  // Get the latest student ID for this year
  const { data, error } = await supabase
    .from('students')
    .select('student_id')
    .like('student_id', `${prefix}%`)
    .order('student_id', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error generating student ID:', error)
    throw error
  }

  let nextNumber = 1

  if (data && data.length > 0) {
    const lastId = data[0].student_id
    const lastNumber = parseInt(lastId.replace(prefix, ''))
    nextNumber = lastNumber + 1
  }

  // Pad with zeros to make it 4 digits
  const paddedNumber = nextNumber.toString().padStart(4, '0')

  return `${prefix}${paddedNumber}`
}
