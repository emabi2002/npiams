-- Enhanced User Management Schema for TVET Academic Management System
-- This schema provides dynamic role definitions, permission matrix, and user configurations

-- =============================================
-- USER ROLES AND PERMISSIONS SYSTEM
-- =============================================

-- User Role Definitions Table
CREATE TABLE IF NOT EXISTS user_role_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_code VARCHAR(20) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INTEGER NOT NULL DEFAULT 0, -- Higher numbers = more authority
    is_system_role BOOLEAN DEFAULT false, -- Cannot be deleted/modified
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permission Categories Table
CREATE TABLE IF NOT EXISTS permission_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(50) UNIQUE NOT NULL,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    permission_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES permission_categories(id),
    resource_type VARCHAR(50), -- e.g., 'user', 'course', 'assessment'
    action_type VARCHAR(50), -- e.g., 'create', 'read', 'update', 'delete'
    is_system_permission BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions Matrix
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES user_role_definitions(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    can_delegate BOOLEAN DEFAULT false, -- Can this role delegate this permission to others
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id),
    UNIQUE(role_id, permission_id)
);

-- =============================================
-- USER PROFILE VALIDATION RULES
-- =============================================

-- User Profile Field Definitions
CREATE TABLE IF NOT EXISTS user_profile_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_name VARCHAR(50) UNIQUE NOT NULL,
    field_code VARCHAR(30) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(30) NOT NULL, -- text, email, phone, date, select, multiselect
    validation_rules JSONB, -- Store validation rules as JSON
    is_required BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    help_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role-specific Field Requirements
CREATE TABLE IF NOT EXISTS role_field_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES user_role_definitions(id) ON DELETE CASCADE,
    field_id UUID REFERENCES user_profile_fields(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    custom_validation JSONB,
    UNIQUE(role_id, field_id)
);

-- =============================================
-- ENHANCED USER PROFILES
-- =============================================

-- Extended User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    national_id VARCHAR(50),
    passport_number VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Papua New Guinea',
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(50),
    qualification_level VARCHAR(100),
    specializations TEXT[],
    certifications JSONB,
    languages_spoken TEXT[],
    profile_photo_url TEXT,
    bio TEXT,
    linkedin_profile TEXT,
    other_social_links JSONB,
    custom_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- USER ACCESS CONTROL
-- =============================================

-- User Session Management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- User Permission Overrides (individual user permissions)
CREATE TABLE IF NOT EXISTS user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN NOT NULL, -- true = grant, false = revoke
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    UNIQUE(user_id, permission_id)
);

-- =============================================
-- DEPARTMENT ASSOCIATIONS
-- =============================================

-- User Department Assignments (support multiple departments)
CREATE TABLE IF NOT EXISTS user_department_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    assignment_type VARCHAR(30) DEFAULT 'primary', -- primary, secondary, temporary
    position_title VARCHAR(100),
    responsibilities TEXT[],
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, department_id, assignment_type)
);

-- =============================================
-- SEED DATA FOR SYSTEM ROLES AND PERMISSIONS
-- =============================================

-- Insert default role definitions
INSERT INTO user_role_definitions (role_name, role_code, display_name, description, hierarchy_level, is_system_role) VALUES
('admin', 'ADMIN', 'System Administrator', 'Full system access and management capabilities', 100, true),
('department_head', 'DEPT_HEAD', 'Department Head', 'Department management and oversight', 80, true),
('instructor', 'INSTRUCTOR', 'Instructor', 'Course instruction and student assessment', 60, true),
('tutor', 'TUTOR', 'Tutor', 'Student support and assistance', 40, true),
('student', 'STUDENT', 'Student', 'Access to learning materials and assessments', 20, true)
ON CONFLICT (role_code) DO NOTHING;

-- Insert permission categories
INSERT INTO permission_categories (category_name, category_code, description, display_order) VALUES
('user_management', 'USER_MGMT', 'User account creation, modification, and management', 1),
('course_management', 'COURSE_MGMT', 'Course creation, modification, and enrollment management', 2),
('assessment_management', 'ASSESS_MGMT', 'Assessment creation, grading, and moderation', 3),
('department_management', 'DEPT_MGMT', 'Department administration and resource management', 4),
('system_administration', 'SYS_ADMIN', 'System configuration and maintenance', 5),
('reporting_analytics', 'REPORTS', 'Access to reports and analytics dashboards', 6),
('student_services', 'STUDENT_SRV', 'Student support services and record management', 7)
ON CONFLICT (category_code) DO NOTHING;

