-- =============================================================================
-- ENHANCED ASSESSMENT SYSTEM DATABASE SCHEMA
-- Database-driven assessment configuration for TVET institutions
-- =============================================================================

-- =============================================================================
-- ASSESSMENT TYPES TABLE (Replaces hardcoded values)
-- =============================================================================
CREATE TABLE assessment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'assignment', 'quiz', 'midterm', 'final'
    type_name VARCHAR(100) NOT NULL, -- e.g., 'Assignment', 'Quiz', 'Mid-term Exam'
    description TEXT,
    default_weight DECIMAL(5,2) DEFAULT 20.00, -- Default percentage weight
    max_weight DECIMAL(5,2) DEFAULT 100.00, -- Maximum allowed weight
    min_weight DECIMAL(5,2) DEFAULT 0.00, -- Minimum allowed weight
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_weight_range CHECK (max_weight >= min_weight AND max_weight <= 100),
    CONSTRAINT valid_default_weight CHECK (default_weight BETWEEN min_weight AND max_weight)
);

-- =============================================================================
-- GRADE SCALES TABLE (Replaces hardcoded grade values)
-- =============================================================================
CREATE TABLE grade_scales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_code VARCHAR(10) NOT NULL UNIQUE, -- e.g., 'HD', 'D', 'C', 'P', 'F'
    grade_name VARCHAR(100) NOT NULL, -- e.g., 'High Distinction', 'Distinction'
    min_percentage DECIMAL(5,2) NOT NULL, -- Minimum percentage for this grade
    max_percentage DECIMAL(5,2) NOT NULL, -- Maximum percentage for this grade
    gpa_value DECIMAL(3,2) DEFAULT 0.00, -- GPA value for this grade
    pass_grade BOOLEAN DEFAULT FALSE, -- Whether this is a passing grade
    honor_grade BOOLEAN DEFAULT FALSE, -- Whether this is an honor grade
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_percentage_range CHECK (max_percentage >= min_percentage),
    CONSTRAINT valid_gpa_value CHECK (gpa_value >= 0.00 AND gpa_value <= 4.00),
    CONSTRAINT non_overlapping_ranges EXCLUDE USING gist (
        numrange(min_percentage, max_percentage, '[]') WITH &&
    ) WHERE (is_active = TRUE)
);

-- =============================================================================
-- ASSESSMENT VALIDATION RULES TABLE
-- =============================================================================
CREATE TABLE assessment_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'weight_total', 'minimum_assessments', 'maximum_marks', 'grade_threshold'
    rule_value TEXT NOT NULL, -- JSON or simple value
    error_message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ASSESSMENT CONFIGURATIONS TABLE
-- =============================================================================
CREATE TABLE assessment_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    semester_id UUID NOT NULL REFERENCES academic_semesters(id),
    total_marks DECIMAL(6,2) DEFAULT 100.00,
    pass_threshold DECIMAL(5,2) DEFAULT 50.00,
    honor_threshold DECIMAL(5,2) DEFAULT 80.00,
    grade_scale_id UUID REFERENCES grade_scales(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_course_semester UNIQUE (course_id, academic_year_id, semester_id),
    CONSTRAINT valid_thresholds CHECK (honor_threshold >= pass_threshold AND pass_threshold > 0)
);

-- =============================================================================
-- ASSESSMENT WEIGHTINGS TABLE
-- =============================================================================
CREATE TABLE assessment_weightings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_config_id UUID NOT NULL REFERENCES assessment_configurations(id) ON DELETE CASCADE,
    assessment_type_id UUID NOT NULL REFERENCES assessment_types(id),
    weight_percentage DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(6,2) NOT NULL,
    number_of_assessments INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_config_type UNIQUE (assessment_config_id, assessment_type_id),
    CONSTRAINT valid_weight CHECK (weight_percentage > 0 AND weight_percentage <= 100),
    CONSTRAINT valid_marks CHECK (max_marks > 0),
    CONSTRAINT valid_count CHECK (number_of_assessments > 0)
);

