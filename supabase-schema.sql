-- NPI TVET Academic Management System Database Schema
-- This script creates all necessary tables and policies for the TVET system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'instructor', 'student');
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE student_status AS ENUM ('active', 'graduated', 'suspended', 'withdrawn');
CREATE TYPE assessment_type AS ENUM ('exam', 'assignment', 'project', 'quiz');
CREATE TYPE assessment_status AS ENUM ('draft', 'scheduled', 'active', 'completed', 'graded');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid', 'overdue');

-- 1. User Profiles Table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    phone TEXT,
    address TEXT,
    province TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g., "ENG", "BUS"
    head_name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Programs
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g., "DEE", "DBM"
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    duration_years INTEGER NOT NULL,
    total_credits INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g., "EE101"
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    description TEXT,
    prerequisites TEXT[], -- Array of course codes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Student Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    province TEXT,
    program_id UUID REFERENCES programs(id),
    status application_status DEFAULT 'pending',
    documents JSONB, -- Store document metadata
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES user_profiles(id),
    notes TEXT
);

-- 7. Students (enrolled students)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE NOT NULL, -- e.g., "NPI2024001"
    program_id UUID REFERENCES programs(id),
    academic_year_id UUID REFERENCES academic_years(id),
    current_semester INTEGER DEFAULT 1,
    status student_status DEFAULT 'active',
    enrollment_date DATE NOT NULL,
    graduation_date DATE,
    cgpa DECIMAL(3,2) DEFAULT 0.00,
    total_credits_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Course Enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id),
    semester INTEGER NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id, academic_year_id)
);

-- 9. Assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    type assessment_type NOT NULL,
    total_marks INTEGER NOT NULL,
    weightage DECIMAL(5,2), -- Percentage contribution to final grade
    assessment_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    instructions TEXT,
    status assessment_status DEFAULT 'draft',
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Grades
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2) NOT NULL,
    grade TEXT, -- A+, A, B+, B, C+, C, D, F
    gpa_points DECIMAL(3,2), -- 4.0 scale
    remarks TEXT,
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_by UUID REFERENCES user_profiles(id),
    UNIQUE(student_id, assessment_id)
);

-- 11. Fee Structure
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id),
    semester_fee DECIMAL(10,2) NOT NULL,
    application_fee DECIMAL(10,2) DEFAULT 0,
    materials_fee DECIMAL(10,2) DEFAULT 0,
    lab_fee DECIMAL(10,2) DEFAULT 0,
    other_fees JSONB, -- Additional fees as key-value pairs
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Student Payments
CREATE TABLE student_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id),
    semester INTEGER NOT NULL,
    total_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    payment_status payment_status DEFAULT 'unpaid',
    last_payment_date DATE,
    payment_method TEXT,
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Instructors (teaching assignments)
CREATE TABLE instructor_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id),
    semester INTEGER NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(instructor_id, course_id, academic_year_id, semester)
);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_assignments ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Academic Data Policies (readable by all authenticated users)
CREATE POLICY "Academic data is readable by authenticated users" ON academic_years
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Academic data is readable by authenticated users" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Academic data is readable by authenticated users" ON programs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Academic data is readable by authenticated users" ON courses
    FOR SELECT USING (auth.role() = 'authenticated');

