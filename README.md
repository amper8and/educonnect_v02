# MTN EduConnect V2.0

## Project Overview
**EduConnect V2.0** is a web portal for customers and sales representatives to discover, order, and manage education-defined solutions by MTN EBU in South Africa.

- **Platform**: Cloudflare Pages + Workers
- **Framework**: Hono (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Staging (Client approval required for production)

## Current Status
**Delivery 1 Complete** ✅
- Project structure initialized
- Database schema created
- MTN branding assets prepared
- Ready for Delivery 3: Login Development

## URLs
- **GitHub Repository**: https://github.com/amper8and/educonnect_v02
- **Staging**: Not yet deployed
- **Production**: Not yet created

## Project Structure
```
/home/user/webapp/
├── src/
│   ├── index.tsx          # Main Hono application
│   └── routes/            # API route handlers (Delivery 3+)
├── public/
│   ├── assets/
│   │   ├── icons/         # Solution and connectivity icons
│   │   ├── logos/         # MTN EduConnect logos
│   │   └── images/        # Hero images
│   └── fonts/             # MTN Brighter Sans (Light, Regular, Bold)
├── migrations/
│   └── 0001_initial_schema.sql  # Database schema
├── seed.sql               # Test data
├── log.md                 # Development activity log
├── spec.md                # Technical specification
├── guard_rails.md         # Regression testing protocol
├── ASSETS.md              # Asset inventory
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── wrangler.jsonc         # Cloudflare configuration
└── ecosystem.config.cjs   # PM2 configuration
```

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Initialize database (first time only)
npm run db:migrate:local
npm run db:seed
```

### Development
```bash
# Build project
npm run build

# Start development server (PM2)
pm2 start ecosystem.config.cjs

# Test server
npm test  # curl http://localhost:3000

# Check logs
pm2 logs educonnect-v2 --nostream

# Stop server
pm2 stop educonnect-v2
```

### Database
```bash
# Run migrations (local)
npm run db:migrate:local

# Seed test data
npm run db:seed

# Reset database
npm run db:reset

# Database console
npm run db:console:local
```

### Deployment (Staging)
```bash
# Build and deploy to staging (requires client approval)
npm run deploy:staging
```

## Features

### Delivery 1 ✅ (Complete)
- Project initialization with Hono + Cloudflare Pages
- Database schema (users, KYC, solutions, orders, whitelist, solution library)
- Governance documentation (log.md, spec.md, guard_rails.md)
- MTN branding assets and fonts
- Development environment setup

### Delivery 3 (Pending)
- OTP-based authentication (email/WhatsApp - demo mode)
- Login page with MTN branding
- Session management (7-day duration)

### Delivery 4 (Pending)
- Dashboard UI
- KYC/Onboarding 4-step modal
- Profile settings modal
- Whitelist management (Admin only)
- Solution library management (Admin only)

### Delivery 5 (Pending)
- Solution Builder wizard
- Live pricing calculator
- Account modal (orders, payments, reports)

### Delivery 6 (Pending)
- File upload integration (Cloudflare R2)
- CSV import/export functionality

### Delivery 7 (Pending)
- LLM conversational solution builder
- AI-powered recommendations

## Data Models

### Users
- Authentication (phone/email, OTP)
- Profile (name, ID, role)
- KYC status tracking
- Session management

### KYC Documents
- Identity information
- Authorization (institution, role)
- Proof of humanity (selfie)
- Documents (ID, proof of residence)

### Solutions
- Solution type (EduStudent, EduFlex, EduSchool, EduSafe)
- Configuration (products, quantities)
- Pricing (once-off, monthly, discounts)
- Status tracking

### Orders
- Payment processing (demo mode)
- Order history
- Spend and usage tracking

### Whitelist
- Admin/Account role assignment
- CSV management

### Solution Library
- Product catalog from solution_library.csv
- Pricing tiers
- Discount rules

## Branding

### Colors
- **Primary Yellow**: #FFCB00
- **Primary Black**: #000000

### Fonts
- **MTN Brighter Sans**
  - Light (300)
  - Regular (400)
  - Bold (700)

### Logos
- Login page: `mtn_educonnect_logo.png`
- Dashboard/Builder: `educonnect_landscape_logo.png`

## Testing

### Demo Mode
During Delivery 3-5, all external integrations use demo mode:
- **OTP**: Any phone/email can request OTP, demo code is `123456`
- **KYC**: File uploads simulated (base64 storage)
- **Payments**: Mock payment processing

### Test Users
```
Customer: +27123456789 / customer@test.com
Admin: +27829295849 / admin@test.com
Account: +27721234567 / account@test.com
```

## Deployment Status
- **Staging**: Not deployed (awaiting Delivery 3 completion)
- **Production**: Not created (requires client signoff)

## Next Steps
1. Complete Delivery 3: Login functionality
2. Deploy to staging for client review
3. Proceed to Delivery 4 after approval

---

**Last Updated**: 2026-02-11  
**Version**: 2.0.0 (Delivery 1)  
**License**: PROPRIETARY - MTN EBU
