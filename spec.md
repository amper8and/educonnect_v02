# EduConnect V2.0 - Technical Specification

## Project Overview

**EduConnect** is a web portal for customers and sales representatives to discover, order, and manage education-defined solutions by MTN EBU in South Africa.

- **Platform**: Cloudflare Pages + Workers
- **Framework**: Hono (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Deployment**: Staging → Production (post client approval)

---

## User Journey

### 1. Authentication (Delivery 3)
- **Login Method**: OTP via Email or WhatsApp
- **Session Duration**: 7 days
- **User Types**: Customer, Admin, Account (same authentication flow)
- **Demo Mode**: Internal OTP trigger (no external API integration yet)

### 2. Dashboard (Delivery 4)

#### First-Time Users
- Redirected to KYC/Onboarding modal
- Cannot access dashboard features until KYC complete

#### KYC Process (4 Steps)
1. **Identity**: Name, surname, ID/passport, DOB, phone, email
2. **Authorization**: Student/staff ID, institution name, role (student/teacher/staff/parent)
3. **Proof of Humanity**: Selfie with date, name, ID number
4. **Documentation**: Upload ID document, proof of residence

#### Completed KYC Users
- Full dashboard access
- View solution tiles (created solutions)
- Create new solutions
- Access profile settings modal:
  - Logout, dark/light mode
  - Whitelist management (Admin only)
  - Solution library management (Admin only)

### 3. Solution Builder (Delivery 5)
- **Solution Types**: EduStudent, EduFlex, EduSchool, EduSafe (select one)
- **Configuration**: Address, customer details, product selection
- **Live Pricing**: Updates as configuration changes
- **Validation**: Basic rules from solution_library.csv

### 4. Account Modal (Delivery 5)
- Order finalization
- Payment options: Mobile Money, Credit Card, EFT, Airtime (demo mode)
- Spend and usage reports
- Order history

---

## Data Models

### Users
```sql
CREATE TABLE users (
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  session_token TEXT,
  session_expires DATETIME
);
```

### KYC Documents
```sql
CREATE TABLE kyc_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  institution_name TEXT,
  institution_role TEXT, -- student, teacher, staff, parent
  student_staff_id TEXT,
  selfie_url TEXT,
  id_document_url TEXT,
  proof_of_residence_url TEXT,
  verification_status TEXT DEFAULT 'pending',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Solutions
```sql
CREATE TABLE solutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  solution_type TEXT, -- EduStudent, EduFlex, EduSchool, EduSafe
  name TEXT,
  address TEXT,
  customer_name TEXT,
  configuration JSON, -- Product selections, quantities, options
  price_once_off REAL,
  price_monthly REAL,
  term_months INTEGER, -- 0 (month-to-month), 6, 12, 24
  discount_code TEXT,
  total_discount_percent REAL,
  status TEXT DEFAULT 'draft', -- draft, active, cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Orders
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solution_id INTEGER,
  user_id INTEGER,
  order_number TEXT UNIQUE,
  payment_method TEXT, -- mobile_money, credit_card, eft, airtime
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed, cancelled
  amount_once_off REAL,
  amount_monthly REAL,
  payment_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solution_id) REFERENCES solutions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Whitelist
```sql
CREATE TABLE whitelist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT,
  email TEXT,
  role TEXT, -- Admin, Account
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  added_by INTEGER,
  FOREIGN KEY (added_by) REFERENCES users(id)
);
```

### Solution Library
```sql
CREATE TABLE solution_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  solution TEXT, -- EduStudent, EduFlex, EduSchool, EduSafe
  product TEXT,
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
  once_off REAL,
  month_on_month REAL,
  discount_6mth REAL,
  discount_12mth REAL,
  discount_24mth REAL,
  discount_code TEXT,
  discount_percent REAL
);
```

---

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP code
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `POST /api/auth/logout` - End session

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/kyc-status` - Check KYC status

### KYC
- `POST /api/kyc/identity` - Submit identity information
- `POST /api/kyc/authorization` - Submit authorization details
- `POST /api/kyc/proof-of-humanity` - Upload selfie
- `POST /api/kyc/documents` - Upload ID and proof of residence

### Solutions
- `GET /api/solutions` - List user's solutions
- `POST /api/solutions` - Create new solution
- `GET /api/solutions/:id` - Get solution details
- `PUT /api/solutions/:id` - Update solution
- `DELETE /api/solutions/:id` - Delete solution
- `POST /api/solutions/:id/calculate-price` - Calculate pricing with discounts

### Orders
- `GET /api/orders` - List user's orders
- `POST /api/orders` - Create order from solution
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/payment` - Process payment (demo mode)

