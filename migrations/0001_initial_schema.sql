-- Migration 0001: Initial Schema
-- Users, KYC, Solutions, Orders, Whitelist, Solution Library

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  surname TEXT,
  id_number TEXT,
  passport_number TEXT,
  date_of_birth TEXT,
  role TEXT DEFAULT 'customer', -- customer, admin, account
  kyc_status TEXT DEFAULT 'pending', -- pending, identity, authorization, proof, documentation, completed
  preferences JSON, -- dark_mode, language, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  session_token TEXT,
  session_expires DATETIME
);

-- KYC Documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  institution_name TEXT,
  institution_role TEXT, -- student, teacher, staff, parent
  student_staff_id TEXT,
  selfie_url TEXT,
  id_document_url TEXT,
  proof_of_residence_url TEXT,
  verification_status TEXT DEFAULT 'pending',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Solutions table
CREATE TABLE IF NOT EXISTS solutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  solution_type TEXT NOT NULL, -- EduStudent, EduFlex, EduSchool, EduSafe
  name TEXT NOT NULL,
  address TEXT,
  customer_name TEXT,
  configuration JSON NOT NULL, -- Product selections, quantities, options
  price_once_off REAL DEFAULT 0,
  price_monthly REAL DEFAULT 0,
  term_months INTEGER DEFAULT 0, -- 0 (month-to-month), 6, 12, 24
  discount_code TEXT,
  total_discount_percent REAL DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, active, cancelled, pending
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solution_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  payment_method TEXT, -- mobile_money, credit_card, eft, airtime
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed, cancelled
  amount_once_off REAL DEFAULT 0,
  amount_monthly REAL DEFAULT 0,
  payment_date DATETIME,
  payment_reference TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Whitelist table
CREATE TABLE IF NOT EXISTS whitelist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL, -- Admin, Account
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  added_by INTEGER,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Solution Library table
CREATE TABLE IF NOT EXISTS solution_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solution TEXT NOT NULL, -- EduStudent, EduFlex, EduSchool, EduSafe
  product TEXT NOT NULL,
  option1 TEXT,
  option2 TEXT,
  option3 TEXT,
  option4 TEXT,
  option5 TEXT,
  price1 REAL,
  price2 REAL,
  price3 REAL,
  price4 REAL,
  price5 REAL,
  once_off REAL DEFAULT 0,
  month_on_month REAL DEFAULT 0,
  discount_6mth REAL DEFAULT 0,
  discount_12mth REAL DEFAULT 0,
  discount_24mth REAL DEFAULT 0,
  discount_code TEXT,
  discount_percent REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- OTP Codes table (for demo mode)
CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_or_email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_token);
CREATE INDEX IF NOT EXISTS idx_solutions_user ON solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_solutions_status ON solutions(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_solution ON orders(solution_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_phone ON whitelist(phone);
CREATE INDEX IF NOT EXISTS idx_whitelist_email ON whitelist(email);
CREATE INDEX IF NOT EXISTS idx_otp_phone_email ON otp_codes(phone_or_email);
CREATE INDEX IF NOT EXISTS idx_solution_library_solution ON solution_library(solution);
