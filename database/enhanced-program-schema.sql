-- Enhanced Program Management Schema for TVET Academic Management System
-- This schema provides dynamic program configurations, certification pathways, and TVET-specific features

-- =============================================
-- PROGRAM TYPE DEFINITIONS
-- =============================================

-- Program Type Categories
CREATE TABLE IF NOT EXISTS program_type_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) UNIQUE NOT NULL,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program Types
CREATE TABLE IF NOT EXISTS program_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(100) UNIQUE NOT NULL,
    type_code VARCHAR(30) UNIQUE NOT NULL,
    category_id UUID REFERENCES program_type_categories(id),
    description TEXT,
    default_duration_months INTEGER,
    min_duration_months INTEGER,
    max_duration_months INTEGER,
    default_credit_hours INTEGER,
    min_credit_hours INTEGER,
    max_credit_hours INTEGER,
    qualification_level VARCHAR(50), -- Certificate, Diploma, Advanced Diploma, etc.
    accreditation_body VARCHAR(100),
    industry_classification TEXT[],
    is_system_type BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ENHANCED PROGRAMS TABLE
-- =============================================

-- Extended Programs with Enhanced Configuration
CREATE TABLE IF NOT EXISTS enhanced_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE UNIQUE,
    program_type_id UUID REFERENCES program_types(id),
    qualification_framework VARCHAR(100), -- PNG National Qualifications Framework level
    nqf_level INTEGER, -- 1-10 for PNG NQF
    industry_sector VARCHAR(100),
    occupation_codes TEXT[], -- PNG Standard Classification of Occupations

    -- Duration Configuration
    duration_type VARCHAR(20) DEFAULT 'months', -- months, weeks, years
    duration_value INTEGER NOT NULL,
    full_time_duration INTEGER,
    part_time_duration INTEGER,
    flexible_duration BOOLEAN DEFAULT false,

    -- Credit and Assessment Configuration
    total_credit_hours INTEGER NOT NULL,
    theory_credit_hours INTEGER DEFAULT 0,
    practical_credit_hours INTEGER DEFAULT 0,
    work_placement_hours INTEGER DEFAULT 0,
    assessment_methods TEXT[],
    grading_scale_id UUID, -- Reference to grading scale configuration

    -- Entry Requirements
    entry_requirements JSONB,
    minimum_age INTEGER,
    maximum_age INTEGER,
    prerequisite_qualifications TEXT[],
    english_proficiency_requirements TEXT,

    -- Delivery Configuration
    delivery_modes TEXT[], -- face-to-face, online, blended, workplace
    campus_locations TEXT[],
    intake_periods TEXT[], -- quarterly, semester, annual
    class_size_min INTEGER DEFAULT 1,
    class_size_max INTEGER DEFAULT 30,

    -- Accreditation and Recognition
    accrediting_body VARCHAR(100),
    accreditation_number VARCHAR(50),
    accreditation_expiry DATE,
    recognition_status VARCHAR(50), -- nationally recognized, internationally recognized

    -- Pathways and Articulation
    articulation_agreements JSONB,
    career_pathways TEXT[],
    further_study_options TEXT[],

    -- Financial Configuration
    tuition_fee_domestic DECIMAL(10,2),
    tuition_fee_international DECIMAL(10,2),
    materials_fee DECIMAL(10,2),
    laboratory_fee DECIMAL(10,2),
    other_fees JSONB,
    scholarship_available BOOLEAN DEFAULT false,

    -- TVET Specific Fields
    trade_classification VARCHAR(50),
    apprenticeship_available BOOLEAN DEFAULT false,
    work_integrated_learning BOOLEAN DEFAULT false,
    industry_partnerships TEXT[],
    equipment_requirements JSONB,

    -- Custom Configuration
    custom_fields JSONB,
    configuration_rules JSONB,
    validation_rules JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CERTIFICATION PATHWAYS
-- =============================================