-- =============================================================================
-- ASSESSMENT RECORDS TABLE (Enhanced)
-- =============================================================================
CREATE TABLE assessment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_config_id UUID NOT NULL REFERENCES assessment_configurations(id),
    assessment_type_id UUID NOT NULL REFERENCES assessment_types(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    semester_id UUID NOT NULL REFERENCES academic_semesters(id),

    -- Scoring information
    marks_obtained DECIMAL(6,2),
    max_marks DECIMAL(6,2) NOT NULL,
    percentage DECIMAL(5,2),
    grade_code VARCHAR(10),

    -- Submission tracking
    submission_date TIMESTAMP WITH TIME ZONE,
    graded_date TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES users(id),

    -- Additional information
    comments TEXT,
    is_submitted BOOLEAN DEFAULT FALSE,
    is_graded BOOLEAN DEFAULT FALSE,
    is_late_submission BOOLEAN DEFAULT FALSE,
    late_penalty DECIMAL(5,2) DEFAULT 0.00,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_marks CHECK (marks_obtained IS NULL OR marks_obtained >= 0),
    CONSTRAINT valid_percentage CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100)),
    CONSTRAINT valid_late_penalty CHECK (late_penalty >= 0 AND late_penalty <= 100),
    CONSTRAINT graded_fields CHECK (
        (is_graded = FALSE) OR
        (is_graded = TRUE AND marks_obtained IS NOT NULL AND percentage IS NOT NULL AND grade_code IS NOT NULL)
    )
);

