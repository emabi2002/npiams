import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const createTablesSQL = `
-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    level VARCHAR(20) CHECK (level IN ('certificate', 'diploma')) NOT NULL,
    department VARCHAR(100) NOT NULL,
    duration_months INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create intake_periods table
CREATE TABLE IF NOT EXISTS intake_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    program_id UUID REFERENCES programs(id),
    intake_period VARCHAR(50),
    residency_status VARCHAR(20) CHECK (residency_status IN ('day', 'boarding', 'lodging')) DEFAULT 'day',
    biometric_data JSONB,
    photo_url TEXT,
    registration_status VARCHAR(20) CHECK (registration_status IN ('pending', 'paid', 'verified', 'rejected')) DEFAULT 'pending',
    academic_history JSONB,
    emergency_contact JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
    fee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    program_id UUID REFERENCES programs(id),
    mandatory BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('super_admin', 'admissions', 'finance', 'hostel', 'academic')) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export async function POST(request: NextRequest) {
  try {
    // Note: Supabase doesn't support direct SQL execution via the JavaScript client
    // The tables need to be created through the Supabase dashboard SQL editor
    // This endpoint will return instructions for manual table creation

    return NextResponse.json({
      success: false,
      message: 'Tables must be created manually in Supabase dashboard',
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Navigate to SQL Editor',
        '3. Create a new query',
        '4. Copy and paste the SQL schema from /database/schema.sql',
        '5. Run the query to create all tables',
        '6. Then call /api/init-database to populate sample data'
      ],
      sql: createTablesSQL
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return the SQL schema for manual execution
    return NextResponse.json({
      message: 'SQL Schema for manual execution in Supabase dashboard',
      sql: createTablesSQL,
      instructions: [
        '1. Copy the SQL from the "sql" field',
        '2. Go to your Supabase dashboard → SQL Editor',
        '3. Paste and run the SQL',
        '4. Call POST /api/init-database to add sample data'
      ]
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