-- Certification Types
CREATE TABLE IF NOT EXISTS certification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_name VARCHAR(100) UNIQUE NOT NULL,
    certification_code VARCHAR(30) UNIQUE NOT NULL,
    issuing_authority VARCHAR(100),
    description TEXT,
    validity_period_months INTEGER,
    renewal_required BOOLEAN DEFAULT false,
    industry_recognition TEXT[],
    international_recognition BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program Certifications (Many-to-Many)
CREATE TABLE IF NOT EXISTS program_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    certification_type_id UUID REFERENCES certification_types(id),
    is_primary_certification BOOLEAN DEFAULT false,
    requirements JSONB,
    assessment_criteria JSONB,
    competency_standards TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, certification_type_id)
);

-- Certification Pathways (Program Progressions)
CREATE TABLE IF NOT EXISTS certification_pathways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pathway_name VARCHAR(100) NOT NULL,
    pathway_code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    from_program_id UUID REFERENCES programs(id),
    to_program_id UUID REFERENCES programs(id),
    credit_transfer_hours INTEGER DEFAULT 0,
    exemption_subjects TEXT[],
    additional_requirements JSONB,
    processing_time_weeks INTEGER,
    pathway_type VARCHAR(30), -- vertical, horizontal, lateral
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (from_program_id != to_program_id)
);

-- =============================================
-- PROGRAM STRUCTURE AND CURRICULUM
-- =============================================

-- Learning Outcomes Framework
CREATE TABLE IF NOT EXISTS learning_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    outcome_code VARCHAR(30) NOT NULL,
    outcome_description TEXT NOT NULL,
    outcome_type VARCHAR(30), -- knowledge, skills, application
    bloom_taxonomy_level VARCHAR(30),
    assessment_methods TEXT[],
    industry_relevance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, outcome_code)
);

-- Program Modules/Units
CREATE TABLE IF NOT EXISTS program_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    module_code VARCHAR(30) NOT NULL,
    module_name VARCHAR(200) NOT NULL,
    module_description TEXT,
    credit_hours INTEGER NOT NULL,
    theory_hours INTEGER DEFAULT 0,
    practical_hours INTEGER DEFAULT 0,
    self_study_hours INTEGER DEFAULT 0,
    prerequisite_modules TEXT[],
    delivery_mode VARCHAR(50),
    assessment_weighting DECIMAL(5,2), -- percentage
    competency_elements TEXT[],
    resources_required TEXT[],
    industry_exposure_hours INTEGER DEFAULT 0,
    module_order INTEGER DEFAULT 0,
    is_core BOOLEAN DEFAULT true,
    is_elective BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, module_code)
);

-- =============================================
-- INDUSTRY INTEGRATION
-- =============================================

-- Industry Partners
CREATE TABLE IF NOT EXISTS industry_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name VARCHAR(200) NOT NULL,
    partner_type VARCHAR(50), -- employer, training provider, professional body
    industry_sector VARCHAR(100),
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    partnership_type VARCHAR(50), -- internship, apprenticeship, advisory, equipment
    mou_signed BOOLEAN DEFAULT false,
    mou_expiry_date DATE,
    active_programs TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program Industry Partnerships
CREATE TABLE IF NOT EXISTS program_industry_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    industry_partner_id UUID REFERENCES industry_partners(id),
    partnership_details JSONB,
    placement_capacity INTEGER,
    equipment_support BOOLEAN DEFAULT false,
    guest_lecturers BOOLEAN DEFAULT false,
    curriculum_advisory BOOLEAN DEFAULT false,
    employment_opportunities BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, industry_partner_id)
);

-- =============================================
-- PROGRAM VALIDATION AND RULES
-- =============================================

-- Program Validation Rules
CREATE TABLE IF NOT EXISTS program_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) UNIQUE NOT NULL,
    rule_code VARCHAR(30) UNIQUE NOT NULL,
    rule_type VARCHAR(30), -- credit_hours, duration, prerequisites, modules
    rule_category VARCHAR(50), -- institutional, regulatory, accreditation
    validation_logic JSONB NOT NULL,
    error_message TEXT,
    warning_message TEXT,
    applies_to_program_types TEXT[],
    is_mandatory BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Program Rule Assignments
