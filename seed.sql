-- Seed Data for EduConnect V2.0
-- Solution Library from solution_library.csv

INSERT OR IGNORE INTO solution_library (solution, product, option1, option2, option3, price1, price2, price3, once_off, month_on_month, discount_6mth, discount_12mth, discount_24mth, discount_code, discount_percent) VALUES
('EduStudent', 'Prepaid Bundle', '5GB + 50mins', '10GB + 100mins', '25GB + 200mins', 49.00, 99.00, 149.00, 0.00, NULL, -5, -10, -20, 'MTNSCHCNCT', -25),
('EduFlex', 'Uncapped Wireless', '10Mbps', '20Mbps', '100Mbps', 249.00, 299.00, 349.00, 499.00, NULL, -5, -10, -20, 'MTNSCHCNCT', -25),
('EduSchool', 'Uncapped Fibre', '50Mbps', '200Mbps', '500Mbps', 325.00, 425.00, 845.00, 999.00, NULL, -5, -10, -20, 'MTNSCHCNCT', -25),
('EduStudent', 'AI-Tutor & Market', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 29.00, -5, -10, -20, NULL, NULL),
('EduSchool', 'APN + Eagle Eye', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 199.00, -5, -10, -20, NULL, NULL),
('EduSchool', 'Secure Firewall', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 599.00, -5, -10, -20, NULL, NULL),
('EduSafe', 'PowerFleet AI Video', NULL, NULL, NULL, NULL, NULL, NULL, 2500.00, 800.00, -5, -10, -20, NULL, NULL),
('EduSafe', 'PowerFleet Dash Cam', NULL, NULL, NULL, NULL, NULL, NULL, 200.00, 600.00, -5, -10, -20, NULL, NULL),
('EduSafe', 'MiX Telematics', NULL, NULL, NULL, NULL, NULL, NULL, 550.00, 550.00, -5, -10, -20, NULL, NULL),
('EduSafe', 'myPanic App', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, -5, -10, -20, NULL, NULL);

-- Whitelist from whitelist.csv
INSERT OR IGNORE INTO whitelist (phone, email, role) VALUES
('+27829295849', NULL, 'Admin'),
('+27721234567', NULL, 'Account'),
(NULL, 'pelayo@castrategy.co', 'Admin');

-- Test users for development
INSERT OR IGNORE INTO users (phone, email, name, surname, role, kyc_status, session_token, session_expires) VALUES
('+27123456789', 'customer@test.com', 'Test', 'Customer', 'customer', 'pending', NULL, NULL),
('+27829295849', 'admin@test.com', 'Admin', 'User', 'admin', 'completed', NULL, NULL),
('+27721234567', 'account@test.com', 'Account', 'User', 'account', 'completed', NULL, NULL);

-- Demo OTP code (always valid: 123456)
INSERT INTO otp_codes (phone_or_email, otp_code, expires_at) VALUES
('demo', '123456', datetime('now', '+1 year'));
