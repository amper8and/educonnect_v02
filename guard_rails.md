# EduConnect V2.0 - Guardrails & Regression Testing

## Overview

This document defines the regression testing protocol and deployment approval process for EduConnect V2.0 to ensure:
1. No previously committed functionality is broken during development
2. All new features meet specification requirements
3. Deployments follow proper approval workflow

---

## Regression Testing Protocol

### Testing Phases

#### 1. Pre-Commit Testing
Before committing code changes:
- [ ] All modified files reviewed for syntax errors
- [ ] Code follows project conventions (TypeScript, ESLint)
- [ ] No console.log statements in production code
- [ ] All temporary/debug code removed

#### 2. Automated Testing
After each code change:
- [ ] API endpoints tested with curl commands
- [ ] Database queries validated (no SQL errors)
- [ ] Response formats match specification
- [ ] Error handling works correctly

#### 3. Manual Testing Checklist
After each delivery, test ALL previously implemented features:

##### Delivery 3 Checklist (Login Functionality)
- [ ] Login page displays correctly (mobile + desktop)
- [ ] MTN EduConnect logo loads
- [ ] Hero image displays
- [ ] Phone/email input accepts valid formats
- [ ] OTP request button triggers demo OTP
- [ ] OTP verification succeeds with demo code
- [ ] Invalid OTP shows error message
- [ ] Session created on successful login (7-day expiry)
- [ ] User redirected to dashboard after login

##### Delivery 4 Checklist (Dashboard + Modals)
**Includes all Delivery 3 tests, plus:**
- [ ] Dashboard loads after successful login
- [ ] First-time users see KYC prompt
- [ ] Profile icon opens KYC modal
- [ ] KYC Step 1 (Identity) form validation works
- [ ] KYC Step 2 (Authorization) form validation works
- [ ] KYC Step 3 (Proof of Humanity) file upload works
- [ ] KYC Step 4 (Documentation) file uploads work
- [ ] KYC completion unlocks dashboard features
- [ ] "Create New Solution" tile appears
- [ ] Profile icon opens settings modal (post-KYC)
- [ ] Whitelist management visible to Admin only
- [ ] Solution library management visible to Admin only
- [ ] Dark/light mode toggle works
- [ ] Logout button ends session

##### Delivery 5 Checklist (Solution Builder + Account Modal)
**Includes all Delivery 3 & 4 tests, plus:**
- [ ] Solution Builder opens from dashboard
- [ ] Solution type selection (EduStudent/EduFlex/EduSchool/EduSafe)
- [ ] Address input field works
- [ ] Customer name input works
- [ ] Product selection from solution_library.csv
- [ ] Live price calculation updates correctly
- [ ] Discount calculation (6/12/24 month terms)
- [ ] Discount code application
- [ ] Stacking discounts calculate correctly
- [ ] Price display shows once-off + monthly
- [ ] Clicking price opens Account Modal
- [ ] Account Modal displays order summary
- [ ] Payment method selection works (demo mode)
- [ ] Order submission creates database record
- [ ] Order appears in dashboard history
- [ ] Usage/spend reports display data

##### Delivery 6 Checklist (File Uploads)
**Includes all Delivery 3, 4, 5 tests, plus:**
- [ ] Cloudflare R2 bucket configured
- [ ] KYC selfie uploads to R2
- [ ] KYC documents upload to R2
- [ ] File size validation (max limits)
- [ ] File type validation (images, PDFs only)
- [ ] Upload progress indicator works
- [ ] File URLs stored in database
- [ ] Files accessible via secure URLs
- [ ] Admin CSV import (whitelist) works
- [ ] Admin CSV import (solution library) works
- [ ] CSV export functionality works

##### Delivery 7 Checklist (LLM Integration)
**Includes all previous tests, plus:**
- [ ] LLM chat interface appears in Solution Builder
- [ ] User can describe needs in natural language
- [ ] LLM recommends appropriate solutions
- [ ] LLM can build solutions based on conversation
- [ ] LLM applies solutions to builder automatically
- [ ] LLM responses are contextually relevant
- [ ] LLM handles edge cases gracefully

---

## Deployment Approval Process

### Staging Deployment

#### Prerequisites
1. All regression tests passed
2. Code committed to GitHub
3. Delivery checklist completed

#### Approval Workflow
1. **Developer**: Run full regression test suite
2. **Developer**: Document test results in log.md
3. **Developer**: Request staging deployment approval
4. **Client**: Review test results and code changes
5. **Client**: Approve or request changes
6. **Developer**: Deploy to Cloudflare Pages staging
7. **Developer**: Provide staging URL + test credentials
8. **Client**: Perform acceptance testing

#### Staging Deployment Commands
```bash
# Build project
cd /home/user/webapp && npm run build

# Deploy to staging
npx wrangler pages deploy dist --project-name educonnect-v2-staging

# Apply database migrations (staging)
npx wrangler d1 migrations apply educonnect-staging --remote
```

---

### Production Deployment

