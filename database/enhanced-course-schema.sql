-- =============================================================================
-- ENHANCED COURSE MANAGEMENT SCHEMA
-- Database-driven course configuration for TVET institutions
-- =============================================================================

-- =============================================================================
-- COURSE LEVELS TABLE (Replaces hardcoded year levels)
-- =============================================================================
CREATE TABLE course_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'CERT', 'DIP', 'ADV_DIP', 'DEGREE'
    level_name VARCHAR(100) NOT NULL, -- e.g., 'Certificate Level', 'Diploma Level'
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- CREDIT HOUR RULES TABLE (Database-driven credit validation)
-- =============================================================================
CREATE TABLE credit_hour_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_type VARCHAR(50) NOT NULL, -- e.g., 'NCV', 'NC(V)', 'Report191'
    min_credits INTEGER NOT NULL,
    max_credits INTEGER NOT NULL,
    default_credits INTEGER NOT NULL,
    contact_hours_multiplier DECIMAL(4,2) DEFAULT 15.00, -- Hours per credit
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_credit_range CHECK (max_credits >= min_credits AND min_credits > 0),
    CONSTRAINT valid_default CHECK (default_credits BETWEEN min_credits AND max_credits)
);

-- =============================================================================
-- ENHANCED COURSES TABLE (Updated with TVET requirements)
-- =============================================================================
-- Drop existing courses table if needed and recreate with enhanced structure
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES course_levels(id);
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS term_id UUID REFERENCES academic_semesters(id);
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS contact_hours INTEGER DEFAULT 0;
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS practical_hours INTEGER DEFAULT 0;
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS theory_hours INTEGER DEFAULT 0;
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS delivery_mode VARCHAR(50) DEFAULT 'face_to_face';
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS assessment_mode VARCHAR(50) DEFAULT 'mixed';
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT TRUE;
-- ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_elective BOOLEAN DEFAULT FALSE;

-- Create enhanced courses table if not exists
CREATE TABLE IF NOT EXISTS courses_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Database-driven associations
    department_id UUID NOT NULL REFERENCES departments(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    level_id UUID NOT NULL REFERENCES course_levels(id),
    term_id UUID REFERENCES academic_semesters(id), -- Optional term association

    -- TVET-specific fields
    credit_hours INTEGER NOT NULL DEFAULT 3,
    contact_hours INTEGER NOT NULL DEFAULT 45, -- Total contact hours
    practical_hours INTEGER DEFAULT 0, -- Hands-on practical hours
    theory_hours INTEGER DEFAULT 0, -- Theoretical instruction hours

    -- Delivery configuration
    delivery_mode VARCHAR(50) DEFAULT 'face_to_face', -- 'face_to_face', 'online', 'blended', 'practical'
    assessment_mode VARCHAR(50) DEFAULT 'mixed', -- 'continuous', 'final_exam', 'mixed', 'practical_based'

    -- Course classification
    is_active BOOLEAN DEFAULT TRUE,
    is_core BOOLEAN DEFAULT TRUE, -- Core course for program
    is_elective BOOLEAN DEFAULT FALSE, -- Elective course

    -- Approval workflow
    approval_status VARCHAR(30) DEFAULT 'draft', -- 'draft', 'pending', 'approved', 'rejected'
    approved_by UUID REFERENCES users(id),
    approved_date TIMESTAMP WITH TIME ZONE,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_hours CHECK (contact_hours >= (COALESCE(practical_hours, 0) + COALESCE(theory_hours, 0))),
    CONSTRAINT valid_credit_hours CHECK (credit_hours > 0 AND credit_hours <= 10),
    CONSTRAINT core_or_elective CHECK (is_core = TRUE OR is_elective = TRUE)
);

-- =============================================================================
-- COURSE PREREQUISITES TABLE
-- =============================================================================
CREATE TABLE course_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses_enhanced(id) ON DELETE CASCADE,
    prerequisite_course_id UUID NOT NULL REFERENCES courses_enhanced(id) ON DELETE CASCADE,
    prerequisite_type VARCHAR(20) DEFAULT 'required', -- 'required', 'recommended', 'concurrent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_prerequisite UNIQUE (course_id, prerequisite_course_id),
    CONSTRAINT no_self_prerequisite CHECK (course_id != prerequisite_course_id)
);

