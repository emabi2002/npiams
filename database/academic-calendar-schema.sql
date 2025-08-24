-- Academic Calendar System Database Schema
-- This system provides the foundation for academic scheduling, assessments, and timetables

-- =============================================================================
-- ACADEMIC YEARS TABLE
-- =============================================================================
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_code VARCHAR(10) NOT NULL UNIQUE, -- e.g., '2024', '2025'
    year_name VARCHAR(50) NOT NULL, -- e.g., 'Academic Year 2024', '2024-2025'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_year_dates CHECK (end_date > start_date),
    CONSTRAINT valid_year_code CHECK (year_code ~ '^[0-9]{4}(-[0-9]{4})?$')
);

-- =============================================================================
-- ACADEMIC SEMESTERS/TERMS TABLE
-- =============================================================================
CREATE TABLE academic_semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_code VARCHAR(20) NOT NULL, -- e.g., 'SEM1', 'SEM2', 'TERM1', 'TERM2'
    semester_name VARCHAR(100) NOT NULL, -- e.g., 'Semester 1', 'Term 1'
    semester_number INTEGER NOT NULL, -- 1, 2, 3, 4
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    total_weeks INTEGER DEFAULT 18,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_semester_dates CHECK (end_date > start_date),
    CONSTRAINT valid_semester_number CHECK (semester_number BETWEEN 1 AND 4),
    CONSTRAINT unique_semester_per_year UNIQUE (academic_year_id, semester_number),
    CONSTRAINT unique_semester_code_per_year UNIQUE (academic_year_id, semester_code)
);

-- =============================================================================
-- ACADEMIC WEEKS TABLE
-- =============================================================================
CREATE TABLE academic_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID NOT NULL REFERENCES academic_semesters(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    week_name VARCHAR(50) NOT NULL, -- e.g., 'Week 1', 'Week 2'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    week_type VARCHAR(30) DEFAULT 'teaching', -- 'teaching', 'break', 'exam', 'orientation'
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_week_dates CHECK (end_date > start_date),
    CONSTRAINT valid_week_number CHECK (week_number BETWEEN 1 AND 52),
    CONSTRAINT unique_week_per_semester UNIQUE (semester_id, week_number)
);

-- =============================================================================
-- ACADEMIC SESSIONS/PERIODS TABLE
-- =============================================================================
CREATE TABLE academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID NOT NULL REFERENCES academic_semesters(id) ON DELETE CASCADE,
    session_name VARCHAR(100) NOT NULL, -- e.g., 'Orientation Week', 'Mid-Semester Break'
    session_type VARCHAR(50) NOT NULL, -- 'orientation', 'teaching', 'break', 'exam', 'registration'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_week INTEGER, -- Reference to week number
    end_week INTEGER, -- Reference to week number
    is_mandatory BOOLEAN DEFAULT FALSE,
    color_code VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for calendar display
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_session_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_session_weeks CHECK (end_week >= start_week OR (start_week IS NULL AND end_week IS NULL))
);

