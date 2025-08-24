-- Disable Row Level Security for Demo/Development
-- Run this script in your Supabase SQL editor to allow full access to all tables

-- Disable RLS on all main tables
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (if they exist)
DROP POLICY IF EXISTS "courses_all_access" ON courses;
DROP POLICY IF EXISTS "courses_public_read" ON courses;
DROP POLICY IF EXISTS "departments_all_access" ON departments;
DROP POLICY IF EXISTS "departments_public_read" ON departments;
DROP POLICY IF EXISTS "programs_all_access" ON programs;
DROP POLICY IF EXISTS "programs_public_read" ON programs;
DROP POLICY IF EXISTS "users_all_access" ON users;
DROP POLICY IF EXISTS "users_public_read" ON users;

-- Success message
SELECT 'RLS disabled on all tables - System ready for demo!' as status;
