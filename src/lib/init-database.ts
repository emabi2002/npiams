import { supabase } from './supabase'

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database for Academic Management System integration...')

    // Check if we're working with existing academic tables or need sample data
    await checkAndCreateSamplePrograms()
    await checkAndCreateSampleIntakePeriods()
    await createSampleFees()
    await createSampleAdminUsers()

    console.log('✅ Database initialized successfully!')
    return { success: true }
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    return { success: false, error }
  }
}

async function checkAndCreateSamplePrograms() {
  console.log('📚 Checking for existing programs/courses...')

  // Try to find existing programs in various table names
  const possibleTables = ['courses', 'academic_programs', 'programs']
  let foundExistingPrograms = false

  for (const tableName of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, name, code')
        .limit(1)

      if (!error && data && data.length > 0) {
        console.log(`✅ Found existing programs in ${tableName} table - skipping sample data`)
        foundExistingPrograms = true
        break
      }
    } catch (err) {
      // Table doesn't exist, continue
    }
  }

  // Only create sample programs if none found in existing academic tables
  if (!foundExistingPrograms) {
    console.log('📚 No existing programs found - creating sample data...')

    const programs = [
      {
        name: 'Diploma in Electrical Engineering',
        code: 'DEE',
        level: 'diploma' as const,
        department: 'Engineering',
        duration_months: 36,
        description: 'Comprehensive electrical engineering program covering power systems, electronics, and control systems'
      },
      {
        name: 'Certificate in Automotive Mechanics',
        code: 'CAM',
        level: 'certificate' as const,
        department: 'Technical',
        duration_months: 18,
        description: 'Basic automotive repair and maintenance program'
      },
      {
        name: 'Diploma in Business Administration',
        code: 'DBA',
        level: 'diploma' as const,
        department: 'Business',
        duration_months: 24,
        description: 'Business management and administration program'
      },
      {
        name: 'Certificate in Computer Studies',
        code: 'CCS',
        level: 'certificate' as const,
        department: 'Computing',
        duration_months: 12,
        description: 'Introduction to computer systems and programming'
      },
      {
        name: 'Diploma in Civil Engineering',
        code: 'DCE',
        level: 'diploma' as const,
        department: 'Engineering',
        duration_months: 36,
        description: 'Civil engineering design and construction program'
      },
      {
        name: 'Certificate in Welding and Fabrication',
        code: 'CWF',
        level: 'certificate' as const,
        department: 'Technical',
        duration_months: 12,
        description: 'Welding techniques and metal fabrication skills'
      },
      {
        name: 'Diploma in Information Technology',
        code: 'DIT',
        level: 'diploma' as const,
        department: 'Computing',
        duration_months: 30,
        description: 'Advanced IT program covering networking, programming, and systems administration'
      },
      {
        name: 'Certificate in Hospitality Management',
        code: 'CHM',
        level: 'certificate' as const,
        department: 'Business',
        duration_months: 15,
        description: 'Tourism and hospitality industry management'
      }
    ]

    for (const program of programs) {
      const { error } = await supabase
        .from('programs')
        .upsert(program, { onConflict: 'code' })

      if (error) {
        console.error(`Error creating program ${program.code}:`, error)
      }
    }

    console.log('✅ Sample programs created')
  }
}

async function checkAndCreateSampleIntakePeriods() {
  console.log('📅 Checking for existing intake periods...')

  // Check if academic periods/semesters exist in academic system
  const possibleTables = ['academic_periods', 'semesters', 'intake_periods']
  let foundExistingPeriods = false

  for (const tableName of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, name')
        .limit(1)

      if (!error && data && data.length > 0) {
        console.log(`✅ Found existing periods in ${tableName} table - skipping sample data`)
        foundExistingPeriods = true
        break
      }
    } catch (err) {
      // Table doesn't exist, continue
    }
  }

  if (!foundExistingPeriods) {
    console.log('📅 Creating sample intake periods...')

    const intakePeriods = [
      {
        name: '2024 Semester 2',
        year: 2024,
        semester: 'Semester 2',
        start_date: '2024-07-15',
        end_date: '2024-12-15',
        registration_deadline: '2024-07-05',
        status: 'open' as const
      },
      {
        name: '2025 Semester 1',
        year: 2025,
        semester: 'Semester 1',
        start_date: '2025-02-03',
        end_date: '2025-06-28',
        registration_deadline: '2025-01-23',
        status: 'upcoming' as const
      },
      {
        name: '2025 Semester 2',
        year: 2025,
        semester: 'Semester 2',
        start_date: '2025-07-14',
        end_date: '2025-12-14',
        registration_deadline: '2025-07-04',
        status: 'upcoming' as const
      }
    ]

    for (const period of intakePeriods) {
      const { error } = await supabase
        .from('intake_periods')
        .upsert(period, { onConflict: 'name' })

      if (error) {
        console.error(`Error creating intake period ${period.name}:`, error)
      }
    }

    console.log('✅ Sample intake periods created')
  }
}