#### Prerequisites
1. Staging deployment successful
2. Client signoff received
3. Client acceptance testing completed
4. No critical bugs reported

#### Approval Workflow
1. **Client**: Perform full acceptance testing on staging
2. **Client**: Document test confirmation
3. **Client**: Provide explicit production deployment approval
4. **Developer**: Create production database
5. **Developer**: Deploy to Cloudflare Pages production
6. **Developer**: Apply migrations to production database
7. **Developer**: Verify production deployment
8. **Client**: Final smoke test on production

#### Production Deployment Commands
```bash
# Create production database (first time only)
npx wrangler d1 create educonnect-production

# Update wrangler.jsonc with production database_id

# Build project
cd /home/user/webapp && npm run build

# Deploy to production
npx wrangler pages deploy dist --project-name educonnect-v2

# Apply database migrations (production)
npx wrangler d1 migrations apply educonnect-production --remote
```

---

## Issue Resolution Protocol

### Standard Resolution Process
1. **Identify Issue**: Clear description of problem
2. **Reproduce**: Steps to reproduce consistently
3. **Research**: Check documentation, similar issues
4. **Solution**: Apply standard fix
5. **Test**: Verify fix doesn't break other features
6. **Document**: Update log.md

### Failed Resolution Protocol
If issue resolution fails **more than once**:

1. **STOP**: Do not attempt exotic or experimental solutions
2. **Document**:
   - What was attempted
   - What typically should work
   - Why it's not working
3. **Present Options**:
   - Standard approach (with explanation of failure)
   - Alternative approach 1 (pros/cons)
   - Alternative approach 2 (pros/cons)
   - Workaround (temporary solution)
4. **Client Decision**: Client chooses path forward
5. **Implement**: Execute chosen solution
6. **Document**: Record decision and outcome in log.md

---

## Version Control

### Git Workflow

#### Branch Strategy
- `main`: Production-ready code (protected)
- `staging`: Staging environment code
- `delivery-X`: Feature branches for each delivery

#### Commit Standards
- **Format**: `[DELIVERY-X] Brief description`
- **Examples**:
  - `[DELIVERY-1] Add governance documentation`
  - `[DELIVERY-3] Implement OTP login`
  - `[DELIVERY-4] Fix KYC modal validation`

#### Tagging
After each successful deployment:
```bash
# Staging deployment
git tag v2.0-delivery-X-staging
git push origin v2.0-delivery-X-staging

# Production deployment
git tag v2.0-delivery-X-production
git push origin v2.0-delivery-X-production
```

---

## Rollback Procedure

### Staging Rollback
If critical issue discovered in staging:
1. Identify last known good deployment tag
2. Checkout tag: `git checkout v2.0-delivery-X-staging`
3. Redeploy: `npx wrangler pages deploy dist`
4. Document rollback in log.md

### Production Rollback
If critical issue in production:
1. **IMMEDIATE**: Notify client
2. Checkout last production tag: `git checkout v2.0-delivery-X-production`
3. Emergency deploy: `npx wrangler pages deploy dist`
4. Document incident in log.md
5. Schedule post-mortem with client

---

## Testing Credentials

### Demo Mode Credentials
For testing during Delivery 3-5:

**OTP Codes**:
- Any phone/email can request OTP
- Demo OTP: `123456` (always valid)

**Test Users**:
```
Customer User:
- Phone: +27 123456789
- Email: customer@test.com
- Role: Customer

Admin User:
- Phone: +27 829295849
- Email: pelayo@castrategy.co
- Role: Admin

Account User:
- Phone: +27 721234567
- Email: account@test.com
- Role: Account
```

**Test Solutions**:
- Pre-populated from solution_library.csv
- Whitelist pre-populated from whitelist.csv

---

## Performance Benchmarks

### Response Time Targets
- API endpoints: < 200ms (p95)
- Page load: < 2s (first contentful paint)
- Database queries: < 50ms (p95)

### Monitoring
After each deployment, verify:
- [ ] API response times within target
- [ ] No 500 errors in logs
- [ ] Database query performance acceptable
- [ ] No memory leaks (Cloudflare Workers stats)

---

## Documentation Updates

After each delivery:
1. Update `spec.md` with implementation details
2. Update `log.md` with activities and decisions
3. Update `guard_rails.md` if process changes
4. Update `README.md` with deployment URLs and status

---

## Sign-Off Requirements

### Staging Deployment Sign-Off
**Developer Confirmation**:
- [ ] All regression tests passed
- [ ] Code committed and pushed to GitHub
- [ ] Build successful
- [ ] Database migrations applied

**Client Approval Required**: YES ✅

---

### Production Deployment Sign-Off
**Developer Confirmation**:
- [ ] Staging deployment stable (no critical issues)
- [ ] Client acceptance testing completed
- [ ] Production database created
- [ ] All migrations ready

**Client Test Confirmation Required**: YES ✅
**Client Production Approval Required**: YES ✅

---

*Last Updated: 2026-02-11*