-- =============================================================================
-- ACADEMIC CALENDAR EVENTS TABLE
-- =============================================================================
CREATE TABLE academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES academic_semesters(id) ON DELETE CASCADE,
    week_id UUID REFERENCES academic_weeks(id) ON DELETE CASCADE,
    event_name VARCHAR(200) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'holiday', 'deadline', 'exam', 'registration', 'orientation'
    event_date DATE NOT NULL,
    end_date DATE, -- For multi-day events
    is_institution_wide BOOLEAN DEFAULT TRUE,
    department_id UUID REFERENCES departments(id),
    program_id UUID REFERENCES programs(id),
    course_id UUID REFERENCES courses(id),
    priority_level INTEGER DEFAULT 1, -- 1=High, 2=Medium, 3=Low
    color_code VARCHAR(7) DEFAULT '#EF4444',
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_event_dates CHECK (end_date IS NULL OR end_date >= event_date),
    CONSTRAINT valid_priority CHECK (priority_level BETWEEN 1 AND 3)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX idx_academic_years_current ON academic_years(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_academic_years_active ON academic_years(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_academic_semesters_current ON academic_semesters(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_academic_semesters_year ON academic_semesters(academic_year_id);
CREATE INDEX idx_academic_weeks_semester ON academic_weeks(semester_id);
CREATE INDEX idx_academic_weeks_dates ON academic_weeks(start_date, end_date);
CREATE INDEX idx_academic_sessions_semester ON academic_sessions(semester_id);
CREATE INDEX idx_academic_sessions_dates ON academic_sessions(start_date, end_date);
CREATE INDEX idx_academic_events_date ON academic_events(event_date);
CREATE INDEX idx_academic_events_semester ON academic_events(semester_id);

-- =============================================================================
-- FUNCTIONS FOR AUTOMATIC WEEK GENERATION
-- =============================================================================
CREATE OR REPLACE FUNCTION generate_academic_weeks(p_semester_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_semester RECORD;
    v_week_start DATE;
    v_week_end DATE;
    v_week_number INTEGER;
    v_weeks_created INTEGER := 0;
BEGIN
    -- Get semester details
    SELECT * INTO v_semester FROM academic_semesters WHERE id = p_semester_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Semester not found: %', p_semester_id;
    END IF;

    -- Clear existing weeks for this semester
    DELETE FROM academic_weeks WHERE semester_id = p_semester_id;

    -- Generate weeks
    v_week_start := v_semester.start_date;
    v_week_number := 1;

    WHILE v_week_start <= v_semester.end_date AND v_week_number <= v_semester.total_weeks LOOP
        -- Calculate week end (Sunday to Saturday)
        v_week_end := v_week_start + INTERVAL '6 days';

        -- Don't exceed semester end date
        IF v_week_end > v_semester.end_date THEN
            v_week_end := v_semester.end_date;
        END IF;

        -- Insert week
        INSERT INTO academic_weeks (
            semester_id,
            week_number,
            week_name,
            start_date,
            end_date,
            week_type
        ) VALUES (
            p_semester_id,
            v_week_number,
            'Week ' || v_week_number,
            v_week_start,
            v_week_end,
            'teaching'
        );

        v_weeks_created := v_weeks_created + 1;
        v_week_number := v_week_number + 1;
        v_week_start := v_week_end + INTERVAL '1 day';
    END LOOP;

    RETURN v_weeks_created;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNCTION TO SET CURRENT ACADEMIC YEAR/SEMESTER
-- =============================================================================
CREATE OR REPLACE FUNCTION set_current_academic_year(p_year_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Clear all current year flags
    UPDATE academic_years SET is_current = FALSE;

    -- Set the specified year as current
    UPDATE academic_years SET is_current = TRUE WHERE id = p_year_id;

    -- Clear all current semester flags
    UPDATE academic_semesters SET is_current = FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_current_semester(p_semester_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Clear all current semester flags
    UPDATE academic_semesters SET is_current = FALSE;

    -- Set the specified semester as current
    UPDATE academic_semesters SET is_current = TRUE WHERE id = p_semester_id;

    -- Also set the academic year as current
    UPDATE academic_years SET is_current = TRUE
    WHERE id = (SELECT academic_year_id FROM academic_semesters WHERE id = p_semester_id);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SAMPLE DATA INSERTION
-- =============================================================================

-- Insert Academic Years
INSERT INTO academic_years (year_code, year_name, start_date, end_date, is_current, description) VALUES
('2024', 'Academic Year 2024', '2024-01-15', '2024-12-15', FALSE, 'Academic year 2024 for all programs'),
('2025', 'Academic Year 2025', '2025-01-20', '2025-12-20', TRUE, 'Current academic year 2025'),
('2026', 'Academic Year 2026', '2026-01-19', '2026-12-19', FALSE, 'Academic year 2026 planning');

-- Insert Semesters for 2025
INSERT INTO academic_semesters (academic_year_id, semester_code, semester_name, semester_number, start_date, end_date, is_current, total_weeks, description)
SELECT
    ay.id,
    'SEM1',
    'Semester 1',
    1,
    '2025-02-03',
    '2025-06-27',
    TRUE,
    18,
    'First semester of academic year 2025'
FROM academic_years ay WHERE ay.year_code = '2025';

INSERT INTO academic_semesters (academic_year_id, semester_code, semester_name, semester_number, start_date, end_date, is_current, total_weeks, description)
SELECT
    ay.id,
    'SEM2',
    'Semester 2',
    2,
    '2025-07-28',
    '2025-12-19',
    FALSE,
    18,
    'Second semester of academic year 2025'
FROM academic_years ay WHERE ay.year_code = '2025';

-- Insert Academic Sessions for Semester 1, 2025
INSERT INTO academic_sessions (semester_id, session_name, session_type, start_date, end_date, start_week, end_week, description, color_code)
SELECT
    s.id,
    'Orientation Week',
    'orientation',
    '2025-02-03',
    '2025-02-07',
    1,
    1,
    'New student orientation and registration',
    '#10B981'
FROM academic_semesters s
JOIN academic_years ay ON s.academic_year_id = ay.id
WHERE ay.year_code = '2025' AND s.semester_number = 1;

INSERT INTO academic_sessions (semester_id, session_name, session_type, start_date, end_date, start_week, end_week, description, color_code)
SELECT
    s.id,
    'Teaching Period',
    'teaching',
    '2025-02-10',
    '2025-04-11',
    2,
    9,
    'Regular teaching weeks',
    '#3B82F6'
FROM academic_semesters s
JOIN academic_years ay ON s.academic_year_id = ay.id
WHERE ay.year_code = '2025' AND s.semester_number = 1;

INSERT INTO academic_sessions (semester_id, session_name, session_type, start_date, end_date, start_week, end_week, description, color_code)
SELECT
    s.id,
    'Mid-Semester Break',
    'break',
    '2025-04-14',
    '2025-04-25',
    10,
    11,
    'Two-week mid-semester break',
    '#F59E0B'
FROM academic_semesters s
JOIN academic_years ay ON s.academic_year_id = ay.id
WHERE ay.year_code = '2025' AND s.semester_number = 1;

INSERT INTO academic_sessions (semester_id, session_name, session_type, start_date, end_date, start_week, end_week, description, color_code)
SELECT
    s.id,
    'Teaching Period 2',
    'teaching',
    '2025-04-28',
    '2025-06-06',
    12,
    17,
    'Second teaching period',
    '#3B82F6'
FROM academic_semesters s
JOIN academic_years ay ON s.academic_year_id = ay.id
WHERE ay.year_code = '2025' AND s.semester_number = 1;

INSERT INTO academic_sessions (semester_id, session_name, session_type, start_date, end_date, start_week, end_week, description, color_code)
SELECT
    s.id,
    'Final Examinations',
    'exam',
    '2025-06-09',
    '2025-06-27',
    18,
    18,
    'Final examination period',
    '#EF4444'
FROM academic_semesters s
JOIN academic_years ay ON s.academic_year_id = ay.id
WHERE ay.year_code = '2025' AND s.semester_number = 1;

-- Generate weeks for Semester 1, 2025
SELECT generate_academic_weeks(s.id)
FROM academic_semesters s
JOIN academic_years ay ON s.academic_year_id = ay.id
WHERE ay.year_code = '2025' AND s.semester_number = 1;

-- =============================================================================
-- VIEWS FOR EASY DATA ACCESS
-- =============================================================================

-- Current Academic Context View
CREATE VIEW current_academic_context AS
SELECT
    ay.id as academic_year_id,
    ay.year_code,
    ay.year_name,
    s.id as semester_id,
    s.semester_code,
    s.semester_name,
    s.semester_number,
    s.start_date as semester_start,
    s.end_date as semester_end,
    s.total_weeks
FROM academic_years ay
JOIN academic_semesters s ON ay.id = s.academic_year_id
WHERE ay.is_current = TRUE AND s.is_current = TRUE;

-- Academic Calendar Overview
CREATE VIEW academic_calendar_overview AS
SELECT
    ay.year_code,
    ay.year_name,
    s.semester_name,
    s.start_date,
    s.end_date,
    s.total_weeks,
    COUNT(w.id) as weeks_configured,
    COUNT(sess.id) as sessions_configured
FROM academic_years ay
JOIN academic_semesters s ON ay.id = s.academic_year_id
LEFT JOIN academic_weeks w ON s.id = w.semester_id
LEFT JOIN academic_sessions sess ON s.id = sess.semester_id
WHERE ay.is_active = TRUE
GROUP BY ay.year_code, ay.year_name, s.semester_name, s.start_date, s.end_date, s.total_weeks
ORDER BY ay.year_code, s.semester_number;
