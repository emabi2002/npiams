-- =============================================================================
-- SYSTEM CONFIGURATION SCHEMA
-- Eliminates hardcoded values by storing system configuration in database
-- =============================================================================

-- =============================================================================
-- PROGRAM TYPES CONFIGURATION TABLE
-- =============================================================================
CREATE TABLE program_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'NCV', 'NC(V)', 'Report191'
    name VARCHAR(100) NOT NULL, -- e.g., 'National Certificate Vocational'
    description TEXT,
    default_lecturing_days INTEGER DEFAULT 182,
    default_staff_service_days INTEGER DEFAULT 210,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ACADEMIC YEAR CONFIGURATION TABLE (Enhanced)
-- =============================================================================
CREATE TABLE academic_year_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    program_type_id UUID NOT NULL REFERENCES program_types(id),
    total_lecturing_days INTEGER NOT NULL,
    total_staff_service_days INTEGER NOT NULL,
    total_terms INTEGER DEFAULT 4,
    terms_per_semester INTEGER DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_year_program UNIQUE (academic_year_id, program_type_id)
);

-- =============================================================================
-- TERM CONFIGURATION TABLE
-- =============================================================================
CREATE TABLE term_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID NOT NULL REFERENCES academic_semesters(id) ON DELETE CASCADE,
    term_number INTEGER NOT NULL, -- 1, 2, 3, 4
    semester_group INTEGER NOT NULL, -- 1 or 2 (Terms 1&2 = Sem 1, Terms 3&4 = Sem 2)

    -- TVET-specific dates
    lecturing_starts DATE NOT NULL,
    classes_commence DATE NOT NULL,
    lectures_end_exam_start DATE NOT NULL,
    college_closes DATE NOT NULL,

    -- Staff calculations
    lecturing_staff_days INTEGER NOT NULL,
    total_staff_service_days INTEGER NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_term_number CHECK (term_number BETWEEN 1 AND 4),
    CONSTRAINT valid_semester_group CHECK (semester_group BETWEEN 1 AND 2),
    CONSTRAINT valid_tvet_dates CHECK (
        college_closes >= lectures_end_exam_start AND
        lectures_end_exam_start >= classes_commence AND
        classes_commence >= lecturing_starts
    )
);

-- =============================================================================
-- SYSTEM SETTINGS TABLE
-- =============================================================================
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- DROPDOWN OPTIONS TABLE (For dynamic dropdowns)
-- =============================================================================
CREATE TABLE dropdown_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dropdown_type VARCHAR(50) NOT NULL, -- e.g., 'assessment_types', 'grade_scales', 'event_types'
    option_key VARCHAR(50) NOT NULL,
    option_label VARCHAR(100) NOT NULL,
    option_value TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_dropdown_option UNIQUE (dropdown_type, option_key)
);

-- =============================================================================
-- NAVIGATION CONFIGURATION TABLE
-- =============================================================================
CREATE TABLE navigation_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES navigation_config(id),
    menu_key VARCHAR(50) NOT NULL,
    menu_label VARCHAR(100) NOT NULL,
    menu_icon VARCHAR(50),
    menu_url VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    required_role VARCHAR(50),
    is_dropdown BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_program_types_active ON program_types(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_academic_year_config_year ON academic_year_config(academic_year_id);
CREATE INDEX idx_term_config_semester ON term_config(semester_id);
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_dropdown_options_type ON dropdown_options(dropdown_type);
CREATE INDEX idx_navigation_config_parent ON navigation_config(parent_id);

-- =============================================================================
-- INITIAL DATA POPULATION
-- =============================================================================

-- Insert Program Types
INSERT INTO program_types (code, name, description, default_lecturing_days, default_staff_service_days) VALUES
('NCV', 'National Certificate Vocational', 'National Certificate Vocational Program', 182, 210),
('NC(V)', 'NC(V)', 'NC(V) Program', 180, 210),
('Report191', 'Report 191', 'Report 191 Program', 185, 215),
('Other', 'Other Programs', 'Other institutional programs', 180, 210);

-- Insert System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category) VALUES
('institution_name', 'TVET College', 'string', 'Name of the institution', 'general'),
('academic_year_format', 'YYYY', 'string', 'Format for academic year codes', 'academic'),
('default_program_type', 'NCV', 'string', 'Default program type for new academic years', 'academic'),
('enable_hostel_management', 'true', 'boolean', 'Enable hostel and meal card allocation', 'features'),
('enable_fee_management', 'true', 'boolean', 'Enable fee management module', 'features'),
('current_academic_year', '', 'string', 'Current active academic year ID', 'academic'),
('current_semester', '', 'string', 'Current active semester ID', 'academic');

-- Insert Dropdown Options
INSERT INTO dropdown_options (dropdown_type, option_key, option_label, option_value, sort_order) VALUES
-- Assessment Types
('assessment_types', 'assignment', 'Assignment', 'assignment', 1),
('assessment_types', 'midterm', 'Mid-term Exam', 'midterm', 2),
('assessment_types', 'practical', 'Practical Assessment', 'practical', 3),
('assessment_types', 'final', 'Final Exam', 'final', 4),
('assessment_types', 'project', 'Project', 'project', 5),
('assessment_types', 'quiz', 'Quiz', 'quiz', 6),

