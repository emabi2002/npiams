-- Student Registration System Database Schema
-- National Polytechnic Institute of Papua New Guinea
-- Integrates with existing Academic Management System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: This system integrates with existing Academic Management System
-- The following tables are assumed to already exist:
-- - courses/programs/academic_programs (program information)
-- - departments (department information)
-- - instructors/faculty (instructor information)
-- - academic_periods/semesters (academic calendar)

-- If programs table doesn't exist, create a minimal version
-- (This will be skipped if academic tables already exist)
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    level VARCHAR(20) CHECK (level IN ('certificate', 'diploma')) NOT NULL,
    department VARCHAR(100) NOT NULL,
    duration_months INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table - CORE TABLE for Registration System
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,

    -- Link to existing academic system (flexible foreign key)
    program_id UUID, -- References existing programs/courses table
    department_id UUID, -- References existing departments table (if available)

    intake_period VARCHAR(50),
    residency_status VARCHAR(20) CHECK (residency_status IN ('day', 'boarding', 'lodging')) DEFAULT 'day',
    biometric_data JSONB,
    photo_url TEXT,
    registration_status VARCHAR(20) CHECK (registration_status IN ('pending', 'paid', 'verified', 'rejected')) DEFAULT 'pending',
    academic_history JSONB,
    emergency_contact JSONB,

    -- Integration fields
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fees table - Registration System specific
CREATE TABLE IF NOT EXISTS fees (
    fee_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    program_id UUID, -- Links to existing programs
    department_id UUID, -- Links to existing departments (if available)
    academic_year VARCHAR(20),
    mandatory BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table - Registration System specific
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    fee_id UUID REFERENCES fees(fee_id),
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) CHECK (payment_type IN ('online', 'bank_deposit', 'campus')) NOT NULL,
    receipt_url TEXT,
    verified_by UUID,
    status VARCHAR(20) CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    transaction_reference VARCHAR(255),
    payment_date TIMESTAMPTZ,
    verification_date TIMESTAMPTZ,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table for uploaded files
CREATE TABLE IF NOT EXISTS student_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'transcript', 'id_copy', 'reference_letter', etc.
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    verified_by UUID,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accommodation table - Registration System specific
CREATE TABLE IF NOT EXISTS accommodation (
    accommodation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    hostel_name VARCHAR(100),
    room_number VARCHAR(20),
    room_type VARCHAR(20) CHECK (room_type IN ('single', 'shared', 'dorm')),
    assigned_date TIMESTAMPTZ,
    assigned_by UUID,
    status VARCHAR(20) CHECK (status IN ('pending', 'assigned', 'vacated')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intake periods (create only if doesn't exist in academic system)
CREATE TABLE IF NOT EXISTS intake_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    semester VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('open', 'closed', 'upcoming')) DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users for registration system
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('super_admin', 'admissions', 'finance', 'hostel', 'academic')) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_program_id ON students(program_id);
CREATE INDEX IF NOT EXISTS idx_students_department_id ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_registration_status ON students(registration_status);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_fees_updated_at BEFORE UPDATE ON fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_documents_updated_at BEFORE UPDATE ON student_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_accommodation_updated_at BEFORE UPDATE ON accommodation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Integration Views (Optional) - Create views to unify data from academic system
-- These help maintain compatibility while reading from existing tables

-- Unified programs view (combines data from existing academic tables)
CREATE OR REPLACE VIEW unified_programs AS
SELECT
    id,
    name,
    code,
    level,
    department,
    duration_months,
    description,
    created_at,
    updated_at
FROM programs
UNION ALL
-- Add similar SELECT from courses table if it exists with different structure
-- SELECT id, course_name as name, course_code as code, ... FROM courses
SELECT
    id::UUID,
    name::VARCHAR(255),
    code::VARCHAR(50),
    'diploma'::VARCHAR(20) as level, -- Default if not specified
    department::VARCHAR(100),
    24::INTEGER as duration_months, -- Default duration
    description::TEXT,
    created_at::TIMESTAMPTZ,
    updated_at::TIMESTAMPTZ
FROM courses
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses');

-- Row Level Security (RLS) policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Students can only view/edit their own records
CREATE POLICY IF NOT EXISTS "Students can view own data" ON students
    FOR SELECT USING (auth.uid()::text = id::text OR auth.uid()::text = email);

CREATE POLICY IF NOT EXISTS "Students can update own data" ON students
    FOR UPDATE USING (auth.uid()::text = id::text OR auth.uid()::text = email);

-- Policy: Admin can view all records
CREATE POLICY IF NOT EXISTS "Admin can view all students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );
