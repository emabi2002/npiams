-- Hostel Management Schema for TVET Academic Management System
-- Comprehensive hostel operations including room allocation, meal cards, and analytics

-- =============================================
-- HOSTEL INFRASTRUCTURE
-- =============================================

-- Hostel Buildings
CREATE TABLE IF NOT EXISTS hostel_buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_name VARCHAR(100) UNIQUE NOT NULL,
    building_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    total_floors INTEGER NOT NULL DEFAULT 1,
    total_rooms INTEGER NOT NULL DEFAULT 0,
    capacity INTEGER NOT NULL DEFAULT 0,
    gender_restriction VARCHAR(20) CHECK (gender_restriction IN ('male', 'female', 'mixed', 'none')),
    warden_id UUID REFERENCES users(id),
    maintenance_contact VARCHAR(100),
    emergency_contact VARCHAR(100),
    facilities JSONB, -- WiFi, laundry, study rooms, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Room Types
CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(50) UNIQUE NOT NULL,
    type_code VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    security_deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
    amenities JSONB, -- AC, attached bathroom, furniture, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hostel Rooms
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES hostel_buildings(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(id),
    room_number VARCHAR(20) NOT NULL,
    floor_number INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    security_deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
    room_status VARCHAR(20) DEFAULT 'available' CHECK (room_status IN ('available', 'occupied', 'maintenance', 'reserved')),
    facilities JSONB, -- room-specific facilities
    last_maintenance DATE,
    next_maintenance DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(building_id, room_number)
);

-- =============================================
-- ROOM ALLOCATION SYSTEM
-- =============================================

-- Room Allocations
CREATE TABLE IF NOT EXISTS room_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    room_id UUID REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_date DATE,
    check_out_date DATE,
    expected_checkout_date DATE,
    allocation_status VARCHAR(20) DEFAULT 'allocated' CHECK (allocation_status IN ('allocated', 'checked_in', 'checked_out', 'cancelled', 'transferred')),
    monthly_fee DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL,
    deposit_paid BOOLEAN DEFAULT false,
    deposit_paid_date DATE,
    special_requirements TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(50),
    allocated_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Room Transfers/Changes
CREATE TABLE IF NOT EXISTS room_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    from_room_id UUID REFERENCES hostel_rooms(id),
    to_room_id UUID REFERENCES hostel_rooms(id),
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason VARCHAR(200) NOT NULL,
    transfer_type VARCHAR(30) CHECK (transfer_type IN ('voluntary', 'disciplinary', 'maintenance', 'upgrade', 'medical')),
    requested_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approval_date DATE,
    transfer_status VARCHAR(20) DEFAULT 'pending' CHECK (transfer_status IN ('pending', 'approved', 'rejected', 'completed')),
    additional_fees DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- MEAL CARD SYSTEM
-- =============================================

-- Meal Plan Types
CREATE TABLE IF NOT EXISTS meal_plan_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(100) UNIQUE NOT NULL,
    plan_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    meals_per_day INTEGER NOT NULL DEFAULT 3,
    meals_per_week INTEGER NOT NULL DEFAULT 21,
    monthly_cost DECIMAL(10,2) NOT NULL,
    breakfast_included BOOLEAN DEFAULT true,
    lunch_included BOOLEAN DEFAULT true,
    dinner_included BOOLEAN DEFAULT true,
    weekend_meals BOOLEAN DEFAULT true,
    validity_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meal Cards
CREATE TABLE IF NOT EXISTS meal_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    card_number VARCHAR(20) UNIQUE NOT NULL,
    card_type VARCHAR(20) DEFAULT 'physical' CHECK (card_type IN ('physical', 'digital', 'hybrid')),
    meal_plan_id UUID REFERENCES meal_plan_types(id),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    card_status VARCHAR(20) DEFAULT 'active' CHECK (card_status IN ('active', 'inactive', 'lost', 'damaged', 'expired', 'blocked')),
    balance_meals INTEGER DEFAULT 0,
    total_meals_purchased INTEGER DEFAULT 0,
    total_meals_consumed INTEGER DEFAULT 0,
    last_recharge_date DATE,
    last_used_date DATE,
    card_fee DECIMAL(10,2) DEFAULT 0,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    issued_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meal Card Transactions
CREATE TABLE IF NOT EXISTS meal_card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_card_id UUID REFERENCES meal_cards(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('recharge', 'consumption', 'refund', 'adjustment')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    meals_count INTEGER DEFAULT 1,
    amount DECIMAL(10,2) DEFAULT 0,
    balance_after INTEGER,
    location VARCHAR(100), -- dining hall, cafeteria, etc.
    terminal_id VARCHAR(50),
    processed_by UUID REFERENCES users(id),
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'mobile_money')),
    reference_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- MAINTENANCE SYSTEM
-- =============================================

-- Maintenance Categories
CREATE TABLE IF NOT EXISTS maintenance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) UNIQUE NOT NULL,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5), -- 1=critical, 5=low
    estimated_resolution_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(20) UNIQUE NOT NULL,
    room_id UUID REFERENCES hostel_rooms(id),
    building_id UUID REFERENCES hostel_buildings(id),
    category_id UUID REFERENCES maintenance_categories(id),
    reported_by UUID REFERENCES users(id), -- student or staff
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    request_status VARCHAR(20) DEFAULT 'open' CHECK (request_status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    reported_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_date TIMESTAMP WITH TIME ZONE,
    started_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id), -- maintenance staff
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    satisfaction_feedback TEXT,
    attachments JSONB, -- photos, documents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- VISITOR MANAGEMENT
-- =============================================

-- Visitor Registrations
CREATE TABLE IF NOT EXISTS visitor_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    visitor_name VARCHAR(200) NOT NULL,
    visitor_phone VARCHAR(50),
    visitor_id_type VARCHAR(30),
    visitor_id_number VARCHAR(50),
    relationship VARCHAR(50),
    visit_purpose TEXT,
    visit_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    expected_duration_hours INTEGER,
    visitor_status VARCHAR(20) DEFAULT 'registered' CHECK (visitor_status IN ('registered', 'checked_in', 'checked_out', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    security_notes TEXT,
    items_brought TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default room types
INSERT INTO room_types (type_name, type_code, capacity, monthly_fee, security_deposit, amenities, description) VALUES
('Single Room', 'SINGLE', 1, 150.00, 100.00, '{"ac": false, "attached_bathroom": true, "furniture": "basic", "wifi": true}', 'Private single occupancy room'),
('Twin Sharing', 'TWIN', 2, 100.00, 75.00, '{"ac": false, "attached_bathroom": true, "furniture": "basic", "wifi": true}', 'Twin sharing room for two students'),
('Triple Sharing', 'TRIPLE', 3, 75.00, 50.00, '{"ac": false, "shared_bathroom": true, "furniture": "basic", "wifi": true}', 'Triple sharing room for three students'),
('Quad Sharing', 'QUAD', 4, 60.00, 40.00, '{"ac": false, "shared_bathroom": true, "furniture": "basic", "wifi": true}', 'Quad sharing room for four students'),
('Deluxe Single', 'DELUXE_SINGLE', 1, 250.00, 150.00, '{"ac": true, "attached_bathroom": true, "furniture": "premium", "wifi": true, "study_table": true}', 'Premium single room with AC')
ON CONFLICT (type_code) DO NOTHING;

-- Insert meal plan types
INSERT INTO meal_plan_types (plan_name, plan_code, description, meals_per_day, meals_per_week, monthly_cost, breakfast_included, lunch_included, dinner_included, weekend_meals) VALUES
('Basic Plan', 'BASIC', 'Three meals per day including weekends', 3, 21, 120.00, true, true, true, true),
('Lunch Only', 'LUNCH_ONLY', 'Lunch only on weekdays', 1, 5, 50.00, false, true, false, false),
('No Breakfast', 'NO_BREAKFAST', 'Lunch and dinner only', 2, 14, 90.00, false, true, true, true),
('Weekend Plus', 'WEEKEND_PLUS', 'All meals including special weekend menu', 3, 21, 150.00, true, true, true, true),
('Executive Plan', 'EXECUTIVE', 'Premium meal plan with extended options', 3, 21, 200.00, true, true, true, true)
ON CONFLICT (plan_code) DO NOTHING;

-- Insert maintenance categories
INSERT INTO maintenance_categories (category_name, category_code, description, priority_level, estimated_resolution_hours) VALUES
('Electrical', 'ELECTRICAL', 'Electrical issues including wiring, outlets, lighting', 2, 4),
('Plumbing', 'PLUMBING', 'Water supply, drainage, bathroom fixtures', 2, 6),
('Furniture', 'FURNITURE', 'Bed, desk, chair, wardrobe repairs', 4, 24),
('Cleaning', 'CLEANING', 'Room cleaning, garbage disposal', 3, 2),
('Security', 'SECURITY', 'Lock repairs, key issues, safety concerns', 1, 2),
('Air Conditioning', 'AC', 'AC installation, repair, maintenance', 3, 8),
('Network/IT', 'NETWORK', 'Internet connectivity, WiFi issues', 3, 4),
('General Repairs', 'GENERAL', 'Wall repairs, painting, general maintenance', 4, 48)
ON CONFLICT (category_code) DO NOTHING;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_hostel_rooms_building_id ON hostel_rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_hostel_rooms_status ON hostel_rooms(room_status);
CREATE INDEX IF NOT EXISTS idx_room_allocations_student_id ON room_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_room_id ON room_allocations(room_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_status ON room_allocations(allocation_status);
CREATE INDEX IF NOT EXISTS idx_room_allocations_dates ON room_allocations(allocation_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_meal_cards_student_id ON meal_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_meal_cards_card_number ON meal_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_meal_cards_status ON meal_cards(card_status);
CREATE INDEX IF NOT EXISTS idx_meal_card_transactions_card_id ON meal_card_transactions(meal_card_id);
CREATE INDEX IF NOT EXISTS idx_meal_card_transactions_date ON meal_card_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_room_id ON maintenance_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_visitor_registrations_student_id ON visitor_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_visitor_registrations_date ON visitor_registrations(visit_date);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Auto-update room occupancy when allocations change
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current occupancy for the affected room(s)
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE hostel_rooms
        SET current_occupancy = (
            SELECT COUNT(*)
            FROM room_allocations
            WHERE room_id = NEW.room_id
            AND allocation_status IN ('allocated', 'checked_in')
        ),
        room_status = CASE
            WHEN (
                SELECT COUNT(*)
                FROM room_allocations
                WHERE room_id = NEW.room_id
                AND allocation_status IN ('allocated', 'checked_in')
            ) >= capacity THEN 'occupied'
            WHEN (
                SELECT COUNT(*)
                FROM room_allocations
                WHERE room_id = NEW.room_id
                AND allocation_status IN ('allocated', 'checked_in')
            ) = 0 THEN 'available'
            ELSE room_status
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.room_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE hostel_rooms
        SET current_occupancy = (
            SELECT COUNT(*)
            FROM room_allocations
            WHERE room_id = OLD.room_id
            AND allocation_status IN ('allocated', 'checked_in')
        ),
        room_status = CASE
            WHEN (
                SELECT COUNT(*)
                FROM room_allocations
                WHERE room_id = OLD.room_id
                AND allocation_status IN ('allocated', 'checked_in')
            ) >= capacity THEN 'occupied'
            WHEN (
                SELECT COUNT(*)
                FROM room_allocations
                WHERE room_id = OLD.room_id
                AND allocation_status IN ('allocated', 'checked_in')
            ) = 0 THEN 'available'
            ELSE room_status
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.room_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_room_occupancy
    AFTER INSERT OR UPDATE OR DELETE ON room_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_room_occupancy();

-- Auto-update meal card balance after transactions
CREATE OR REPLACE FUNCTION update_meal_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE meal_cards
    SET balance_meals = CASE
        WHEN NEW.transaction_type = 'recharge' THEN balance_meals + NEW.meals_count
        WHEN NEW.transaction_type = 'consumption' THEN balance_meals - NEW.meals_count
        WHEN NEW.transaction_type = 'refund' THEN balance_meals + NEW.meals_count
        WHEN NEW.transaction_type = 'adjustment' THEN NEW.balance_after
        ELSE balance_meals
    END,
    total_meals_consumed = CASE
        WHEN NEW.transaction_type = 'consumption' THEN total_meals_consumed + NEW.meals_count
        ELSE total_meals_consumed
    END,
    total_meals_purchased = CASE
        WHEN NEW.transaction_type = 'recharge' THEN total_meals_purchased + NEW.meals_count
        ELSE total_meals_purchased
    END,
    last_used_date = CASE
        WHEN NEW.transaction_type = 'consumption' THEN CURRENT_DATE
        ELSE last_used_date
    END,
    last_recharge_date = CASE
        WHEN NEW.transaction_type = 'recharge' THEN CURRENT_DATE
        ELSE last_recharge_date
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.meal_card_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_meal_card_balance
    AFTER INSERT ON meal_card_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_meal_card_balance();

-- Auto-generate request numbers for maintenance requests
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.request_number = 'MR-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' ||
                        LPAD((
                            SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 12) AS INTEGER)), 0) + 1
                            FROM maintenance_requests
                            WHERE request_number LIKE 'MR-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-%'
                        )::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_request_number
    BEFORE INSERT ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION generate_request_number();

-- Auto-update timestamps
CREATE TRIGGER update_hostel_buildings_updated_at
    BEFORE UPDATE ON hostel_buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hostel_rooms_updated_at
    BEFORE UPDATE ON hostel_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_allocations_updated_at
    BEFORE UPDATE ON room_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_cards_updated_at
    BEFORE UPDATE ON meal_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitor_registrations_updated_at
    BEFORE UPDATE ON visitor_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON SCHEMA public IS 'Comprehensive Hostel Management Schema for TVET Academic Management System';