async function createSampleFees() {
  console.log('💰 Creating registration fees...')

  const fees = [
    {
      fee_name: 'Application Fee',
      amount: 50.00,
      mandatory: true,
      description: 'Non-refundable application processing fee'
    },
    {
      fee_name: 'Tuition Fee - Certificate',
      amount: 2500.00,
      mandatory: true,
      description: 'Annual tuition for certificate programs'
    },
    {
      fee_name: 'Tuition Fee - Diploma',
      amount: 4500.00,
      mandatory: true,
      description: 'Annual tuition for diploma programs'
    },
    {
      fee_name: 'Boarding Fee',
      amount: 1200.00,
      mandatory: false,
      description: 'Annual boarding accommodation fee'
    },
    {
      fee_name: 'Messing Fee',
      amount: 800.00,
      mandatory: false,
      description: 'Annual meals fee for boarding students'
    },
    {
      fee_name: 'ICT Usage Fee',
      amount: 200.00,
      mandatory: true,
      description: 'Computer lab and internet access fee'
    },
    {
      fee_name: 'Library Fee',
      amount: 100.00,
      mandatory: true,
      description: 'Library access and resource fee'
    },
    {
      fee_name: 'Workshop Fee',
      amount: 300.00,
      mandatory: false,
      description: 'Workshop materials and equipment usage'
    },
    {
      fee_name: 'Laboratory Fee',
      amount: 250.00,
      mandatory: false,
      description: 'Laboratory access and materials fee'
    },
    {
      fee_name: 'Student Activity Fee',
      amount: 75.00,
      mandatory: true,
      description: 'Student union and activity fees'
    }
  ]

  for (const fee of fees) {
    const { error } = await supabase
      .from('fees')
      .upsert(fee, { onConflict: 'fee_name' })

    if (error) {
      console.error(`Error creating fee ${fee.fee_name}:`, error)
    }
  }

  console.log('✅ Registration fees created')
}

async function createSampleAdminUsers() {
  console.log('👤 Creating admin users...')

  const adminUsers = [
    {
      email: 'admin@npi.ac.pg',
      name: 'System Administrator',
      role: 'super_admin' as const,
      department: 'Administration',
      is_active: true
    },
    {
      email: 'admissions@npi.ac.pg',
      name: 'Admissions Officer',
      role: 'admissions' as const,
      department: 'Student Affairs',
      is_active: true
    },
    {
      email: 'finance@npi.ac.pg',
      name: 'Finance Officer',
      role: 'finance' as const,
      department: 'Finance',
      is_active: true
    },
    {
      email: 'hostel@npi.ac.pg',
      name: 'Hostel Manager',
      role: 'hostel' as const,
      department: 'Student Life',
      is_active: true
    },
    {
      email: 'academic@npi.ac.pg',
      name: 'Academic Registrar',
      role: 'academic' as const,
      department: 'Academic Affairs',
      is_active: true
    }
  ]

  for (const user of adminUsers) {
    const { error } = await supabase
      .from('admin_users')
      .upsert(user, { onConflict: 'email' })

    if (error) {
      console.error(`Error creating admin user ${user.email}:`, error)
    }
  }

  console.log('✅ Admin users created')
}

// Function to check database connection and discover existing tables
export async function checkDatabaseConnection() {
  try {
    // Get list of all tables to understand the existing structure
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (!tablesError) {
      console.log('📋 Existing tables found:', tables?.map(t => t.table_name).join(', '))
    }

    // Try to read from various possible tables
    const { data, error } = await supabase
      .from('programs')
      .select('id')
      .limit(1)

    if (error) {
      // Try courses table
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id')
        .limit(1)

      if (!coursesError) {
        console.log('✅ Found existing courses table in Academic Management System')
      }
    }

    console.log('✅ Database connection successful')
    return { success: true, connected: true }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return { success: false, connected: false, error }
  }
}

// Function to analyze existing academic system structure
export async function analyzeAcademicSystem() {
  try {
    console.log('🔍 Analyzing existing Academic Management System...')

    const analysis = {
      hasPrograms: false,
      hasCourses: false,
      hasDepartments: false,
      hasInstructors: false,
      hasAcademicPeriods: false,
      tableStructure: {}
    }

    // Check for programs/courses
    const programTables = ['programs', 'courses', 'academic_programs']
    for (const table of programTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (!error && data) {
          analysis[`has${table.charAt(0).toUpperCase() + table.slice(1)}` as keyof typeof analysis] = true
          console.log(`✅ Found ${table} table`)
        }
      } catch (err) {
        // Table doesn't exist
      }
    }

    // Check for departments
    const deptTables = ['departments', 'faculties']
    for (const table of deptTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (!error && data) {
          analysis.hasDepartments = true
          console.log(`✅ Found ${table} table`)
        }
      } catch (err) {
        // Table doesn't exist
      }
    }

    return analysis
  } catch (error) {
    console.error('Error analyzing academic system:', error)
    return null
  }
}

// Function to reset database (for development)
export async function resetDatabase() {
  try {
    console.log('🧹 Resetting Student Registration System data...')
    console.log('⚠️  This will NOT affect existing Academic Management System data')

    // Delete only registration system data, not academic system data
    await supabase.from('payments').delete().neq('payment_id', '')
    await supabase.from('student_documents').delete().neq('document_id', '')
    await supabase.from('accommodation').delete().neq('accommodation_id', '')
    await supabase.from('students').delete().neq('id', '')
    await supabase.from('fees').delete().neq('fee_id', '')

    // Only reset intake_periods and programs if they're our sample data (not academic system data)
    const { data: programsData } = await supabase
      .from('programs')
      .select('code')
      .in('code', ['DEE', 'CAM', 'DBA', 'CCS']) // Our sample codes

    if (programsData && programsData.length > 0) {
      await supabase.from('programs').delete().in('code', ['DEE', 'CAM', 'DBA', 'CCS', 'DCE', 'CWF', 'DIT', 'CHM'])
    }

    await supabase.from('intake_periods').delete().neq('id', '')
    await supabase.from('admin_users').delete().neq('id', '')

    console.log('✅ Registration system data reset complete')
    console.log('ℹ️  Academic Management System data preserved')
    return { success: true }
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    return { success: false, error }
  }
}