CREATE TABLE IF NOT EXISTS program_rule_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    validation_rule_id UUID REFERENCES program_validation_rules(id),
    is_active BOOLEAN DEFAULT true,
    custom_parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, validation_rule_id)
);

-- =============================================
-- SEED DATA FOR TVET PROGRAM TYPES
-- =============================================

-- Insert Program Type Categories
INSERT INTO program_type_categories (category_name, category_code, description, display_order) VALUES
('Technical Education', 'TECH_ED', 'Technical and vocational education programs', 1),
('Trade Training', 'TRADE', 'Traditional trade and craft programs', 2),
('Business Studies', 'BUSINESS', 'Commercial and business-related programs', 3),
('Agricultural Training', 'AGRI', 'Agriculture and primary industry programs', 4),
('Health Services', 'HEALTH', 'Health and community services training', 5),
('Information Technology', 'IT', 'Computing and information technology programs', 6),
('Creative Arts', 'ARTS', 'Creative arts and media programs', 7),
('Hospitality Tourism', 'HOSP_TOUR', 'Hospitality and tourism industry programs', 8)
ON CONFLICT (category_code) DO NOTHING;

-- Insert Program Types
INSERT INTO program_types (
    type_name, type_code, category_id, description,
    default_duration_months, min_duration_months, max_duration_months,
    default_credit_hours, min_credit_hours, max_credit_hours,
    qualification_level, accreditation_body, is_system_type
) VALUES
-- Technical Education
('Certificate IV in Engineering', 'CERT4_ENG',
    (SELECT id FROM program_type_categories WHERE category_code = 'TECH_ED'),
    'Advanced technical certificate in engineering disciplines',
    12, 6, 24, 480, 360, 600, 'Certificate IV', 'PNG Technical Education Board', true),

('Diploma of Engineering Technology', 'DIP_ENG_TECH',
    (SELECT id FROM program_type_categories WHERE category_code = 'TECH_ED'),
    'Advanced diploma in engineering technology',
    24, 18, 36, 960, 720, 1200, 'Diploma', 'PNG Technical Education Board', true),

-- Trade Training
('Certificate III in Electrical Trades', 'CERT3_ELEC',
    (SELECT id FROM program_type_categories WHERE category_code = 'TRADE'),
    'Trade certificate for electrical work',
    18, 12, 24, 720, 540, 900, 'Certificate III', 'PNG Skills Authority', true),

('Certificate III in Carpentry', 'CERT3_CARP',
    (SELECT id FROM program_type_categories WHERE category_code = 'TRADE'),
    'Trade certificate in carpentry and joinery',
    18, 12, 24, 720, 540, 900, 'Certificate III', 'PNG Skills Authority', true),

-- Business Studies
('Diploma of Business Administration', 'DIP_BUS_ADMIN',
    (SELECT id FROM program_type_categories WHERE category_code = 'BUSINESS'),
    'Comprehensive business administration training',
    18, 12, 24, 720, 540, 900, 'Diploma', 'PNG Institute of Banking and Business Management', true),

-- Information Technology
('Certificate IV in Information Technology', 'CERT4_IT',
    (SELECT id FROM program_type_categories WHERE category_code = 'IT'),
    'Advanced IT certification program',
    12, 6, 18, 480, 360, 600, 'Certificate IV', 'PNG University of Technology', true),

-- Agriculture
('Certificate III in Agriculture', 'CERT3_AGRI',
    (SELECT id FROM program_type_categories WHERE category_code = 'AGRI'),
    'Practical agriculture and farming techniques',
    12, 6, 18, 480, 360, 600, 'Certificate III', 'PNG Department of Agriculture', true)
ON CONFLICT (type_code) DO NOTHING;