-- Applications Policies
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Staff can manage applications" ON applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Students Policies
CREATE POLICY "Students can view their own record" ON students
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can manage student records" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Grades Policies
CREATE POLICY "Students can view their own grades" ON grades
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Instructors can manage grades for their courses" ON grades
    FOR ALL USING (
        assessment_id IN (
            SELECT a.id FROM assessments a
            JOIN instructor_assignments ia ON ia.course_id = a.course_id
            WHERE ia.instructor_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Functions for automatic updates

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate student ID
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_student_id TEXT;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM 8) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM students
    WHERE student_id LIKE 'NPI' || year_part || '%';

    -- Generate new student ID
    new_student_id := 'NPI' || year_part || LPAD(sequence_num::TEXT, 3, '0');

    NEW.student_id := new_student_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for student ID generation
CREATE TRIGGER generate_student_id_trigger
    BEFORE INSERT ON students
    FOR EACH ROW
    WHEN (NEW.student_id IS NULL)
    EXECUTE FUNCTION generate_student_id();

-- Insert initial data

-- Insert academic year
INSERT INTO academic_years (name, start_date, end_date, is_current)
VALUES ('2024-2025', '2024-02-01', '2025-01-31', TRUE);

-- Insert departments
INSERT INTO departments (name, code, head_name, description) VALUES
('Engineering & Technology', 'ENG', 'Dr. John Kila', 'Technical and engineering programs'),
('Business & Commerce', 'BUS', 'Ms. Mary Tau', 'Business and commercial programs'),
('Agriculture & Applied Sciences', 'AGR', 'Dr. Peter Namaliu', 'Agricultural and applied science programs'),
('Health & Community Services', 'HLT', 'Sr. Grace Mondo', 'Health and community service programs');

-- Insert programs
INSERT INTO programs (name, code, department_id, duration_years, total_credits, description) VALUES
('Diploma in Electrical Engineering', 'DEE',
    (SELECT id FROM departments WHERE code = 'ENG'), 3, 120,
    'Comprehensive electrical engineering program covering power systems, electronics, and industrial automation'),
('Certificate in Automotive Technology', 'CAT',
    (SELECT id FROM departments WHERE code = 'ENG'), 2, 80,
    'Hands-on automotive repair and maintenance training for modern vehicles'),
('Diploma in Business Management', 'DBM',
    (SELECT id FROM departments WHERE code = 'BUS'), 3, 120,
    'Business fundamentals, management principles, and entrepreneurship skills'),
('Certificate in Office Administration', 'COA',
    (SELECT id FROM departments WHERE code = 'BUS'), 1, 40,
    'Essential office skills including computer applications and administrative procedures'),
('Diploma in Agriculture Technology', 'DAT',
    (SELECT id FROM departments WHERE code = 'AGR'), 3, 120,
    'Modern farming techniques, crop management, and sustainable agriculture practices'),
('Certificate in Community Health', 'CCH',
    (SELECT id FROM departments WHERE code = 'HLT'), 2, 80,
    'Basic healthcare, community health education, and primary care assistance');

-- Insert sample courses
INSERT INTO courses (name, code, program_id, credits, semester, description) VALUES
('Fundamentals of Electrical Engineering', 'EE101',
    (SELECT id FROM programs WHERE code = 'DEE'), 4, 1,
    'Introduction to electrical circuits, voltage, current, and basic electrical components'),
('Power Systems and Distribution', 'EE201',
    (SELECT id FROM programs WHERE code = 'DEE'), 5, 3,
    'Power generation, transmission, and distribution systems in PNG context'),
('Engine Fundamentals', 'AT101',
    (SELECT id FROM programs WHERE code = 'CAT'), 4, 1,
    'Internal combustion engines, diesel and petrol engine operations'),
('Introduction to Business', 'BM101',
    (SELECT id FROM programs WHERE code = 'DBM'), 3, 1,
    'Business fundamentals, organizational structures, and management principles'),
('Tropical Agriculture', 'AG101',
    (SELECT id FROM programs WHERE code = 'DAT'), 4, 1,
    'Agricultural practices suited to PNG''s tropical climate and soil conditions'),
('Community Health Basics', 'CH101',
    (SELECT id FROM programs WHERE code = 'CCH'), 3, 1,
    'Introduction to community health principles and primary healthcare');

-- Insert fee structures
INSERT INTO fee_structures (program_id, academic_year_id, semester_fee, application_fee, materials_fee, lab_fee)
SELECT
    p.id,
    (SELECT id FROM academic_years WHERE is_current = TRUE),
    CASE
        WHEN p.code LIKE 'D%' THEN 2500.00  -- Diploma programs
        ELSE 2000.00  -- Certificate programs
    END,
    100.00,
    CASE
        WHEN p.department_id = (SELECT id FROM departments WHERE code = 'ENG') THEN 300.00
        WHEN p.department_id = (SELECT id FROM departments WHERE code = 'BUS') THEN 150.00
        WHEN p.department_id = (SELECT id FROM departments WHERE code = 'AGR') THEN 200.00
        ELSE 200.00
    END,
    CASE
        WHEN p.department_id = (SELECT id FROM departments WHERE code = 'ENG') THEN 200.00
        WHEN p.department_id = (SELECT id FROM departments WHERE code = 'HLT') THEN 100.00
        ELSE 0.00
    END
FROM programs p;

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_program_id ON students(program_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_assessment_id ON grades(assessment_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_program_id ON applications(program_id);
