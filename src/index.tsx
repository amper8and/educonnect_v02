import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import auth from './routes/auth'
import solutions from './routes/solutions'
import kyc from './routes/kyc'
import dashboard from './routes/dashboard'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files - but skip the problematic serve-static middleware for now
// app.use('/static/*', serveStatic({ root: './public' }))
app.use('/assets/*', serveStatic({ root: './public' }))
app.use('/fonts/*', serveStatic({ root: './public' }))

// Mount API routes
app.route('/api/auth', auth)
app.route('/api/solutions', solutions)
app.route('/api/kyc', kyc)
app.route('/api/dashboard', dashboard)

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Dashboard route - serve inline HTML for compatibility
app.get('/dashboard', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - MTN EduConnect</title>
    <style>
        @font-face {
            font-family: 'MTN Brighter Sans';
            src: url('/fonts/MTN_Brighter_Sans_Regular.ttf') format('truetype');
            font-weight: 400;
        }
        @font-face {
            font-family: 'MTN Brighter Sans';
            src: url('/fonts/MTN_Brighter_Sans_Light.ttf') format('truetype');
            font-weight: 300;
        }
        @font-face {
            font-family: 'MTN Brighter Sans';
            src: url('/fonts/MTN_Brighter_Sans_Bold.ttf') format('truetype');
            font-weight: 700;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'MTN Brighter Sans', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
        }
        
        /* Header */
        .dashboard-header {
            background: white;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 2rem;
        }
        
        .logo {
            height: 40px;
        }
        
        .dashboard-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #000;
        }
        
        .header-right {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .profile-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #FFCB00;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #000;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .profile-icon:hover {
            transform: scale(1.1);
        }
        
        /* Main Content */
        .dashboard-content {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        
        .welcome-banner {
            background: linear-gradient(135deg, #FFCB00 0%, #FFD633 100%);
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            color: #000;
        }
        
        .welcome-banner h2 {
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
        }
        
        .welcome-banner p {
            opacity: 0.8;
        }
        
        /* KYC Banner */
        .kyc-banner {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .kyc-banner.hidden {
            display: none;
        }
        
        .kyc-banner-content h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: #000;
        }
        
        .kyc-banner-content p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .btn-complete-kyc {
            background: #FFCB00;
            color: #000;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
        }
        
        .btn-complete-kyc:hover {
            background: #E6B800;
            transform: translateY(-2px);
        }
        
        /* Solutions Grid */
        .solutions-section h3 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: #000;
        }
        
        .solutions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        /* Solution Card */
        .solution-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .solution-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        
        .solution-card.create-new {
            border: 2px dashed #FFCB00;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            background: #FFFEF5;
        }
        
        .create-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #FFCB00;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            font-weight: 300;
            color: #000;
            margin-bottom: 1rem;
        }
        
        .create-text {
            font-size: 1.125rem;
            font-weight: 700;
            color: #000;
        }
        
        .solution-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1rem;
        }
        
        .solution-type {
            font-size: 0.875rem;
            color: #666;
            font-weight: 400;
        }
        
        .solution-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
        }
        
        .status-active {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .status-draft {
            background: #fff3e0;
            color: #ef6c00;
        }
        
        .solution-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: #000;
            margin-bottom: 0.75rem;
        }
        
        .solution-details {
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 1rem;
        }
        
        .solution-price {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #f0f0f0;
        }
        
        .price-item {
            flex: 1;
        }
        
        .price-label {
            font-size: 0.75rem;
            color: #999;
            margin-bottom: 0.25rem;
        }
        
        .price-value {
            font-size: 1.125rem;
            font-weight: 700;
            color: #000;
        }
        
        /* Loading State */
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
            font-size: 1.5rem;
            color: #666;
        }
        
        /* KYC Modal */
        .kyc-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 1000;
            overflow-y: auto;
            padding: 2rem;
        }
        
        .kyc-modal.show {
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        
        .kyc-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 700px;
            width: 100%;
            margin: 2rem auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        .kyc-modal-header {
            padding: 2rem;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .kyc-modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #000;
        }
        
        .kyc-close-btn {
            background: none;
            border: none;
            font-size: 2rem;
            color: #999;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .kyc-close-btn:hover {
            color: #000;
        }
        
        /* Progress Indicator */
        .kyc-progress {
            display: flex;
            justify-content: space-between;
            padding: 2rem;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .kyc-step {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            position: relative;
        }
        
        .kyc-step:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 20px;
            left: 60%;
            width: 80%;
            height: 2px;
            background: #e0e0e0;
        }
        
        .kyc-step.active:not(:last-child)::after,
        .kyc-step.completed:not(:last-child)::after {
            background: #FFCB00;
        }
        
        .step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f5f5f5;
            color: #999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            border: 2px solid #e0e0e0;
            z-index: 1;
        }
        
        .kyc-step.active .step-number {
            background: #FFCB00;
            color: #000;
            border-color: #FFCB00;
        }
        
        .kyc-step.completed .step-number {
            background: #4caf50;
            color: white;
            border-color: #4caf50;
        }
        
        .kyc-step.completed .step-number::after {
            content: '✓';
        }
        
        .step-label {
            font-size: 0.875rem;
            color: #666;
            font-weight: 400;
        }
        
        .kyc-step.active .step-label {
            color: #000;
            font-weight: 700;
        }
        
        /* Step Content */
        .kyc-step-content {
            display: none;
            padding: 2rem;
        }
        
        .kyc-step-content.active {
            display: block;
        }
        
        .step-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #000;
            margin-bottom: 0.5rem;
        }
        
        .step-description {
            color: #666;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            font-size: 0.9rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 1px solid #d0d0d0;
            border-radius: 6px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #FFCB00;
        }
        
        .form-group input::placeholder {
            color: #999;
        }
        
        /* File Upload */
        .file-upload-area {
            border: 2px dashed #d0d0d0;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }
        
        .file-upload-area:hover {
            border-color: #FFCB00;
            background: #FFFEF5;
        }
        
        .upload-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .upload-placeholder p {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.25rem;
        }
        
        .upload-placeholder small {
            color: #999;
            font-size: 0.875rem;
        }
        
        .upload-preview {
            position: relative;
        }
        
        .upload-preview img {
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            object-fit: cover;
        }
        
        .remove-file-btn {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #f44336;
            color: white;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        
        .remove-file-btn:hover {
            background: #d32f2f;
        }
        
        /* Summary */
        .kyc-summary {
            background: #f5f5f5;
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
        }
        
        .kyc-summary h4 {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #000;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .summary-item:last-child {
            border-bottom: none;
        }
        
        .summary-item span:first-child {
            color: #666;
            font-weight: 400;
        }
        
        .summary-item span:last-child {
            color: #000;
            font-weight: 600;
        }
        
        /* Modal Actions */
        .kyc-modal-actions {
            padding: 2rem;
            border-top: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .navigation-btns {
            display: flex;
            gap: 1rem;
        }
        
        .btn-back {
            padding: 0.875rem 1.5rem;
            background: #f5f5f5;
            border: 1px solid #d0d0d0;
            border-radius: 6px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-back:hover {
            background: #e0e0e0;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .dashboard-header {
                padding: 1rem;
            }
            
            .header-left {
                gap: 1rem;
            }
            
            .dashboard-title {
                display: none;
            }
            
            .dashboard-content {
                padding: 0 1rem;
            }
            
            .solutions-grid {
                grid-template-columns: 1fr;
            }
            
            .kyc-banner {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <!-- Dashboard Header -->
    <header class="dashboard-header">
        <div class="header-left">
            <img src="/assets/logos/educonnect_landscape_logo.png" alt="EduConnect" class="logo" onerror="this.style.display='none'">
            <h1 class="dashboard-title">My Solutions</h1>
        </div>
        <div class="header-right">
            <div class="profile-icon" id="profileIcon"></div>
        </div>
    </header>
    
    <!-- Main Content -->
    <main class="dashboard-content">
        <div class="loading" id="loading">Loading...</div>
        
        <div id="dashboardMain" style="display: none;">
            <!-- Welcome Banner -->
            <div class="welcome-banner">
                <h2 id="welcomeMessage">Welcome back!</h2>
                <p>Manage your education connectivity solutions</p>
            </div>
            
            <!-- KYC Pending Banner -->
            <div class="kyc-banner hidden" id="kycBanner">
                <div class="kyc-banner-content">
                    <h3>Complete Your KYC Verification</h3>
                    <p>Please complete your KYC verification to unlock all features</p>
                </div>
                <button class="btn-complete-kyc" id="btnCompleteKYC">Complete KYC</button>
            </div>
            
            <!-- Solutions Section -->
            <div class="solutions-section">
                <h3>Your Solutions</h3>
                <div class="solutions-grid" id="solutionsGrid">
                    <!-- Create New Solution Card -->
                    <div class="solution-card create-new" id="btnCreateSolution">
                        <div class="create-icon">+</div>
                        <div class="create-text">Create New Solution</div>
                    </div>
                    
                    <!-- Solution cards will be dynamically added here -->
                </div>
            </div>
        </div>
    </main>
    
    <!-- KYC Modal -->
    <div class="kyc-modal" id="kycModal">
        <div class="kyc-modal-content">
            <div class="kyc-modal-header">
                <h2 class="kyc-modal-title">Complete Your KYC Verification</h2>
                <button class="kyc-close-btn" id="kycCloseBtn">&times;</button>
            </div>
            
            <!-- Progress Indicator -->
            <div class="kyc-progress">
                <div class="kyc-step active" data-step="1">
                    <div class="step-number">1</div>
                    <div class="step-label">Identity</div>
                </div>
                <div class="kyc-step" data-step="2">
                    <div class="step-number">2</div>
                    <div class="step-label">Authorization</div>
                </div>
                <div class="kyc-step" data-step="3">
                    <div class="step-number">3</div>
                    <div class="step-label">Verification</div>
                </div>
                <div class="kyc-step" data-step="4">
                    <div class="step-number">4</div>
                    <div class="step-label">Documents</div>
                </div>
            </div>
            
            <!-- Step 1: Identity -->
            <div class="kyc-step-content active" id="kycStep1">
                <h3 class="step-title">Personal Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>First Name *</label>
                        <input type="text" id="kycFirstName" placeholder="Enter your first name" required>
                    </div>
                    <div class="form-group">
                        <label>Last Name *</label>
                        <input type="text" id="kycLastName" placeholder="Enter your last name" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>SA ID Number *</label>
                        <input type="text" id="kycIdNumber" placeholder="Enter your ID number" maxlength="13" required>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth *</label>
                        <input type="date" id="kycDob" required>
                    </div>
                </div>
            </div>
            
            <!-- Step 2: Authorization -->
            <div class="kyc-step-content" id="kycStep2">
                <h3 class="step-title">Institution Authorization</h3>
                <div class="form-group">
                    <label>Institution Name *</label>
                    <input type="text" id="kycInstitution" placeholder="Enter institution name" required>
                </div>
                <div class="form-group">
                    <label>Your Role *</label>
                    <select id="kycRole" required>
                        <option value="">Select your role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Administrator</option>
                        <option value="parent">Parent</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Student/Staff ID *</label>
                    <input type="text" id="kycStaffId" placeholder="Enter your ID number" required>
                </div>
            </div>
            
            <!-- Step 3: Verification -->
            <div class="kyc-step-content" id="kycStep3">
                <h3 class="step-title">Proof of Humanity</h3>
                <p class="step-description">Please upload a selfie and your ID document for verification</p>
                <div class="form-group">
                    <label>Selfie Photo *</label>
                    <div class="file-upload-area" id="selfieUploadArea">
                        <input type="file" id="selfieInput" accept="image/*" style="display: none;">
                        <div class="upload-placeholder">
                            <div class="upload-icon">📸</div>
                            <p>Click to upload selfie</p>
                            <small>JPG, PNG up to 5MB</small>
                        </div>
                        <div class="upload-preview" id="selfiePreview" style="display: none;">
                            <img id="selfieImg" alt="Selfie preview">
                            <button class="remove-file-btn" id="removeSelfie">&times;</button>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>ID Document Photo *</label>
                    <div class="file-upload-area" id="idUploadArea">
                        <input type="file" id="idInput" accept="image/*" style="display: none;">
                        <div class="upload-placeholder">
                            <div class="upload-icon">🪪</div>
                            <p>Click to upload ID document</p>
                            <small>JPG, PNG up to 5MB</small>
                        </div>
                        <div class="upload-preview" id="idPreview" style="display: none;">
                            <img id="idImg" alt="ID preview">
                            <button class="remove-file-btn" id="removeId">&times;</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Step 4: Documents -->
            <div class="kyc-step-content" id="kycStep4">
                <h3 class="step-title">Supporting Documents</h3>
                <p class="step-description">Please upload proof of residence (utility bill, bank statement, etc.)</p>
                <div class="form-group">
                    <label>Proof of Residence *</label>
                    <div class="file-upload-area" id="porUploadArea">
                        <input type="file" id="porInput" accept="image/*,application/pdf" style="display: none;">
                        <div class="upload-placeholder">
                            <div class="upload-icon">📄</div>
                            <p>Click to upload document</p>
                            <small>PDF, JPG, PNG up to 5MB</small>
                        </div>
                        <div class="upload-preview" id="porPreview" style="display: none;">
                            <img id="porImg" alt="Document preview">
                            <button class="remove-file-btn" id="removePor">&times;</button>
                        </div>
                    </div>
                </div>
                <div class="kyc-summary">
                    <h4>Application Summary</h4>
                    <div class="summary-item">
                        <span>Name:</span>
                        <span id="summaryName">-</span>
                    </div>
                    <div class="summary-item">
                        <span>ID Number:</span>
                        <span id="summaryId">-</span>
                    </div>
                    <div class="summary-item">
                        <span>Institution:</span>
                        <span id="summaryInstitution">-</span>
                    </div>
                    <div class="summary-item">
                        <span>Role:</span>
                        <span id="summaryRole">-</span>
                    </div>
                </div>
            </div>
            
            <!-- Modal Actions -->
            <div class="kyc-modal-actions">
                <button class="btn-secondary" id="kycSaveExit">Save & Exit</button>
                <div class="navigation-btns">
                    <button class="btn-back" id="kycBackBtn" style="display: none;">Back</button>
                    <button class="btn-primary" id="kycNextBtn">Next</button>
                    <button class="btn-primary" id="kycSubmitBtn" style="display: none;">Submit KYC</button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Get session info
        const sessionToken = localStorage.getItem('educonnect_session');
        const localUser = JSON.parse(localStorage.getItem('educonnect_user') || '{}');
        
        // Redirect if not logged in
        if (!sessionToken) {
            window.location.href = '/';
        }
        
        // Load dashboard data
        async function loadDashboard() {
            try {
                const response = await fetch('/api/dashboard/data', {
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('educonnect_session');
                        localStorage.removeItem('educonnect_user');
                        window.location.href = '/';
                        return;
                    }
                    throw new Error('Failed to load dashboard');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    renderDashboard(data);
                } else {
                    throw new Error(data.message || 'Failed to load dashboard');
                }
            } catch (error) {
                console.error('Dashboard error:', error);
                document.getElementById('loading').textContent = 'Error loading dashboard. Please refresh.';
            }
        }
        
        // Render dashboard
        function renderDashboard(data) {
            const { user, solutions } = data;
            
            // Hide loading, show main
            document.getElementById('loading').style.display = 'none';
            document.getElementById('dashboardMain').style.display = 'block';
            
            // Update welcome message
            const userName = user.name || user.email || user.phone || 'User';
            document.getElementById('welcomeMessage').textContent = \`Welcome back, \${userName}!\`;
            
            // Update profile icon
            const initial = userName.charAt(0).toUpperCase();
            document.getElementById('profileIcon').textContent = initial;
            
            // Show KYC banner if needed
            if (user.kyc_status === 'pending') {
                document.getElementById('kycBanner').classList.remove('hidden');
            }
            
            // Render solutions
            renderSolutions(solutions);
        }
        
        // Render solutions grid
        function renderSolutions(solutions) {
            const grid = document.getElementById('solutionsGrid');
            
            // Keep the create new card and add solution cards
            solutions.forEach(solution => {
                const card = createSolutionCard(solution);
                grid.appendChild(card);
            });
        }
        
        // Create solution card HTML
        function createSolutionCard(solution) {
            const card = document.createElement('div');
            card.className = 'solution-card';
            card.onclick = () => viewSolution(solution.id);
            
            const statusClass = solution.status === 'active' ? 'status-active' : 'status-draft';
            const statusText = solution.status.charAt(0).toUpperCase() + solution.status.slice(1);
            
            const onceOff = solution.price_once_off ? \`R\${parseFloat(solution.price_once_off).toFixed(2)}\` : 'R0.00';
            const monthly = solution.price_monthly ? \`R\${parseFloat(solution.price_monthly).toFixed(2)}\` : 'R0.00';
            
            card.innerHTML = \`
                <div class="solution-header">
                    <div class="solution-type">\${solution.solution_type || 'Solution'}</div>
                    <span class="solution-status \${statusClass}">\${statusText}</span>
                </div>
                <div class="solution-name">\${solution.name || 'Untitled Solution'}</div>
                <div class="solution-details">
                    \${solution.address ? \`<div>📍 \${solution.address}</div>\` : ''}
                    \${solution.customer_name ? \`<div>👤 \${solution.customer_name}</div>\` : ''}
                </div>
                <div class="solution-price">
                    <div class="price-item">
                        <div class="price-label">Once-off</div>
                        <div class="price-value">\${onceOff}</div>
                    </div>
                    <div class="price-item">
                        <div class="price-label">Monthly</div>
                        <div class="price-value">\${monthly}</div>
                    </div>
                </div>
            \`;
            
            return card;
        }
        
        // Event handlers
        document.getElementById('profileIcon').addEventListener('click', () => {
            // TODO: Show profile modal (Delivery 4)
            alert('Profile settings coming soon!');
        });
        
        document.getElementById('btnCreateSolution').addEventListener('click', () => {
            // TODO: Navigate to solution builder (Delivery 5)
            alert('Solution builder coming in Delivery 5!');
        });
        
        document.getElementById('btnCompleteKYC').addEventListener('click', () => {
            openKYCModal();
        });
        
        function viewSolution(id) {
            // TODO: View solution details (Delivery 5)
            alert(\`Viewing solution \${id} - Details coming in Delivery 5!\`);
        }
        
        // KYC Modal Logic
        let currentKYCStep = 1;
        let kycData = {
            firstName: '',
            lastName: '',
            idNumber: '',
            dob: '',
            institution: '',
            role: '',
            staffId: '',
            selfieData: null,
            idDocData: null,
            porData: null
        };
        
        const kycModal = document.getElementById('kycModal');
        const kycCloseBtn = document.getElementById('kycCloseBtn');
        const kycBackBtn = document.getElementById('kycBackBtn');
        const kycNextBtn = document.getElementById('kycNextBtn');
        const kycSubmitBtn = document.getElementById('kycSubmitBtn');
        const kycSaveExit = document.getElementById('kycSaveExit');
        
        function openKYCModal() {
            kycModal.classList.add('show');
            loadKYCProgress();
        }
        
        function closeKYCModal() {
            kycModal.classList.remove('show');
        }
        
        kycCloseBtn.addEventListener('click', closeKYCModal);
        
        kycModal.addEventListener('click', (e) => {
            if (e.target === kycModal) {
                closeKYCModal();
            }
        });
        
        function goToKYCStep(step) {
            // Hide all steps
            document.querySelectorAll('.kyc-step-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('.kyc-step').forEach(stepEl => {
                stepEl.classList.remove('active');
                if (parseInt(stepEl.dataset.step) < step) {
                    stepEl.classList.add('completed');
                } else {
                    stepEl.classList.remove('completed');
                }
            });
            
            // Show current step
            document.getElementById('kycStep' + step).classList.add('active');
            document.querySelector(\`.kyc-step[data-step="\${step}"]\`).classList.add('active');
            
            currentKYCStep = step;
            
            // Update buttons
            kycBackBtn.style.display = step > 1 ? 'block' : 'none';
            kycNextBtn.style.display = step < 4 ? 'block' : 'none';
            kycSubmitBtn.style.display = step === 4 ? 'block' : 'none';
            
            // Update summary if on step 4
            if (step === 4) {
                updateKYCSummary();
            }
        }
        
        kycBackBtn.addEventListener('click', () => {
            if (currentKYCStep > 1) {
                goToKYCStep(currentKYCStep - 1);
            }
        });
        
        kycNextBtn.addEventListener('click', () => {
            if (validateKYCStep(currentKYCStep)) {
                saveKYCStepData();
                if (currentKYCStep < 4) {
                    goToKYCStep(currentKYCStep + 1);
                }
            }
        });
        
        function validateKYCStep(step) {
            let isValid = true;
            let errorMsg = '';
            
            if (step === 1) {
                const firstName = document.getElementById('kycFirstName').value.trim();
                const lastName = document.getElementById('kycLastName').value.trim();
                const idNumber = document.getElementById('kycIdNumber').value.trim();
                const dob = document.getElementById('kycDob').value;
                
                if (!firstName || !lastName || !idNumber || !dob) {
                    errorMsg = 'Please fill in all required fields';
                    isValid = false;
                } else if (idNumber.length !== 13) {
                    errorMsg = 'ID number must be 13 digits';
                    isValid = false;
                }
            } else if (step === 2) {
                const institution = document.getElementById('kycInstitution').value.trim();
                const role = document.getElementById('kycRole').value;
                const staffId = document.getElementById('kycStaffId').value.trim();
                
                if (!institution || !role || !staffId) {
                    errorMsg = 'Please fill in all required fields';
                    isValid = false;
                }
            } else if (step === 3) {
                if (!kycData.selfieData || !kycData.idDocData) {
                    errorMsg = 'Please upload both selfie and ID document';
                    isValid = false;
                }
            }
            
            if (!isValid) {
                alert(errorMsg);
            }
            
            return isValid;
        }
        
        function saveKYCStepData() {
            if (currentKYCStep === 1) {
                kycData.firstName = document.getElementById('kycFirstName').value.trim();
                kycData.lastName = document.getElementById('kycLastName').value.trim();
                kycData.idNumber = document.getElementById('kycIdNumber').value.trim();
                kycData.dob = document.getElementById('kycDob').value;
            } else if (currentKYCStep === 2) {
                kycData.institution = document.getElementById('kycInstitution').value.trim();
                kycData.role = document.getElementById('kycRole').value;
                kycData.staffId = document.getElementById('kycStaffId').value.trim();
            }
            
            // Save to localStorage for persistence
            try {
                // Don't save images to localStorage - they're too large
                // Only save text fields
                const dataToSave = {
                    firstName: kycData.firstName,
                    lastName: kycData.lastName,
                    idNumber: kycData.idNumber,
                    dob: kycData.dob,
                    institution: kycData.institution,
                    role: kycData.role,
                    staffId: kycData.staffId
                };
                localStorage.setItem('kyc_draft', JSON.stringify(dataToSave));
            } catch (e) {
                console.warn('Could not save to localStorage:', e);
                // Continue without saving - not critical for demo
            }
        }
        
        function loadKYCProgress() {
            const draft = localStorage.getItem('kyc_draft');
            if (draft) {
                kycData = JSON.parse(draft);
                
                // Populate fields
                if (kycData.firstName) document.getElementById('kycFirstName').value = kycData.firstName;
                if (kycData.lastName) document.getElementById('kycLastName').value = kycData.lastName;
                if (kycData.idNumber) document.getElementById('kycIdNumber').value = kycData.idNumber;
                if (kycData.dob) document.getElementById('kycDob').value = kycData.dob;
                if (kycData.institution) document.getElementById('kycInstitution').value = kycData.institution;
                if (kycData.role) document.getElementById('kycRole').value = kycData.role;
                if (kycData.staffId) document.getElementById('kycStaffId').value = kycData.staffId;
            }
        }
        
        function updateKYCSummary() {
            document.getElementById('summaryName').textContent = \`\${kycData.firstName} \${kycData.lastName}\`;
            document.getElementById('summaryId').textContent = kycData.idNumber;
            document.getElementById('summaryInstitution').textContent = kycData.institution;
            document.getElementById('summaryRole').textContent = kycData.role;
        }
        
        // File Upload Handlers with Image Compression
        function setupFileUpload(inputId, areaId, previewId, imgId, removeId, dataKey) {
            const input = document.getElementById(inputId);
            const area = document.getElementById(areaId);
            const preview = document.getElementById(previewId);
            const img = document.getElementById(imgId);
            const removeBtn = document.getElementById(removeId);
            
            area.addEventListener('click', () => {
                if (!kycData[dataKey]) {
                    input.click();
                }
            });
            
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Compress image before storing
                    const compressedDataUrl = await compressImage(file);
                    kycData[dataKey] = compressedDataUrl;
                    img.src = compressedDataUrl;
                    area.querySelector('.upload-placeholder').style.display = 'none';
                    preview.style.display = 'block';
                    
                    // Don't save to localStorage yet - only save on Save & Exit
                    // This prevents QuotaExceededError during upload
                }
            });
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                kycData[dataKey] = null;
                input.value = '';
                area.querySelector('.upload-placeholder').style.display = 'block';
                preview.style.display = 'none';
            });
        }
        
        // Compress image to reduce localStorage size
        function compressImage(file) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Resize to max 800x800 while maintaining aspect ratio
                        let width = img.width;
                        let height = img.height;
                        const maxSize = 800;
                        
                        if (width > height && width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        } else if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Convert to JPEG with 70% quality for smaller size
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        resolve(compressedDataUrl);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
        
        setupFileUpload('selfieInput', 'selfieUploadArea', 'selfiePreview', 'selfieImg', 'removeSelfie', 'selfieData');
        setupFileUpload('idInput', 'idUploadArea', 'idPreview', 'idImg', 'removeId', 'idDocData');
        setupFileUpload('porInput', 'porUploadArea', 'porPreview', 'porImg', 'removePor', 'porData');
        
        // Save & Exit
        kycSaveExit.addEventListener('click', async () => {
            saveKYCStepData();
            alert('Your progress has been saved. You can continue later.');
            closeKYCModal();
        });
        
        // Submit KYC
        kycSubmitBtn.addEventListener('click', async () => {
            if (!kycData.porData) {
                alert('Please upload proof of residence');
                return;
            }
            
            saveKYCStepData();
            
            kycSubmitBtn.disabled = true;
            kycSubmitBtn.textContent = 'Submitting...';
            
            try {
                const response = await fetch('/api/kyc/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionToken
                    },
                    body: JSON.stringify({
                        name: kycData.firstName,
                        surname: kycData.lastName,
                        id_number: kycData.idNumber,
                        date_of_birth: kycData.dob,
                        institution_name: kycData.institution,
                        institution_role: kycData.role,
                        student_staff_id: kycData.staffId,
                        selfie_url: kycData.selfieData,
                        id_document_url: kycData.idDocData,
                        proof_of_residence_url: kycData.porData
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.removeItem('kyc_draft');
                    alert('KYC verification submitted successfully!');
                    closeKYCModal();
                    
                    // Update user data and hide KYC banner
                    const user = JSON.parse(localStorage.getItem('educonnect_user') || '{}');
                    user.kyc_status = 'completed';
                    localStorage.setItem('educonnect_user', JSON.stringify(user));
                    
                    // Reload dashboard
                    loadDashboard();
                } else {
                    throw new Error(data.message || 'Failed to submit KYC');
                }
            } catch (error) {
                console.error('KYC submission error:', error);
                alert('Failed to submit KYC. Please try again.');
            } finally {
                kycSubmitBtn.disabled = false;
                kycSubmitBtn.textContent = 'Submit KYC';
            }
        });
        
        // Load dashboard on page load
        loadDashboard();
    </script>
</body>
</html>
  `)
})

// Main route - Login page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MTN EduConnect - Login</title>
        <style>
            @font-face {
                font-family: 'MTN Brighter Sans';
                src: url('/fonts/MTN_Brighter_Sans_Regular.ttf') format('truetype');
                font-weight: 400;
                font-style: normal;
            }
            @font-face {
                font-family: 'MTN Brighter Sans';
                src: url('/fonts/MTN_Brighter_Sans_Light.ttf') format('truetype');
                font-weight: 300;
                font-style: normal;
            }
            @font-face {
                font-family: 'MTN Brighter Sans';
                src: url('/fonts/MTN_Brighter_Sans_Bold.ttf') format('truetype');
                font-weight: 700;
                font-style: normal;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'MTN Brighter Sans', sans-serif;
                height: 100vh;
                overflow: hidden;
            }
            
            .login-container {
                display: flex;
                height: 100vh;
            }
            
            /* Left side - Hero section */
            .hero-section {
                flex: 1;
                /* Fallback gradient if image doesn't load */
                background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
                /* Overlay + hero image */
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), 
                            url('/assets/images/hero_image.png');
                background-size: cover;
                background-position: center;
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 4rem;
                color: white;
            }
            
            .hero-content h1 {
                font-size: 3rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
                line-height: 1.2;
            }
            
            .hero-content p {
                font-size: 1.125rem;
                font-weight: 300;
                line-height: 1.6;
                max-width: 600px;
            }
            
            /* Right side - Login form */
            .form-section {
                flex: 1;
                background: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 2rem;
            }
            
            .login-form-container {
                width: 100%;
                max-width: 400px;
            }
            
            .logo {
                width: 200px;
                margin-bottom: 3rem;
            }
            
            .form-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: #000;
                margin-bottom: 0.5rem;
            }
            
            .form-subtitle {
                font-size: 0.9rem;
                font-weight: 300;
                color: #666;
                margin-bottom: 2rem;
            }
            
            .toggle-container {
                display: flex;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .toggle-btn {
                flex: 1;
                padding: 0.75rem;
                border: 2px solid #e0e0e0;
                background: white;
                font-family: 'MTN Brighter Sans', sans-serif;
                font-size: 1rem;
                font-weight: 400;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.3s;
            }
            
            .toggle-btn.active {
                border-color: #FFCB00;
                background: #FFF9E6;
                font-weight: 700;
            }
            
            .toggle-btn:hover {
                border-color: #FFCB00;
            }
            
            .input-group {
                margin-bottom: 1.5rem;
            }
            
            .input-label {
                display: block;
                font-size: 0.9rem;
                font-weight: 400;
                color: #333;
                margin-bottom: 0.5rem;
            }
            
            .input-with-prefix {
                display: flex;
                gap: 0.5rem;
            }
            
            .country-code {
                padding: 0.875rem 1rem;
                border: 1px solid #d0d0d0;
                background: #f5f5f5;
                border-radius: 4px;
                font-family: 'MTN Brighter Sans', sans-serif;
                font-size: 1rem;
                min-width: 100px;
            }
            
            .form-input {
                flex: 1;
                padding: 0.875rem 1rem;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                font-family: 'MTN Brighter Sans', sans-serif;
                font-size: 1rem;
                transition: border-color 0.3s;
            }
            
            .form-input:focus {
                outline: none;
                border-color: #FFCB00;
            }
            
            .form-input::placeholder {
                color: #999;
                font-weight: 300;
            }
            
            .submit-btn {
                width: 100%;
                padding: 1rem;
                background: #FFCB00;
                border: none;
                border-radius: 4px;
                font-family: 'MTN Brighter Sans', sans-serif;
                font-size: 1rem;
                font-weight: 700;
                color: #000;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .submit-btn:hover {
                background: #E6B800;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .submit-btn:disabled {
                background: #e0e0e0;
                cursor: not-allowed;
                transform: none;
            }
            
            .error-message {
                display: none;
                background: #ffebee;
                color: #c62828;
                padding: 0.75rem;
                border-radius: 4px;
                margin-bottom: 1rem;
                font-size: 0.9rem;
            }
            
            .error-message.show {
                display: block;
            }
            
            .success-message {
                display: none;
                background: #e8f5e9;
                color: #2e7d32;
                padding: 0.75rem;
                border-radius: 4px;
                margin-bottom: 1rem;
                font-size: 0.9rem;
            }
            
            .success-message.show {
                display: block;
            }
            
            /* OTP Modal */
            .otp-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .otp-modal.show {
                display: flex;
            }
            
            .otp-modal-content {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            }
            
            .otp-modal-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: #000;
            }
            
            .otp-modal-subtitle {
                font-size: 0.9rem;
                font-weight: 300;
                color: #666;
                margin-bottom: 2rem;
            }
            
            .otp-input {
                width: 100%;
                padding: 0.875rem 1rem;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                font-family: 'MTN Brighter Sans', sans-serif;
                font-size: 1.5rem;
                letter-spacing: 0.5rem;
                text-align: center;
                margin-bottom: 1.5rem;
            }
            
            .otp-actions {
                display: flex;
                gap: 1rem;
            }
            
            .btn-secondary {
                flex: 1;
                padding: 0.875rem;
                background: #f5f5f5;
                border: 1px solid #d0d0d0;
                border-radius: 4px;
                font-family: 'MTN Brighter Sans', sans-serif;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-secondary:hover {
                background: #e0e0e0;
            }
            
            .btn-primary {
                flex: 2;
                padding: 0.875rem;
                background: #FFCB00;
                border: none;
                border-radius: 4px;
                font-family: 'MTN Brighter Sans', sans-serif;
                font-size: 1rem;
                font-weight: 700;
                color: #000;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .btn-primary:hover {
                background: #E6B800;
            }
            
            .btn-primary:disabled {
                background: #e0e0e0;
                cursor: not-allowed;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .login-container {
                    flex-direction: column;
                }
                
                .hero-section {
                    min-height: 30vh;
                    padding: 2rem;
                }
                
                .hero-content h1 {
                    font-size: 2rem;
                }
                
                .hero-content p {
                    font-size: 1rem;
                }
                
                .form-section {
                    min-height: 70vh;
                }
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="hero-content">
                    <h1>Empowering Education Through Connectivity</h1>
                    <p>MTN South Africa's comprehensive education solutions connecting learners, educators, and institutions with reliable, secure, and innovative connectivity services.</p>
                </div>
            </div>
            
            <!-- Login Form Section -->
            <div class="form-section">
                <div class="login-form-container">
                    <img src="/assets/logos/mtn_educonnect_logo.png" alt="MTN EduConnect" class="logo" onerror="this.style.display='none'">
                    
                    <h2 class="form-title">Welcome Back</h2>
                    <p class="form-subtitle">Sign in to access your education solutions</p>
                    
                    <div class="error-message" id="errorMessage"></div>
                    <div class="success-message" id="successMessage"></div>
                    
                    <!-- Login Method Toggle -->
                    <div class="toggle-container">
                        <button class="toggle-btn active" id="phoneToggle">Phone Number</button>
                        <button class="toggle-btn" id="emailToggle">Email Address</button>
                    </div>
                    
                    <!-- Login Form -->
                    <form id="loginForm">
                        <div class="input-group" id="phoneInputGroup">
                            <label class="input-label">Phone Number</label>
                            <div class="input-with-prefix">
                                <select class="country-code" id="countryCode">
                                    <option value="+27">ZA +27</option>
                                    <option value="+1">US +1</option>
                                    <option value="+44">UK +44</option>
                                </select>
                                <input 
                                    type="tel" 
                                    class="form-input" 
                                    id="phoneInput"
                                    placeholder="Enter your 9 or 10 digit phone number"
                                    maxlength="10"
                                >
                            </div>
                        </div>
                        
                        <div class="input-group" id="emailInputGroup" style="display: none;">
                            <label class="input-label">Email Address</label>
                            <input 
                                type="email" 
                                class="form-input" 
                                id="emailInput"
                                placeholder="Enter your email address"
                            >
                        </div>
                        
                        <button type="submit" class="submit-btn" id="submitBtn">Request OTP</button>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- OTP Modal -->
        <div class="otp-modal" id="otpModal">
            <div class="otp-modal-content">
                <h3 class="otp-modal-title">Enter OTP Code</h3>
                <p class="otp-modal-subtitle">We've sent a verification code to <span id="sentTo"></span></p>
                
                <div class="error-message" id="otpErrorMessage"></div>
                
                <input 
                    type="text" 
                    class="otp-input" 
                    id="otpInput"
                    placeholder="000000"
                    maxlength="6"
                    autocomplete="off"
                >
                
                <div class="otp-actions">
                    <button class="btn-secondary" id="cancelOtpBtn">Cancel</button>
                    <button class="btn-primary" id="verifyOtpBtn">Verify OTP</button>
                </div>
            </div>
        </div>
        
        <script>
            // State
            let loginMethod = 'phone';
            let currentPhoneOrEmail = '';
            
            // Elements
            const phoneToggle = document.getElementById('phoneToggle');
            const emailToggle = document.getElementById('emailToggle');
            const phoneInputGroup = document.getElementById('phoneInputGroup');
            const emailInputGroup = document.getElementById('emailInputGroup');
            const phoneInput = document.getElementById('phoneInput');
            const emailInput = document.getElementById('emailInput');
            const countryCode = document.getElementById('countryCode');
            const loginForm = document.getElementById('loginForm');
            const submitBtn = document.getElementById('submitBtn');
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            const otpModal = document.getElementById('otpModal');
            const otpInput = document.getElementById('otpInput');
            const sentTo = document.getElementById('sentTo');
            const cancelOtpBtn = document.getElementById('cancelOtpBtn');
            const verifyOtpBtn = document.getElementById('verifyOtpBtn');
            const otpErrorMessage = document.getElementById('otpErrorMessage');
            
            // Toggle between phone and email
            phoneToggle.addEventListener('click', () => {
                loginMethod = 'phone';
                phoneToggle.classList.add('active');
                emailToggle.classList.remove('active');
                phoneInputGroup.style.display = 'block';
                emailInputGroup.style.display = 'none';
                hideMessages();
            });
            
            emailToggle.addEventListener('click', () => {
                loginMethod = 'email';
                emailToggle.classList.add('active');
                phoneToggle.classList.remove('active');
                emailInputGroup.style.display = 'block';
                phoneInputGroup.style.display = 'none';
                hideMessages();
            });
            
            // Form submission
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                hideMessages();
                
                let phoneOrEmail = '';
                
                if (loginMethod === 'phone') {
                    const phone = phoneInput.value.trim();
                    if (!phone || phone.length < 9) {
                        showError('Please enter a valid phone number');
                        return;
                    }
                    phoneOrEmail = countryCode.value + phone;
                } else {
                    const email = emailInput.value.trim();
                    if (!email || !email.includes('@')) {
                        showError('Please enter a valid email address');
                        return;
                    }
                    phoneOrEmail = email;
                }
                
                currentPhoneOrEmail = phoneOrEmail;
                
                // Disable button
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending OTP...';
                
                try {
                    const response = await fetch('/api/auth/request-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phoneOrEmail, method: loginMethod })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        sentTo.textContent = phoneOrEmail;
                        otpModal.classList.add('show');
                        otpInput.focus();
                    } else {
                        showError(data.message || 'Failed to send OTP');
                    }
                } catch (error) {
                    showError('Network error. Please try again.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Request OTP';
                }
            });
            
            // OTP verification
            verifyOtpBtn.addEventListener('click', async () => {
                const otp = otpInput.value.trim();
                
                if (otp.length !== 6) {
                    showOtpError('Please enter a 6-digit OTP code');
                    return;
                }
                
                verifyOtpBtn.disabled = true;
                verifyOtpBtn.textContent = 'Verifying...';
                
                try {
                    const response = await fetch('/api/auth/verify-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            phoneOrEmail: currentPhoneOrEmail, 
                            otpCode: otp 
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Store session token
                        localStorage.setItem('educonnect_session', data.session_token);
                        localStorage.setItem('educonnect_user', JSON.stringify(data.user));
                        
                        // Redirect to dashboard
                        window.location.href = '/dashboard';
                    } else {
                        showOtpError(data.message || 'Invalid OTP code');
                    }
                } catch (error) {
                    showOtpError('Network error. Please try again.');
                } finally {
                    verifyOtpBtn.disabled = false;
                    verifyOtpBtn.textContent = 'Verify OTP';
                }
            });
            
            // Cancel OTP
            cancelOtpBtn.addEventListener('click', () => {
                otpModal.classList.remove('show');
                otpInput.value = '';
                hideOtpError();
            });
            
            // Auto-focus OTP input and allow Enter key
            otpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    verifyOtpBtn.click();
                }
            });
            
            // Helper functions
            function showError(message) {
                errorMessage.textContent = message;
                errorMessage.classList.add('show');
            }
            
            function showSuccess(message) {
                successMessage.textContent = message;
                successMessage.classList.add('show');
            }
            
            function hideMessages() {
                errorMessage.classList.remove('show');
                successMessage.classList.remove('show');
            }
            
            function showOtpError(message) {
                otpErrorMessage.textContent = message;
                otpErrorMessage.classList.add('show');
            }
            
            function hideOtpError() {
                otpErrorMessage.classList.remove('show');
            }
            
            // Close modal on outside click
            otpModal.addEventListener('click', (e) => {
                if (e.target === otpModal) {
                    cancelOtpBtn.click();
                }
            });
        </script>
    </body>
    </html>
  `)
})


export default app
