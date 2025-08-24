-- TVET Academic Calendar System Database Schema
-- Based on NCV Program structure with 4 terms per academic year

-- =============================================================================
-- TVET ACADEMIC YEARS TABLE (Updated for TVET structure)
-- =============================================================================
DROP TABLE IF EXISTS academic_events CASCADE;
DROP TABLE IF EXISTS academic_sessions CASCADE;
DROP TABLE IF EXISTS academic_weeks CASCADE;
DROP TABLE IF EXISTS academic_semesters CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;

CREATE TABLE tvet_academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_code VARCHAR(10) NOT NULL UNIQUE, -- e.g., '2025'
    year_name VARCHAR(100) NOT NULL, -- e.g., 'TVET College Academic Calendar – 2025 (NCV Program)'
    program_type VARCHAR(50) DEFAULT 'NCV', -- 'NCV', 'NC(V)', 'Report 191', etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Annual totals
    total_annual_lecturing_days INTEGER DEFAULT 182,
    total_annual_staff_service_days INTEGER DEFAULT 210,

    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_year_dates CHECK (end_date > start_date)
);

-- =============================================================================
-- TVET TERMS TABLE (4 terms per year)
-- =============================================================================
CREATE TABLE tvet_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES tvet_academic_years(id) ON DELETE CASCADE,

    -- Term identification
    term_code VARCHAR(20) NOT NULL, -- e.g., 'TERM1_SEM1', 'TERM2_SEM1', 'TERM3_SEM2', 'TERM4_SEM2'
    term_name VARCHAR(100) NOT NULL, -- e.g., 'Term 1 / Semester 1', 'Term 2 / Semester 1'
    term_number INTEGER NOT NULL, -- 1, 2, 3, 4
    semester_group INTEGER NOT NULL, -- 1 or 2 (Term 1&2 = Semester 1, Term 3&4 = Semester 2)

    -- TVET-specific dates
    lecturing_starts DATE NOT NULL,
    classes_commence DATE NOT NULL,
    lectures_end_exam_start DATE NOT NULL,
    college_closes DATE NOT NULL,

    -- Staff service calculations
    lecturing_staff_days INTEGER NOT NULL,
    total_staff_service_days INTEGER NOT NULL,

    -- Status
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_term_dates CHECK (
        college_closes >= lectures_end_exam_start AND
        lectures_end_exam_start >= classes_commence AND
        classes_commence >= lecturing_starts
    ),
    CONSTRAINT valid_term_number CHECK (term_number BETWEEN 1 AND 4),
    CONSTRAINT valid_semester_group CHECK (semester_group BETWEEN 1 AND 2),
    CONSTRAINT unique_term_per_year UNIQUE (academic_year_id, term_number)
);

-- =============================================================================
-- TVET SUPPLEMENTARY PERIODS TABLE
-- =============================================================================
CREATE TABLE tvet_supplementary_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES tvet_academic_years(id) ON DELETE CASCADE,
    term_id UUID REFERENCES tvet_terms(id) ON DELETE CASCADE,

    period_name VARCHAR(200) NOT NULL, -- e.g., 'Supplementary Exams for Term 1'
    period_type VARCHAR(50) NOT NULL, -- 'supplementary_exam', 'life_skills', 'computer_literacy'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Specific details
    exam_period_start DATE, -- For supplementary exams
    exam_period_end DATE,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_period_dates CHECK (end_date >= start_date)
);

