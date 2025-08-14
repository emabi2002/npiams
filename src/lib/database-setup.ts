import { supabase } from './supabase';

// Database setup and initialization functions
export async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Test connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return { success: false, error: error.message };
    }

    console.log('Database connection successful!');
    return { success: true, message: 'Database is ready' };

  } catch (error) {
    console.error('Database setup failed:', error);
    return { success: false, error: 'Database setup failed' };
  }
}

// Create initial admin user
export async function createAdminUser(email: string, password: string, fullName: string) {
  try {
    // Sign up the admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'admin'
        }
      }
    });

    if (authError) {
      throw authError;
    }

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: fullName,
          role: 'admin'
        });

      if (profileError) {
        throw profileError;
      }

      return { success: true, user: authData.user };
    }

    return { success: false, error: 'Failed to create user' };

  } catch (error) {
    console.error('Admin user creation failed:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Check if database is properly initialized
export async function checkDatabaseHealth() {
  try {
    const checks = [];

    // Check each table exists and has data
    const tables = [
      'user_profiles',
      'academic_years',
      'departments',
      'programs',
      'courses',
      'fee_structures'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          checks.push({ table, status: 'error', error: error.message });
        } else {
          checks.push({ table, status: 'ok', count });
        }
      } catch (err) {
        checks.push({ table, status: 'error', error: (err as Error).message });
      }
    }

    return { success: true, checks };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Sample data insertion functions
export async function insertSampleData() {
  try {
    // Insert sample students
    const sampleStudents = [
      {
        student_id: 'NPI2024001',
        program_id: await getProgramId('DEE'),
        academic_year_id: await getCurrentAcademicYear(),
        current_semester: 3,
        status: 'active',
        enrollment_date: '2024-02-15',
        cgpa: 3.2,
        total_credits_completed: 48
      },
      {
        student_id: 'NPI2024002',
        program_id: await getProgramId('DBM'),
        academic_year_id: await getCurrentAcademicYear(),
        current_semester: 5,
        status: 'active',
        enrollment_date: '2023-02-20',
        cgpa: 3.8,
        total_credits_completed: 72
      }
    ];

    // This would require creating user accounts first
    console.log('Sample data structure ready');
    return { success: true, message: 'Sample data structure prepared' };

  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Helper functions
async function getProgramId(code: string) {
  const { data } = await supabase
    .from('programs')
    .select('id')
    .eq('code', code)
    .single();
  return data?.id;
}

async function getCurrentAcademicYear() {
  const { data } = await supabase
    .from('academic_years')
    .select('id')
    .eq('is_current', true)
    .single();
  return data?.id;
}
