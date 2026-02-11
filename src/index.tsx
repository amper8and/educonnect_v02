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
            // TODO: Show KYC modal (Delivery 4)
            alert('KYC modal coming soon!');
        });
        
        function viewSolution(id) {
            // TODO: View solution details (Delivery 5)
            alert(\`Viewing solution \${id} - Details coming in Delivery 5!\`);
        }
        
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
