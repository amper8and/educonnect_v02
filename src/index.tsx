import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import auth from './routes/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/assets/*', serveStatic({ root: './public' }))
app.use('/fonts/*', serveStatic({ root: './public' }))

// Mount auth routes
app.route('/api/auth', auth)

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
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

// Dashboard placeholder (will be built in Delivery 4)
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
                src: url('/fonts/MTN_Brighter_Sans_Bold.ttf') format('truetype');
                font-weight: 700;
            }
            body {
                font-family: 'MTN Brighter Sans', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #FFCB00;
                margin: 0;
            }
            .container {
                background: white;
                padding: 3rem;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            h1 {
                color: #000;
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            p {
                color: #666;
                margin-bottom: 2rem;
            }
            .btn {
                padding: 1rem 2rem;
                background: #000;
                color: #FFCB00;
                border: none;
                border-radius: 4px;
                font-family: 'MTN Brighter Sans', sans-serif;
                font-weight: 700;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }
            .user-info {
                background: #f5f5f5;
                padding: 1rem;
                border-radius: 4px;
                margin-bottom: 2rem;
                text-align: left;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>✅ Login Successful!</h1>
            <p>Dashboard will be built in Delivery 4</p>
            <div class="user-info" id="userInfo"></div>
            <a href="/" class="btn" onclick="logout(event)">Logout</a>
        </div>
        
        <script>
            const user = JSON.parse(localStorage.getItem('educonnect_user') || '{}');
            const userInfoDiv = document.getElementById('userInfo');
            
            userInfoDiv.innerHTML = \`
                <strong>User Details:</strong><br>
                ID: \${user.id}<br>
                Phone: \${user.phone || 'N/A'}<br>
                Email: \${user.email || 'N/A'}<br>
                Role: \${user.role}<br>
                KYC Status: \${user.kyc_status}
            \`;
            
            async function logout(e) {
                e.preventDefault();
                const token = localStorage.getItem('educonnect_session');
                
                try {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }
                
                localStorage.removeItem('educonnect_session');
                localStorage.removeItem('educonnect_user');
                window.location.href = '/';
            }
        </script>
    </body>
    </html>
  `)
})

export default app