### Admin (Admin role only)
- `GET /api/admin/whitelist` - Get whitelist
- `POST /api/admin/whitelist/import` - Import whitelist CSV
- `GET /api/admin/whitelist/export` - Export whitelist CSV
- `GET /api/admin/solution-library` - Get solution library
- `POST /api/admin/solution-library/import` - Import solution library CSV
- `GET /api/admin/solution-library/export` - Export solution library CSV

---

## Design System

### Colors
- **Primary Yellow**: #FFCB00
- **Primary Black**: #000000
- **Background**: White (#FFFFFF)
- **Text**: Black (#000000)
- **Success**: Green (#00C853)
- **Error**: Red (#D32F2F)
- **Warning**: Orange (#FF6D00)

### Typography
**MTN Brighter Sans**
- Light: 300 weight
- Regular: 400 weight
- Bold: 700 weight

**Font Files**:
- `MTN_Brighter_Sans_Light.ttf`
- `MTN_Brighter_Sans_Regular.ttf`
- `MTN_Brighter_Sans_Bold.ttf`

### Logos
- Login page: `MTN EduConnect logo.png`
- Dashboard/Builder: `EduConnect_landscape_logo.png`
- Hero image: `educonnect_hero_image.png`

### Icons
**Solution Types**:
- EduStudent: `edustudent icon.png`
- EduFlex: `eduflex icon.png`
- EduSchool: `eduschool icon 2.png`
- EduSafe: `edusafe icon.png`

**Connectivity**:
- Fibre: `fibre icon.png`
- Wireless: `fixed wireless icon.png`
- Mobile: `mobile icon.png`

**Other**:
- Person: `person icon.png`
- Site: `site icon.png`
- Folder: `folder icon.png`
- Bus: `asset icon.png`

### Responsive Design
- **Primary Target**: Android devices (Samsung)
- **Breakpoints**:
  - Mobile: 0-767px
  - Tablet: 768-1023px
  - Desktop: 1024px+

---

## Security

### Authentication
- OTP-based (no password storage)
- 7-day session tokens
- HTTP-only cookies for session management

### Authorization
- Role-based access control (Customer, Account, Admin)
- Whitelist defines Admin/Account roles
- Non-whitelisted users default to Customer role

### Data Protection
- HTTPS only (enforced by Cloudflare)
- Encrypted file storage (Cloudflare R2)
- SQL injection protection (parameterized queries)

---

## Deployment Strategy

### Staging Environment
- **Purpose**: Client review and approval
- **URL**: TBD (Cloudflare Pages staging)
- **Database**: Cloudflare D1 (staging instance)
- **Deployment Trigger**: Manual (requires approval)

### Production Environment
- **Status**: Not created yet
- **Deployment**: Post client signoff only
- **Database**: Cloudflare D1 (production instance)
- **Deployment Trigger**: Manual (requires test confirmation)

---

## File Upload Strategy

### Development Phase (Delivery 1-5)
- File uploads simulated (demo mode)
- Store base64 data in database temporarily

### Production Phase (Delivery 6+)
- Cloudflare R2 for document storage
- Pre-signed URLs for secure uploads
- File validation (type, size)

---

## Future Integrations (Post-Demo)

### OTP Providers
- Email: SendGrid / Mailgun / Resend
- WhatsApp: Twilio / Africa's Talking

### Payment Gateway
- Options: PayFast, Peach Payments, Yoco
- Integration: Delivery 6

### LLM Integration (Delivery 7)
- Conversational solution builder
- Solution recommendations based on:
  - User needs
  - Location
  - Budget
  - Usage patterns

---

## Technology Stack Details

### Frontend
- Vanilla JavaScript (ES6+)
- Tailwind CSS (via CDN)
- Responsive design (mobile-first)
- No build tools (direct HTML/CSS/JS)

### Backend
- Hono framework (TypeScript)
- Cloudflare Workers runtime
- RESTful API design

### Database
- Cloudflare D1 (SQLite)
- Migrations via Wrangler CLI

### Deployment
- Cloudflare Pages
- Git-based deployments
- Preview deployments per branch

---

## Development Deliveries

1. **Delivery 1**: Guardrails, documentation, project setup ✅
2. **Delivery 2**: Specification, user journey ✅
3. **Delivery 3**: Login functionality
4. **Delivery 4**: Dashboard and modals
5. **Delivery 5**: Solution Builder and account modal
6. **Delivery 6**: File upload integration
7. **Delivery 7**: LLM functionality integration

---

*Last Updated: 2026-02-11*