-- =============================================================================
-- TVET ACADEMIC EVENTS TABLE
-- =============================================================================
CREATE TABLE tvet_academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES tvet_academic_years(id) ON DELETE CASCADE,
    term_id UUID REFERENCES tvet_terms(id) ON DELETE CASCADE,

    event_name VARCHAR(200) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'public_holiday', 'institution_holiday', 'exam_period', 'registration', 'orientation'
    event_date DATE NOT NULL,
    end_date DATE, -- For multi-day events

    -- Impact on academic calendar
    affects_lecturing_days BOOLEAN DEFAULT FALSE,
    affects_staff_service_days BOOLEAN DEFAULT FALSE,

    -- Scope
    is_institution_wide BOOLEAN DEFAULT TRUE,
    department_id UUID REFERENCES departments(id),
    program_id UUID REFERENCES programs(id),

    priority_level INTEGER DEFAULT 1, -- 1=High, 2=Medium, 3=Low
    color_code VARCHAR(7) DEFAULT '#EF4444',
    notes TEXT,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_event_dates CHECK (end_date IS NULL OR end_date >= event_date)
);

-- =============================================================================
-- TVET WEEKLY BREAKDOWN TABLE
-- =============================================================================
CREATE TABLE tvet_term_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES tvet_terms(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,

    -- Week classification
    week_type VARCHAR(50) NOT NULL, -- 'lecturing', 'exam', 'break', 'orientation', 'registration'
    is_lecturing_week BOOLEAN DEFAULT TRUE,
    is_staff_service_week BOOLEAN DEFAULT TRUE,

    lecturing_days_in_week INTEGER DEFAULT 5, -- Monday-Friday typically
    staff_service_days_in_week INTEGER DEFAULT 5,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_week_dates CHECK (week_end_date >= week_start_date),
    CONSTRAINT unique_week_per_term UNIQUE (term_id, week_number)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_tvet_academic_years_current ON tvet_academic_years(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_tvet_academic_years_active ON tvet_academic_years(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tvet_terms_current ON tvet_terms(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_tvet_terms_year ON tvet_terms(academic_year_id);
CREATE INDEX idx_tvet_terms_semester ON tvet_terms(semester_group);
CREATE INDEX idx_tvet_term_weeks_term ON tvet_term_weeks(term_id);
CREATE INDEX idx_tvet_events_date ON tvet_academic_events(event_date);
CREATE INDEX idx_tvet_events_term ON tvet_academic_events(term_id);

-- =============================================================================
-- FUNCTIONS FOR TVET CALENDAR MANAGEMENT
-- =============================================================================

-- Function to generate weeks for a TVET term
CREATE OR REPLACE FUNCTION generate_tvet_term_weeks(p_term_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_term RECORD;
    v_week_start DATE;
    v_week_end DATE;
    v_week_number INTEGER;
    v_weeks_created INTEGER := 0;
    v_lecturing_phase BOOLEAN;
BEGIN
    -- Get term details
    SELECT * INTO v_term FROM tvet_terms WHERE id = p_term_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Term not found: %', p_term_id;
    END IF;

    -- Clear existing weeks for this term
    DELETE FROM tvet_term_weeks WHERE term_id = p_term_id;

    -- Generate weeks from lecturing_starts to college_closes
    v_week_start := v_term.lecturing_starts;
    v_week_number := 1;

    WHILE v_week_start <= v_term.college_closes LOOP
        -- Calculate week end (Sunday to Saturday)
        v_week_end := v_week_start + INTERVAL '6 days';

        -- Don't exceed term end date
        IF v_week_end > v_term.college_closes THEN
            v_week_end := v_term.college_closes;
        END IF;

        -- Determine if this is lecturing phase or exam phase
        v_lecturing_phase := v_week_start < v_term.lectures_end_exam_start;

        -- Insert week
        INSERT INTO tvet_term_weeks (
            term_id,
            week_number,
            week_start_date,
            week_end_date,
            week_type,
            is_lecturing_week,
            is_staff_service_week,
            lecturing_days_in_week,
            staff_service_days_in_week
        ) VALUES (
            p_term_id,
            v_week_number,
            v_week_start,
            v_week_end,
            CASE WHEN v_lecturing_phase THEN 'lecturing' ELSE 'exam' END,
            v_lecturing_phase,
            TRUE, -- Staff always work during term
            CASE WHEN v_lecturing_phase THEN 5 ELSE 3 END, -- Reduced days during exams
            5 -- Staff work full week
        );

        v_weeks_created := v_weeks_created + 1;
        v_week_number := v_week_number + 1;
        v_week_start := v_week_end + INTERVAL '1 day';
    END LOOP;

    RETURN v_weeks_created;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate staff service days for a term
CREATE OR REPLACE FUNCTION calculate_term_staff_days(p_term_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_days INTEGER := 0;
    v_term RECORD;
BEGIN
    SELECT lecturing_starts, college_closes INTO v_term
    FROM tvet_terms WHERE id = p_term_id;

    -- Calculate total days between lecturing_starts and college_closes
    v_total_days := (v_term.college_closes - v_term.lecturing_starts) + 1;

    -- Subtract weekends (rough calculation)
    v_total_days := v_total_days - (EXTRACT(dow FROM v_term.lecturing_starts) +
                                   (v_term.college_closes - v_term.lecturing_starts) / 7 * 2);

    RETURN v_total_days;
END;
$$ LANGUAGE plpgsql;

-- Function to set current TVET term
CREATE OR REPLACE FUNCTION set_current_tvet_term(p_term_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Clear all current term flags
    UPDATE tvet_terms SET is_current = FALSE;

    -- Set the specified term as current
    UPDATE tvet_terms SET is_current = TRUE WHERE id = p_term_id;

    -- Also set the academic year as current
    UPDATE tvet_academic_years SET is_current = TRUE
    WHERE id = (SELECT academic_year_id FROM tvet_terms WHERE id = p_term_id);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE TVET DATA FOR 2025 (Based on provided calendar)
-- =============================================================================

-- Insert TVET Academic Year 2025
INSERT INTO tvet_academic_years (
    year_code,
    year_name,
    program_type,
    start_date,
    end_date,
    is_current,
    total_annual_lecturing_days,
    total_annual_staff_service_days,
    description
) VALUES (
    '2025',
    'TVET College Academic Calendar – 2025 (NCV Program)',
    'NCV',
    '2025-01-06',
    '2025-12-11',
    TRUE,
    182,
    210,
    'National Certificate Vocational Program Academic Calendar for 2025'
);

-- Insert TVET Terms for 2025
INSERT INTO tvet_terms (
    academic_year_id,
    term_code,
    term_name,
    term_number,
    semester_group,
    lecturing_starts,
    classes_commence,
    lectures_end_exam_start,
    college_closes,
    lecturing_staff_days,
    total_staff_service_days,
    is_current,
    description
)
SELECT
    y.id,
    'TERM1_SEM1',
    'Term 1 / Semester 1',
    1,
    1,
    '2025-01-06',
    '2025-01-13',
    '2025-03-28',
    '2025-03-28',
    54,
    59,
    TRUE,
    'First term of Semester 1'
FROM tvet_academic_years y WHERE y.year_code = '2025';

INSERT INTO tvet_terms (
    academic_year_id,
    term_code,
    term_name,
    term_number,
    semester_group,
    lecturing_starts,
    classes_commence,
    lectures_end_exam_start,
    college_closes,
    lecturing_staff_days,
    total_staff_service_days,
    is_current,
    description
)
SELECT
    y.id,
    'TERM2_SEM1',
    'Term 2 / Semester 1',
    2,
    1,
    '2025-04-07',
    '2025-04-07',
    '2025-06-20',
    '2025-06-20',
    47,
    47,
    FALSE,
    'Second term of Semester 1'
FROM tvet_academic_years y WHERE y.year_code = '2025';

INSERT INTO tvet_terms (
    academic_year_id,
    term_code,
    term_name,
    term_number,
    semester_group,
    lecturing_starts,
    classes_commence,
    lectures_end_exam_start,
    college_closes,
    lecturing_staff_days,
    total_staff_service_days,
    is_current,
    description
)
SELECT
    y.id,
    'TERM3_SEM2',
    'Term 3 / Semester 2',
    3,
    2,
    '2025-07-15',
    '2025-07-15',
    '2025-09-30',
    '2025-09-30',
    55,
    55,
    FALSE,
    'First term of Semester 2'
FROM tvet_academic_years y WHERE y.year_code = '2025';

INSERT INTO tvet_terms (
    academic_year_id,
    term_code,
    term_name,
    term_number,
    semester_group,
    lecturing_starts,
    classes_commence,
    lectures_end_exam_start,
    college_closes,
    lecturing_staff_days,
    total_staff_service_days,
    is_current,
    description
)
SELECT
    y.id,
    'TERM4_SEM2',
    'Term 4 / Semester 2',
    4,
    2,
    '2025-10-06',
    '2025-10-06',
    '2025-11-07',
    '2025-12-11',
    49,
    49,
    FALSE,
    'Second term of Semester 2'
FROM tvet_academic_years y WHERE y.year_code = '2025';

-- Insert Supplementary Periods
INSERT INTO tvet_supplementary_periods (
    academic_year_id,
    term_id,
    period_name,
    period_type,
    start_date,
    end_date,
    exam_period_start,
    exam_period_end,
    notes
)
SELECT
    y.id,
    t.id,
    'Supplementary Exams for Term 1',
    'supplementary_exam',
    '2025-02-13',
    '2025-03-08',
    '2025-02-13',
    '2025-03-08',
    'Higher Education & Training supplementary examination period'
FROM tvet_academic_years y
JOIN tvet_terms t ON y.id = t.academic_year_id
WHERE y.year_code = '2025' AND t.term_number = 1;

INSERT INTO tvet_supplementary_periods (
    academic_year_id,
    period_name,
    period_type,
    start_date,
    end_date,
    notes
)
SELECT
    y.id,
    'Life Skills & Computer Literacy (P2) course period',
    'life_skills',
    '2025-11-03',
    '2025-11-11',
    'Life Skills & Computer Literacy course period: 3–7 November 2025 with exams between 10 November – 11 December'
FROM tvet_academic_years y WHERE y.year_code = '2025';

-- Generate weeks for all terms
SELECT generate_tvet_term_weeks(t.id)
FROM tvet_terms t
JOIN tvet_academic_years y ON t.academic_year_id = y.id
WHERE y.year_code = '2025';

-- =============================================================================
-- VIEWS FOR TVET CALENDAR
-- =============================================================================

-- Current TVET Academic Context
CREATE VIEW current_tvet_context AS
SELECT
    y.id as academic_year_id,
    y.year_code,
    y.year_name,
    y.program_type,
    t.id as term_id,
    t.term_code,
    t.term_name,
    t.term_number,
    t.semester_group,
    t.lecturing_starts,
    t.classes_commence,
    t.lectures_end_exam_start,
    t.college_closes,
    t.lecturing_staff_days,
    t.total_staff_service_days
FROM tvet_academic_years y
JOIN tvet_terms t ON y.id = t.academic_year_id
WHERE y.is_current = TRUE AND t.is_current = TRUE;

-- TVET Calendar Overview
CREATE VIEW tvet_calendar_overview AS
SELECT
    y.year_code,
    y.year_name,
    y.program_type,
    t.term_name,
    t.term_number,
    t.semester_group,
    t.lecturing_starts,
    t.classes_commence,
    t.lectures_end_exam_start,
    t.college_closes,
    t.lecturing_staff_days,
    t.total_staff_service_days,
    COUNT(w.id) as weeks_configured
FROM tvet_academic_years y
JOIN tvet_terms t ON y.id = t.academic_year_id
LEFT JOIN tvet_term_weeks w ON t.id = w.term_id
WHERE y.is_active = TRUE
GROUP BY y.year_code, y.year_name, y.program_type, t.term_name, t.term_number,
         t.semester_group, t.lecturing_starts, t.classes_commence,
         t.lectures_end_exam_start, t.college_closes, t.lecturing_staff_days,
         t.total_staff_service_days
ORDER BY y.year_code, t.term_number;