-- =============================================================================
-- COURSE OUTCOMES TABLE
-- =============================================================================
CREATE TABLE course_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses_enhanced(id) ON DELETE CASCADE,
    outcome_number INTEGER NOT NULL,
    outcome_description TEXT NOT NULL,
    outcome_type VARCHAR(30) DEFAULT 'knowledge', -- 'knowledge', 'skills', 'attitudes'
    bloom_level VARCHAR(20), -- 'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_course_outcome UNIQUE (course_id, outcome_number)
);

-- =============================================================================
-- COURSE RESOURCES TABLE
-- =============================================================================
CREATE TABLE course_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses_enhanced(id) ON DELETE CASCADE,
    resource_name VARCHAR(200) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- 'textbook', 'equipment', 'software', 'facility'
    resource_description TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    quantity_needed INTEGER DEFAULT 1,
    estimated_cost DECIMAL(10,2),
    supplier_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- COURSE SCHEDULES TABLE
-- =============================================================================
CREATE TABLE course_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses_enhanced(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    semester_id UUID NOT NULL REFERENCES academic_semesters(id),
    instructor_id UUID REFERENCES users(id),

    -- Schedule details
    day_of_week INTEGER NOT NULL, -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_location VARCHAR(100),

    -- Session type
    session_type VARCHAR(30) DEFAULT 'lecture', -- 'lecture', 'practical', 'lab', 'tutorial'
    max_students INTEGER DEFAULT 30,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_day_of_week CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT unique_schedule UNIQUE (course_id, academic_year_id, semester_id, day_of_week, start_time)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_course_levels_active ON course_levels(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_credit_hour_rules_program ON credit_hour_rules(program_type) WHERE is_active = TRUE;
CREATE INDEX idx_courses_enhanced_code ON courses_enhanced(course_code) WHERE is_active = TRUE;
CREATE INDEX idx_courses_enhanced_dept ON courses_enhanced(department_id) WHERE is_active = TRUE;
CREATE INDEX idx_courses_enhanced_program ON courses_enhanced(program_id) WHERE is_active = TRUE;
CREATE INDEX idx_courses_enhanced_level ON courses_enhanced(level_id) WHERE is_active = TRUE;
CREATE INDEX idx_course_prerequisites_course ON course_prerequisites(course_id);
CREATE INDEX idx_course_outcomes_course ON course_outcomes(course_id) WHERE is_active = TRUE;
CREATE INDEX idx_course_resources_course ON course_resources(course_id);
CREATE INDEX idx_course_schedules_course ON course_schedules(course_id, academic_year_id, semester_id);

-- =============================================================================
-- FUNCTIONS FOR COURSE MANAGEMENT
-- =============================================================================

-- Function to validate credit hours against program rules
CREATE OR REPLACE FUNCTION validate_course_credits(p_program_id UUID, p_credit_hours INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_program_type VARCHAR(50);
    v_rule RECORD;
BEGIN
    -- Get program type
    SELECT program_type INTO v_program_type
    FROM programs
    WHERE id = p_program_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Get credit hour rule for this program type
    SELECT * INTO v_rule
    FROM credit_hour_rules
    WHERE program_type = v_program_type AND is_active = TRUE;

    IF NOT FOUND THEN
        -- No specific rule, allow reasonable range
        RETURN p_credit_hours BETWEEN 1 AND 6;
    END IF;

    RETURN p_credit_hours BETWEEN v_rule.min_credits AND v_rule.max_credits;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total contact hours based on credits and program
CREATE OR REPLACE FUNCTION calculate_contact_hours(p_program_id UUID, p_credit_hours INTEGER)
RETURNS INTEGER AS $$
DECLARE
    v_program_type VARCHAR(50);
    v_multiplier DECIMAL(4,2) := 15.00;
BEGIN
    -- Get program type
    SELECT program_type INTO v_program_type
    FROM programs
    WHERE id = p_program_id;

    -- Get multiplier from rules
    SELECT contact_hours_multiplier INTO v_multiplier
    FROM credit_hour_rules
    WHERE program_type = v_program_type AND is_active = TRUE;

    RETURN (p_credit_hours * v_multiplier)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Function to check course prerequisites
CREATE OR REPLACE FUNCTION check_course_prerequisites(p_student_id UUID, p_course_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_prerequisite RECORD;
    v_completed BOOLEAN;
BEGIN
    -- Check all required prerequisites
    FOR v_prerequisite IN
        SELECT prerequisite_course_id, prerequisite_type
        FROM course_prerequisites
        WHERE course_id = p_course_id AND prerequisite_type = 'required'
    LOOP
        -- Check if student has completed this prerequisite
        SELECT EXISTS(
            SELECT 1 FROM student_grade_summaries
            WHERE student_id = p_student_id
            AND course_id = v_prerequisite.prerequisite_course_id
            AND is_passed = TRUE
        ) INTO v_completed;

        IF NOT v_completed THEN
            RETURN FALSE;
        END IF;
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate course data on insert/update
CREATE OR REPLACE FUNCTION trigger_validate_course()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate credit hours
    IF NOT validate_course_credits(NEW.program_id, NEW.credit_hours) THEN
        RAISE EXCEPTION 'Credit hours % not valid for this program type', NEW.credit_hours;
    END IF;

    -- Validate contact hours calculation
    IF NEW.theory_hours IS NOT NULL AND NEW.practical_hours IS NOT NULL THEN
        IF NEW.contact_hours < (NEW.theory_hours + NEW.practical_hours) THEN
            RAISE EXCEPTION 'Contact hours must be at least the sum of theory and practical hours';
        END IF;
    END IF;

    -- Auto-calculate contact hours if not provided
    IF NEW.contact_hours = 0 OR NEW.contact_hours IS NULL THEN
        NEW.contact_hours := calculate_contact_hours(NEW.program_id, NEW.credit_hours);
    END IF;

    -- Auto-distribute theory/practical hours if not provided
    IF NEW.theory_hours IS NULL OR NEW.practical_hours IS NULL THEN
        NEW.theory_hours := FLOOR(NEW.contact_hours * 0.6);
        NEW.practical_hours := NEW.contact_hours - NEW.theory_hours;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_validation_trigger
    BEFORE INSERT OR UPDATE ON courses_enhanced
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_course();

-- =============================================================================
-- INITIAL DATA POPULATION
-- =============================================================================

-- Insert TVET course levels
INSERT INTO course_levels (level_code, level_name, description, sort_order) VALUES
('CERT_I', 'Certificate I', 'Certificate I level courses - basic skills', 1),
('CERT_II', 'Certificate II', 'Certificate II level courses - foundation skills', 2),
('CERT_III', 'Certificate III', 'Certificate III level courses - trade level', 3),
('CERT_IV', 'Certificate IV', 'Certificate IV level courses - supervisory level', 4),
('DIPLOMA', 'Diploma', 'Diploma level courses - advanced technical skills', 5),
('ADV_DIPLOMA', 'Advanced Diploma', 'Advanced Diploma level courses - management level', 6);

-- Insert credit hour rules for TVET programs
INSERT INTO credit_hour_rules (program_type, min_credits, max_credits, default_credits, contact_hours_multiplier) VALUES
('NCV', 2, 6, 4, 18.00),
('NC(V)', 2, 6, 4, 18.00),
('Report191', 3, 8, 5, 20.00),
('Certificate', 1, 4, 2, 15.00),
('Diploma', 2, 6, 4, 18.00),
('Other', 1, 6, 3, 15.00);

-- Insert delivery modes into dropdown_options
INSERT INTO dropdown_options (dropdown_type, option_key, option_label, option_value, sort_order) VALUES
('delivery_modes', 'face_to_face', 'Face-to-Face', 'face_to_face', 1),
('delivery_modes', 'online', 'Online Learning', 'online', 2),
('delivery_modes', 'blended', 'Blended Learning', 'blended', 3),
('delivery_modes', 'practical', 'Practical/Workshop', 'practical', 4),
('delivery_modes', 'field_work', 'Field Work', 'field_work', 5);

-- Insert assessment modes into dropdown_options
INSERT INTO dropdown_options (dropdown_type, option_key, option_label, option_value, sort_order) VALUES
('assessment_modes', 'continuous', 'Continuous Assessment', 'continuous', 1),
('assessment_modes', 'final_exam', 'Final Examination', 'final_exam', 2),
('assessment_modes', 'mixed', 'Mixed Assessment', 'mixed', 3),
('assessment_modes', 'practical_based', 'Practical-Based Assessment', 'practical_based', 4),
('assessment_modes', 'portfolio', 'Portfolio Assessment', 'portfolio', 5),
('assessment_modes', 'competency_based', 'Competency-Based Assessment', 'competency_based', 6);

-- Insert course levels into dropdown_options for backward compatibility
INSERT INTO dropdown_options (dropdown_type, option_key, option_label, option_value, sort_order) VALUES
('course_levels', 'cert_i', 'Certificate I', 'cert_i', 1),
('course_levels', 'cert_ii', 'Certificate II', 'cert_ii', 2),
('course_levels', 'cert_iii', 'Certificate III', 'cert_iii', 3),
('course_levels', 'cert_iv', 'Certificate IV', 'cert_iv', 4),
('course_levels', 'diploma', 'Diploma', 'diploma', 5),
('course_levels', 'adv_diploma', 'Advanced Diploma', 'adv_diploma', 6);

-- =============================================================================
-- VIEWS FOR REPORTING
-- =============================================================================

-- View for course overview with all relationships
CREATE VIEW course_overview AS
SELECT
    c.id,
    c.course_code,
    c.course_name,
    c.description,
    c.credit_hours,
    c.contact_hours,
    c.practical_hours,
    c.theory_hours,
    c.delivery_mode,
    c.assessment_mode,
    c.is_core,
    c.is_elective,
    c.approval_status,
    d.name as department_name,
    d.code as department_code,
    p.name as program_name,
    p.code as program_code,
    cl.level_name,
    cl.level_code,
    COUNT(cp.id) as prerequisite_count,
    COUNT(co.id) as outcome_count,
    COUNT(cr.id) as resource_count
FROM courses_enhanced c
JOIN departments d ON c.department_id = d.id
JOIN programs p ON c.program_id = p.id
JOIN course_levels cl ON c.level_id = cl.id
LEFT JOIN course_prerequisites cp ON c.id = cp.course_id
LEFT JOIN course_outcomes co ON c.id = co.course_id AND co.is_active = TRUE
LEFT JOIN course_resources cr ON c.id = cr.course_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.course_code, c.course_name, c.description, c.credit_hours, c.contact_hours,
         c.practical_hours, c.theory_hours, c.delivery_mode, c.assessment_mode, c.is_core,
         c.is_elective, c.approval_status, d.name, d.code, p.name, p.code, cl.level_name, cl.level_code
ORDER BY c.course_code;

-- View for course workload analysis
CREATE VIEW course_workload_analysis AS
SELECT
    p.name as program_name,
    cl.level_name,
    c.delivery_mode,
    COUNT(*) as course_count,
    SUM(c.credit_hours) as total_credits,
    SUM(c.contact_hours) as total_contact_hours,
    AVG(c.credit_hours) as avg_credits_per_course,
    AVG(c.contact_hours) as avg_contact_hours_per_course,
    SUM(c.practical_hours) as total_practical_hours,
    SUM(c.theory_hours) as total_theory_hours
FROM courses_enhanced c
JOIN programs p ON c.program_id = p.id
JOIN course_levels cl ON c.level_id = cl.id
WHERE c.is_active = TRUE
GROUP BY p.name, cl.level_name, c.delivery_mode
ORDER BY p.name, cl.level_name, c.delivery_mode;