-- Insert core permissions
INSERT INTO permissions (permission_name, permission_code, description, category_id, resource_type, action_type, is_system_permission) VALUES
-- User Management Permissions
('Create Users', 'USER_CREATE', 'Create new user accounts', (SELECT id FROM permission_categories WHERE category_code = 'USER_MGMT'), 'user', 'create', true),
('View Users', 'USER_READ', 'View user profiles and information', (SELECT id FROM permission_categories WHERE category_code = 'USER_MGMT'), 'user', 'read', true),
('Update Users', 'USER_UPDATE', 'Modify user profiles and settings', (SELECT id FROM permission_categories WHERE category_code = 'USER_MGMT'), 'user', 'update', true),
('Delete Users', 'USER_DELETE', 'Deactivate or remove user accounts', (SELECT id FROM permission_categories WHERE category_code = 'USER_MGMT'), 'user', 'delete', true),
('Manage User Roles', 'USER_ROLES', 'Assign and modify user roles', (SELECT id FROM permission_categories WHERE category_code = 'USER_MGMT'), 'user', 'manage', true),

-- Course Management Permissions
('Create Courses', 'COURSE_CREATE', 'Create new courses and curricula', (SELECT id FROM permission_categories WHERE category_code = 'COURSE_MGMT'), 'course', 'create', true),
('View Courses', 'COURSE_READ', 'View course information and enrollment', (SELECT id FROM permission_categories WHERE category_code = 'COURSE_MGMT'), 'course', 'read', true),
('Update Courses', 'COURSE_UPDATE', 'Modify course details and settings', (SELECT id FROM permission_categories WHERE category_code = 'COURSE_MGMT'), 'course', 'update', true),
('Delete Courses', 'COURSE_DELETE', 'Remove or archive courses', (SELECT id FROM permission_categories WHERE category_code = 'COURSE_MGMT'), 'course', 'delete', true),
('Manage Enrollments', 'COURSE_ENROLL', 'Enroll and withdraw students from courses', (SELECT id FROM permission_categories WHERE category_code = 'COURSE_MGMT'), 'course', 'manage', true),

-- Assessment Management Permissions
('Create Assessments', 'ASSESS_CREATE', 'Create assessments and grading rubrics', (SELECT id FROM permission_categories WHERE category_code = 'ASSESS_MGMT'), 'assessment', 'create', true),
('View Assessments', 'ASSESS_READ', 'View assessment results and analytics', (SELECT id FROM permission_categories WHERE category_code = 'ASSESS_MGMT'), 'assessment', 'read', true),
('Grade Assessments', 'ASSESS_GRADE', 'Enter and modify assessment grades', (SELECT id FROM permission_categories WHERE category_code = 'ASSESS_MGMT'), 'assessment', 'update', true),
('Moderate Grades', 'ASSESS_MODERATE', 'Review and approve grade changes', (SELECT id FROM permission_categories WHERE category_code = 'ASSESS_MGMT'), 'assessment', 'manage', true),

-- System Administration Permissions
('System Configuration', 'SYS_CONFIG', 'Modify system settings and configurations', (SELECT id FROM permission_categories WHERE category_code = 'SYS_ADMIN'), 'system', 'manage', true),
('View System Logs', 'SYS_LOGS', 'Access system logs and audit trails', (SELECT id FROM permission_categories WHERE category_code = 'SYS_ADMIN'), 'system', 'read', true),
('Database Management', 'SYS_DATABASE', 'Backup and restore database operations', (SELECT id FROM permission_categories WHERE category_code = 'SYS_ADMIN'), 'system', 'manage', true),

