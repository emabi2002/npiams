-- Disable Row Level Security for Demo - Core Tables Only
-- Run this script in your Supabase SQL editor

-- Disable RLS on core tables (only if they exist)
ALTER TABLE IF EXISTS courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- These might not exist yet, so we use IF EXISTS
ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assessment_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS academic_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_logs DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS disabled on existing tables - System ready for demo!' as status;