-- =============================================================================
-- STUDENT GRADE SUMMARIES TABLE (Computed results)
-- =============================================================================
CREATE TABLE student_grade_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    semester_id UUID NOT NULL REFERENCES academic_semesters(id),
    assessment_config_id UUID NOT NULL REFERENCES assessment_configurations(id),

    -- Computed results
    total_weighted_score DECIMAL(6,2),
    final_percentage DECIMAL(5,2),
    final_grade VARCHAR(10),
    gpa_value DECIMAL(3,2),

    -- Status indicators
    is_passed BOOLEAN DEFAULT FALSE,
    is_honor BOOLEAN DEFAULT FALSE,
    is_complete BOOLEAN DEFAULT FALSE,

    -- Computation metadata
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    calculation_method VARCHAR(50) DEFAULT 'weighted_average',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_student_course UNIQUE (student_id, course_id, academic_year_id, semester_id),
    CONSTRAINT valid_final_percentage CHECK (final_percentage IS NULL OR (final_percentage >= 0 AND final_percentage <= 100))
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_assessment_types_active ON assessment_types(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_grade_scales_active ON grade_scales(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_assessment_configurations_course ON assessment_configurations(course_id, academic_year_id, semester_id);
CREATE INDEX idx_assessment_weightings_config ON assessment_weightings(assessment_config_id);
CREATE INDEX idx_assessment_records_student ON assessment_records(student_id, course_id, semester_id);
CREATE INDEX idx_assessment_records_course ON assessment_records(course_id, academic_year_id, semester_id);
CREATE INDEX idx_assessment_records_graded ON assessment_records(is_graded) WHERE is_graded = TRUE;
CREATE INDEX idx_student_grade_summaries_student ON student_grade_summaries(student_id, academic_year_id, semester_id);

-- =============================================================================
-- FUNCTIONS FOR GRADE CALCULATION
-- =============================================================================

-- Function to calculate grade from percentage using grade scale
CREATE OR REPLACE FUNCTION calculate_grade_from_percentage(p_percentage DECIMAL, p_grade_scale_id UUID DEFAULT NULL)
RETURNS VARCHAR AS $$
DECLARE
    v_grade_code VARCHAR(10);
BEGIN
    -- Find the appropriate grade based on percentage
    SELECT grade_code INTO v_grade_code
    FROM grade_scales
    WHERE is_active = TRUE
    AND (p_grade_scale_id IS NULL OR id = p_grade_scale_id)
    AND p_percentage >= min_percentage
    AND p_percentage <= max_percentage
    ORDER BY min_percentage DESC
    LIMIT 1;

    -- Return grade or default to 'F' if no match
    RETURN COALESCE(v_grade_code, 'F');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate weighted final grade for a student
CREATE OR REPLACE FUNCTION calculate_student_final_grade(p_student_id UUID, p_course_id UUID, p_academic_year_id UUID, p_semester_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_config_id UUID;
    v_weighted_score DECIMAL := 0;
    v_total_weight DECIMAL := 0;
    v_assessment_record RECORD;
BEGIN
    -- Get assessment configuration
    SELECT id INTO v_config_id
    FROM assessment_configurations
    WHERE course_id = p_course_id
    AND academic_year_id = p_academic_year_id
    AND semester_id = p_semester_id
    AND is_active = TRUE;

    IF v_config_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculate weighted score from assessment records
    FOR v_assessment_record IN
        SELECT
            ar.percentage,
            aw.weight_percentage
        FROM assessment_records ar
        JOIN assessment_weightings aw ON ar.assessment_type_id = aw.assessment_type_id
            AND aw.assessment_config_id = v_config_id
        WHERE ar.student_id = p_student_id
        AND ar.course_id = p_course_id
        AND ar.academic_year_id = p_academic_year_id
        AND ar.semester_id = p_semester_id
        AND ar.is_graded = TRUE
    LOOP
        v_weighted_score := v_weighted_score + (v_assessment_record.percentage * v_assessment_record.weight_percentage / 100);
        v_total_weight := v_total_weight + v_assessment_record.weight_percentage;
    END LOOP;

    -- Return final percentage (adjust for partial completion)
    IF v_total_weight > 0 THEN
        RETURN ROUND(v_weighted_score, 2);
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update student grade summary
CREATE OR REPLACE FUNCTION update_student_grade_summary(p_student_id UUID, p_course_id UUID, p_academic_year_id UUID, p_semester_id UUID)
RETURNS VOID AS $$
DECLARE
    v_config RECORD;
    v_final_percentage DECIMAL;
    v_final_grade VARCHAR(10);
    v_gpa_value DECIMAL;
    v_is_passed BOOLEAN;
    v_is_honor BOOLEAN;
BEGIN
    -- Get assessment configuration
    SELECT * INTO v_config
    FROM assessment_configurations
    WHERE course_id = p_course_id
    AND academic_year_id = p_academic_year_id
    AND semester_id = p_semester_id
    AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate final percentage
    v_final_percentage := calculate_student_final_grade(p_student_id, p_course_id, p_academic_year_id, p_semester_id);

    IF v_final_percentage IS NOT NULL THEN
        -- Calculate grade and other metrics
        v_final_grade := calculate_grade_from_percentage(v_final_percentage, v_config.grade_scale_id);

        SELECT gpa_value, pass_grade, honor_grade
        INTO v_gpa_value, v_is_passed, v_is_honor
        FROM grade_scales
        WHERE grade_code = v_final_grade AND is_active = TRUE;

        -- Insert or update grade summary
        INSERT INTO student_grade_summaries (
            student_id, course_id, academic_year_id, semester_id, assessment_config_id,
            total_weighted_score, final_percentage, final_grade, gpa_value,
            is_passed, is_honor, is_complete, last_calculated
        ) VALUES (
            p_student_id, p_course_id, p_academic_year_id, p_semester_id, v_config.id,
            v_final_percentage, v_final_percentage, v_final_grade, v_gpa_value,
            v_is_passed, v_is_honor, TRUE, CURRENT_TIMESTAMP
        )
        ON CONFLICT (student_id, course_id, academic_year_id, semester_id)
        DO UPDATE SET
            total_weighted_score = EXCLUDED.total_weighted_score,
            final_percentage = EXCLUDED.final_percentage,
            final_grade = EXCLUDED.final_grade,
            gpa_value = EXCLUDED.gpa_value,
            is_passed = EXCLUDED.is_passed,
            is_honor = EXCLUDED.is_honor,
            is_complete = EXCLUDED.is_complete,
            last_calculated = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC GRADE CALCULATION
-- =============================================================================

-- Trigger to auto-update grade summaries when assessment records change
CREATE OR REPLACE FUNCTION trigger_update_grade_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Update grade summary for the affected student
    PERFORM update_student_grade_summary(
        COALESCE(NEW.student_id, OLD.student_id),
        COALESCE(NEW.course_id, OLD.course_id),
        COALESCE(NEW.academic_year_id, OLD.academic_year_id),
        COALESCE(NEW.semester_id, OLD.semester_id)
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessment_records_grade_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON assessment_records
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_grade_summary();

-- =============================================================================
-- INITIAL DATA POPULATION
-- =============================================================================

-- Insert standard assessment types
INSERT INTO assessment_types (type_key, type_name, description, default_weight, max_weight, min_weight, sort_order) VALUES
('assignment', 'Assignment', 'Written or practical assignments', 20.00, 50.00, 5.00, 1),
('quiz', 'Quiz', 'Short quizzes and tests', 10.00, 30.00, 5.00, 2),
('midterm', 'Mid-term Exam', 'Mid-semester examination', 30.00, 50.00, 20.00, 3),
('practical', 'Practical Assessment', 'Hands-on practical work assessment', 25.00, 60.00, 10.00, 4),
('project', 'Project', 'Major project work', 35.00, 70.00, 15.00, 5),
('final', 'Final Exam', 'Final semester examination', 40.00, 70.00, 30.00, 6),
('presentation', 'Presentation', 'Oral presentations', 15.00, 40.00, 5.00, 7),
('portfolio', 'Portfolio', 'Collection of work over time', 25.00, 50.00, 10.00, 8);

-- Insert TVET-appropriate grade scales
INSERT INTO grade_scales (grade_code, grade_name, min_percentage, max_percentage, gpa_value, pass_grade, honor_grade, sort_order) VALUES
('HD', 'High Distinction', 80.00, 100.00, 4.00, TRUE, TRUE, 1),
('D', 'Distinction', 70.00, 79.99, 3.00, TRUE, TRUE, 2),
('C', 'Credit', 60.00, 69.99, 2.00, TRUE, FALSE, 3),
('P', 'Pass', 50.00, 59.99, 1.00, TRUE, FALSE, 4),
('F', 'Fail', 0.00, 49.99, 0.00, FALSE, FALSE, 5);

-- Insert validation rules
INSERT INTO assessment_validation_rules (rule_name, rule_type, rule_value, error_message) VALUES
('Total Weight Validation', 'weight_total', '100', 'Total assessment weights must equal 100%'),
('Minimum Assessments', 'minimum_assessments', '3', 'Course must have at least 3 assessments'),
('Maximum Individual Weight', 'maximum_marks', '70', 'No single assessment should exceed 70% of total grade'),
('Minimum Pass Threshold', 'grade_threshold', '40', 'Pass threshold must be at least 40%'),
('Maximum Honor Threshold', 'grade_threshold', '90', 'Honor threshold should not exceed 90%');

-- =============================================================================
-- VIEWS FOR REPORTING
-- =============================================================================

-- View for assessment overview
CREATE VIEW assessment_overview AS
SELECT
    ac.id,
    c.course_name,
    c.course_code,
    d.department_name,
    ay.year_name,
    s.semester_name,
    ac.total_marks,
    ac.pass_threshold,
    ac.honor_threshold,
    COUNT(aw.id) as num_assessment_types,
    SUM(aw.weight_percentage) as total_weight_configured
FROM assessment_configurations ac
JOIN courses c ON ac.course_id = c.id
JOIN departments d ON c.department_id = d.id
JOIN academic_years ay ON ac.academic_year_id = ay.id
JOIN academic_semesters s ON ac.semester_id = s.id
LEFT JOIN assessment_weightings aw ON ac.id = aw.assessment_config_id AND aw.is_active = TRUE
WHERE ac.is_active = TRUE
GROUP BY ac.id, c.course_name, c.course_code, d.department_name, ay.year_name, s.semester_name,
         ac.total_marks, ac.pass_threshold, ac.honor_threshold;

-- View for student performance summary
CREATE VIEW student_performance_summary AS
SELECT
    sgs.*,
    st.full_name as student_name,
    st.student_number,
    c.course_name,
    c.course_code,
    d.department_name,
    p.program_name,
    ay.year_name,
    s.semester_name
FROM student_grade_summaries sgs
JOIN students st ON sgs.student_id = st.id
JOIN courses c ON sgs.course_id = c.id
JOIN departments d ON c.department_id = d.id
LEFT JOIN programs p ON st.program_id = p.id
JOIN academic_years ay ON sgs.academic_year_id = ay.id
JOIN academic_semesters s ON sgs.semester_id = s.id
WHERE sgs.is_complete = TRUE;