-- Reporting and Analytics
('View Reports', 'REPORT_VIEW', 'Access standard reports and dashboards', (SELECT id FROM permission_categories WHERE category_code = 'REPORTS'), 'report', 'read', true),
('Create Reports', 'REPORT_CREATE', 'Create custom reports and analytics', (SELECT id FROM permission_categories WHERE category_code = 'REPORTS'), 'report', 'create', true),
('Export Data', 'DATA_EXPORT', 'Export data in various formats', (SELECT id FROM permission_categories WHERE category_code = 'REPORTS'), 'data', 'export', true)
ON CONFLICT (permission_code) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id, can_delegate)
SELECT
    r.id as role_id,
    p.id as permission_id,
    CASE
        WHEN r.role_code = 'ADMIN' THEN true
        WHEN r.role_code = 'DEPT_HEAD' AND p.permission_code IN ('USER_CREATE', 'USER_UPDATE', 'USER_ROLES') THEN true
        ELSE false
    END as can_delegate
FROM user_role_definitions r
CROSS JOIN permissions p
WHERE
    -- Admin gets all permissions
    (r.role_code = 'ADMIN') OR
    -- Department Head permissions
    (r.role_code = 'DEPT_HEAD' AND p.permission_code IN (
        'USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_ROLES',
        'COURSE_CREATE', 'COURSE_READ', 'COURSE_UPDATE', 'COURSE_ENROLL',
        'ASSESS_CREATE', 'ASSESS_READ', 'ASSESS_GRADE', 'ASSESS_MODERATE',
        'REPORT_VIEW', 'REPORT_CREATE'
    )) OR
    -- Instructor permissions
    (r.role_code = 'INSTRUCTOR' AND p.permission_code IN (
        'USER_READ', 'COURSE_READ', 'COURSE_UPDATE', 'COURSE_ENROLL',
        'ASSESS_CREATE', 'ASSESS_READ', 'ASSESS_GRADE',
        'REPORT_VIEW'
    )) OR
    -- Tutor permissions
    (r.role_code = 'TUTOR' AND p.permission_code IN (
        'USER_READ', 'COURSE_READ', 'ASSESS_READ', 'ASSESS_GRADE',
        'REPORT_VIEW'
    )) OR
    -- Student permissions
    (r.role_code = 'STUDENT' AND p.permission_code IN (
        'COURSE_READ', 'ASSESS_READ', 'REPORT_VIEW'
    ))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Insert profile field definitions
INSERT INTO user_profile_fields (field_name, field_code, display_name, field_type, validation_rules, is_required, display_order) VALUES
('full_name', 'FULL_NAME', 'Full Name', 'text', '{"minLength": 2, "maxLength": 200}', true, 1),
('email', 'EMAIL', 'Email Address', 'email', '{"format": "email"}', true, 2),
('phone', 'PHONE', 'Phone Number', 'phone', '{"format": "international"}', false, 3),
('employee_id', 'EMP_ID', 'Employee ID', 'text', '{"pattern": "^[A-Z0-9-]+$"}', false, 4),
('national_id', 'NATIONAL_ID', 'National ID', 'text', '{"pattern": "^[0-9A-Z-]+$"}', false, 5),
('date_of_birth', 'DOB', 'Date of Birth', 'date', '{"maxDate": "today"}', false, 6),
('gender', 'GENDER', 'Gender', 'select', '{"options": ["Male", "Female", "Other", "Prefer not to say"]}', false, 7),
('nationality', 'NATIONALITY', 'Nationality', 'text', '{"default": "Papua New Guinean"}', false, 8),
('emergency_contact', 'EMERGENCY', 'Emergency Contact', 'text', '{"minLength": 10}', false, 9),
('qualifications', 'QUALS', 'Qualifications', 'multiselect', '{"options": ["Certificate", "Diploma", "Degree", "Masters", "PhD"]}', false, 10)
ON CONFLICT (field_code) DO NOTHING;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_department_assignments_user_id ON user_department_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_department_assignments_dept_id ON user_department_assignments(department_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_user_id ON user_permission_overrides(user_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_role_definitions_updated_at BEFORE UPDATE ON user_role_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profile_fields_updated_at BEFORE UPDATE ON user_profile_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile when user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, employee_id)
    VALUES (NEW.id, 'EMP-' || NEW.id::text);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

COMMENT ON SCHEMA public IS 'Enhanced User Management Schema for TVET Academic Management System';