-- Event Types
('event_types', 'holiday', 'Holiday', 'holiday', 1),
('event_types', 'deadline', 'Deadline', 'deadline', 2),
('event_types', 'exam', 'Examination', 'exam', 3),
('event_types', 'registration', 'Registration', 'registration', 4),
('event_types', 'orientation', 'Orientation', 'orientation', 5),

-- Grade Scales
('grade_scales', 'HD', 'High Distinction (80-100%)', 'HD', 1),
('grade_scales', 'D', 'Distinction (70-79%)', 'D', 2),
('grade_scales', 'C', 'Credit (60-69%)', 'C', 3),
('grade_scales', 'P', 'Pass (50-59%)', 'P', 4),
('grade_scales', 'F', 'Fail (0-49%)', 'F', 5);

-- Insert Navigation Configuration
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active) VALUES
-- Main Categories
(NULL, 'academic_setup', 'Academic Setup', 'Settings', NULL, 1, TRUE, TRUE),
(NULL, 'student_management', 'Student Management', 'Users', NULL, 2, TRUE, TRUE),
(NULL, 'fee_management', 'Fee Management', 'CreditCard', NULL, 3, TRUE, TRUE),
(NULL, 'assessment_exams', 'Assessment & Exams', 'ClipboardList', NULL, 4, TRUE, TRUE),
(NULL, 'instructor_management', 'Instructor Management', 'UserCheck', NULL, 5, TRUE, TRUE),
(NULL, 'reports_analytics', 'Reports & Analytics', 'BarChart3', NULL, 6, TRUE, TRUE);

-- Academic Setup Submenu
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'academic_years', 'Academic Years', 'Calendar', '/academic-calendar', 1, FALSE, TRUE FROM navigation_config WHERE menu_key = 'academic_setup';
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'semesters', 'Semesters & Terms', 'CalendarDays', '/academic-calendar', 2, FALSE, TRUE FROM navigation_config WHERE menu_key = 'academic_setup';
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'departments', 'Departments', 'Building2', '/departments', 3, FALSE, TRUE FROM navigation_config WHERE menu_key = 'academic_setup';
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'programs', 'Programs', 'GraduationCap', '/programs', 4, FALSE, TRUE FROM navigation_config WHERE menu_key = 'academic_setup';
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'courses', 'Courses', 'BookOpen', '/courses', 5, FALSE, TRUE FROM navigation_config WHERE menu_key = 'academic_setup';

-- Student Management Submenu
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'new_applications', 'New Applications', 'UserPlus', 'https://same-wgoiz1sb4xo-latest.netlify.app/', 1, FALSE, TRUE FROM navigation_config WHERE menu_key = 'student_management';
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'student_profiles', 'Student Profiles', 'User', '/students', 2, FALSE, TRUE FROM navigation_config WHERE menu_key = 'student_management';
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'user_management', 'User Management', 'Users', '/users', 3, FALSE, TRUE FROM navigation_config WHERE menu_key = 'student_management';

-- Assessment & Exams Submenu
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'assessments', 'Create Assessments', 'FileText', '/assessments', 1, FALSE, TRUE FROM navigation_config WHERE menu_key = 'assessment_exams';
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'grades', 'Grade Management', 'Award', '/student-grades', 2, FALSE, TRUE FROM navigation_config WHERE menu_key = 'assessment_exams';

-- Reports & Analytics Submenu
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'admin_dashboard', 'Analytics Dashboard', 'BarChart3', '/admin-dashboard', 1, FALSE, TRUE FROM navigation_config WHERE menu_key = 'reports_analytics';
INSERT INTO navigation_config (parent_id, menu_key, menu_label, menu_icon, menu_url, sort_order, is_dropdown, is_active)
SELECT id, 'reports', 'Reports', 'FileText', '/reports', 2, FALSE, TRUE FROM navigation_config WHERE menu_key = 'reports_analytics';

-- =============================================================================
-- FUNCTIONS FOR CONFIGURATION MANAGEMENT
-- =============================================================================

-- Function to get system setting
CREATE OR REPLACE FUNCTION get_system_setting(p_setting_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
    v_setting_value TEXT;
BEGIN
    SELECT setting_value INTO v_setting_value
    FROM system_settings
    WHERE setting_key = p_setting_key AND is_active = TRUE;

    RETURN v_setting_value;
END;
$$ LANGUAGE plpgsql;

-- Function to set system setting
CREATE OR REPLACE FUNCTION set_system_setting(p_setting_key VARCHAR, p_setting_value TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_settings (setting_key, setting_value, updated_at)
    VALUES (p_setting_key, p_setting_value, CURRENT_TIMESTAMP)
    ON CONFLICT (setting_key)
    DO UPDATE SET
        setting_value = EXCLUDED.setting_value,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to get dropdown options
CREATE OR REPLACE FUNCTION get_dropdown_options(p_dropdown_type VARCHAR)
RETURNS TABLE (
    option_key VARCHAR,
    option_label VARCHAR,
    option_value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.option_key,
        d.option_label,
        d.option_value
    FROM dropdown_options d
    WHERE d.dropdown_type = p_dropdown_type AND d.is_active = TRUE
    ORDER BY d.sort_order, d.option_label;
END;
$$ LANGUAGE plpgsql;