-- Insert Certification Types
INSERT INTO certification_types (
    certification_name, certification_code, issuing_authority,
    description, validity_period_months, renewal_required
) VALUES
('Trade Certificate', 'TRADE_CERT', 'PNG Skills Authority',
    'Official trade qualification certificate', NULL, false),
('Professional Competency Certificate', 'PROF_COMP', 'PNG Technical Education Board',
    'Professional competency in technical fields', 60, true),
('Industry Safety Certificate', 'SAFETY_CERT', 'PNG Department of Labour',
    'Workplace safety and health certification', 36, true),
('Apprenticeship Completion Certificate', 'APPRENTICE_CERT', 'PNG Skills Authority',
    'Completion of formal apprenticeship program', NULL, false)
ON CONFLICT (certification_code) DO NOTHING;

-- Insert Sample Validation Rules
INSERT INTO program_validation_rules (
    rule_name, rule_code, rule_type, rule_category,
    validation_logic, error_message, is_mandatory
) VALUES
('Minimum Credit Hours', 'MIN_CREDIT_HOURS', 'credit_hours', 'institutional',
    '{"operator": ">=", "field": "total_credit_hours", "value": 360}',
    'Program must have at least 360 credit hours', true),

('Maximum Duration Check', 'MAX_DURATION', 'duration', 'institutional',
    '{"operator": "<=", "field": "duration_value", "value": 48}',
    'Program duration cannot exceed 48 months', true),

('Work Placement Requirement', 'WORK_PLACEMENT', 'modules', 'regulatory',
    '{"operator": ">=", "field": "work_placement_hours", "value": 120}',
    'TVET programs must include minimum 120 hours work placement', true),

('Core Module Minimum', 'CORE_MODULES', 'modules', 'accreditation',
    '{"operator": ">=", "field": "core_modules_count", "value": 4}',
    'Program must have at least 4 core modules', true)
ON CONFLICT (rule_code) DO NOTHING;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_enhanced_programs_program_id ON enhanced_programs(program_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_programs_program_type ON enhanced_programs(program_type_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_programs_nqf_level ON enhanced_programs(nqf_level);
CREATE INDEX IF NOT EXISTS idx_program_certifications_program_id ON program_certifications(program_id);
CREATE INDEX IF NOT EXISTS idx_certification_pathways_from_program ON certification_pathways(from_program_id);
CREATE INDEX IF NOT EXISTS idx_certification_pathways_to_program ON certification_pathways(to_program_id);
CREATE INDEX IF NOT EXISTS idx_program_modules_program_id ON program_modules(program_id);
CREATE INDEX IF NOT EXISTS idx_program_modules_order ON program_modules(program_id, module_order);
CREATE INDEX IF NOT EXISTS idx_learning_outcomes_program_id ON learning_outcomes(program_id);
CREATE INDEX IF NOT EXISTS idx_program_industry_partnerships_program ON program_industry_partnerships(program_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_enhanced_program_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_program_types_updated_at
    BEFORE UPDATE ON program_types
    FOR EACH ROW EXECUTE FUNCTION update_enhanced_program_timestamp();

CREATE TRIGGER update_enhanced_programs_updated_at
    BEFORE UPDATE ON enhanced_programs
    FOR EACH ROW EXECUTE FUNCTION update_enhanced_program_timestamp();

-- Auto-create enhanced program record when program is created
CREATE OR REPLACE FUNCTION create_enhanced_program()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO enhanced_programs (
        program_id,
        duration_value,
        total_credit_hours,
        entry_requirements,
        delivery_modes,
        created_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.duration_months, 12),
        COALESCE(NEW.total_credits, 360),
        '{"general": "High School Certificate or equivalent"}',
        ARRAY['face-to-face'],
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_create_enhanced_program
    AFTER INSERT ON programs
    FOR EACH ROW
    EXECUTE FUNCTION create_enhanced_program();

COMMENT ON SCHEMA public IS 'Enhanced Program Management Schema for TVET Academic Management System';
