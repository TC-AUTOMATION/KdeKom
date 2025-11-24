-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Persons Table (Consultants, Managers, Apporteurs)
CREATE TABLE IF NOT EXISTS persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'consultant', 'manager', 'apporteur'
    email VARCHAR(255),
    parrain_id UUID REFERENCES persons(id), -- For apporteurs who have a parrain
    default_percentage DECIMAL(5, 4) DEFAULT 0, -- e.g., 0.0300 for 3%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Missions Table
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL, -- Mission (H)
    month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    client_id UUID REFERENCES clients(id),
    apporteur_id UUID REFERENCES persons(id),
    
    -- Financial Inputs
    amount_billed DECIMAL(10, 2) NOT NULL DEFAULT 0, -- L
    initial_fees DECIMAL(10, 2) DEFAULT 0, -- N
    agency_fees DECIMAL(10, 2) DEFAULT 0, -- P
    fixed_fees DECIMAL(10, 2) DEFAULT 0, -- Q
    management_fees DECIMAL(10, 2) DEFAULT 0, -- R
    
    -- Specific Manager Fixed Amounts
    ml_amount DECIMAL(10, 2) DEFAULT 0, -- S
    lt_amount DECIMAL(10, 2) DEFAULT 0, -- T
    
    -- Commissions (Calculated or Overridden)
    apporteur_commission DECIMAL(10, 2) DEFAULT 0, -- B
    parrain_commission DECIMAL(10, 2) DEFAULT 0, -- D
    
    -- Calculated Results (Stored for history/integrity)
    remainder_after_initial DECIMAL(10, 2) DEFAULT 0, -- O
    remainder_before_commissions DECIMAL(10, 2) DEFAULT 0, -- U
    base_for_distribution DECIMAL(10, 2) DEFAULT 0, -- V
    reliquat DECIMAL(10, 2) DEFAULT 0, -- AU (Final remainder for company)
    
    is_paid BOOLEAN DEFAULT FALSE,
    payment_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mission Distributions (Variable % based distributions)
CREATE TABLE IF NOT EXISTS mission_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    person_id UUID REFERENCES persons(id),
    percentage DECIMAL(5, 4) NOT NULL, -- The % applied (e.g. 0.03)
    amount DECIMAL(10, 2) NOT NULL, -- The calculated amount
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_month ON missions(month);
CREATE INDEX IF NOT EXISTS idx_missions_client ON missions(client_id);
CREATE INDEX IF NOT EXISTS idx_missions_apporteur ON missions(apporteur_id);