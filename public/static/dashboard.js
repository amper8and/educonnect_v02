// Dashboard.js - MTN EduConnect Dashboard

// State
let currentUser = null;
let currentKYCStep = 1;
let kycData = {};
let uploadedFiles = {};

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
});

// Check user session
async function checkSession() {
    const sessionToken = localStorage.getItem('educonnect_session');
    const userStr = localStorage.getItem('educonnect_user');
    
    if (!sessionToken || !userStr) {
        window.location.href = '/';
        return;
    }
    
    try {
        const response = await fetch('/api/auth/session', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            localStorage.removeItem('educonnect_session');
            localStorage.removeItem('educonnect_user');
            window.location.href = '/';
            return;
        }
        
        currentUser = data.user;
        initDashboard();
    } catch (error) {
        console.error('Session check error:', error);
        window.location.href = '/';
    }
}

// Initialize dashboard
function initDashboard() {
    // Set user initials
    const initials = (currentUser.name || 'U').charAt(0).toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    
    // Show admin menu items if admin
    if (currentUser.role === 'admin') {
        document.getElementById('whitelistMenuItem').style.display = 'block';
        document.getElementById('libraryMenuItem').style.display = 'block';
    }
    
    // Check KYC status
    if (currentUser.kyc_status !== 'completed') {
        document.getElementById('kycBanner').style.display = 'flex';
    }
    
    // Load solutions
    loadSolutions();
}

// Toggle profile menu
document.getElementById('profileIcon').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('profileMenu');
    menu.classList.toggle('show');
});

// Close menu when clicking outside
document.addEventListener('click', () => {
    document.getElementById('profileMenu').classList.remove('show');
});

// Load user solutions
async function loadSolutions() {
    const container = document.getElementById('solutionsContainer');
    
    try {
        const sessionToken = localStorage.getItem('educonnect_session');
        const response = await fetch('/api/solutions', {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            container.innerHTML = '<p>Failed to load solutions</p>';
            return;
        }
        
        renderSolutions(data.solutions || []);
    } catch (error) {
        console.error('Load solutions error:', error);
        container.innerHTML = '<p>Error loading solutions</p>';
    }
}

// Render solutions grid
function renderSolutions(solutions) {
    const container = document.getElementById('solutionsContainer');
    container.className = 'solutions-grid';
    
    let html = '';
    
    // Create New Solution card
    html += `
        <div class="solution-card create-new" onclick="window.location.href='/solution-builder'">
            <div class="create-icon">+</div>
            <h3 style="font-weight: 700;">Create New Solution</h3>
            <p style="color: #666; margin-top: 0.5rem;">Build a new education solution</p>
        </div>
    `;
    
    // Existing solutions
    solutions.forEach(solution => {
        const config = typeof solution.configuration === 'string' 
            ? JSON.parse(solution.configuration) 
            : solution.configuration;
        
        const statusClass = solution.status === 'active' ? 'status-active' 
            : solution.status === 'cancelled' ? 'status-cancelled' 
            : 'status-draft';
        
        html += `
            <div class="solution-card" onclick="viewSolution(${solution.id})">
                <div class="card-header">
                    <div>
                        <div class="solution-type">${solution.solution_type}</div>
                        <h3 class="solution-name">${solution.name || 'Unnamed Solution'}</h3>
                    </div>
                    <span class="solution-status ${statusClass}">${solution.status}</span>
                </div>
                <div class="solution-details">
                    <p>${solution.address || 'No address provided'}</p>
                    <p>${solution.customer_name || ''}</p>
                </div>
                <div class="solution-price">
                    ${solution.price_once_off > 0 ? `<span class="price-badge">R ${solution.price_once_off.toFixed(2)} setup</span>` : ''}
                    ${solution.price_monthly > 0 ? `<span class="price-badge">R ${solution.price_monthly.toFixed(2)}/mo</span>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// View solution details
function viewSolution(solutionId) {
    window.location.href = `/solution-builder?id=${solutionId}`;
}

// Logout
async function logout() {
    const sessionToken = localStorage.getItem('educonnect_session');
    
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    localStorage.removeItem('educonnect_session');
    localStorage.removeItem('educonnect_user');
    window.location.href = '/';
}

// KYC Modal Functions
function openKYCModal() {
    document.getElementById('kycModal').classList.add('show');
}

function closeKYCModal() {
    document.getElementById('kycModal').classList.remove('show');
}

function nextKYCStep(step) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`kycStep${i}`).style.display = 'none';
        document.getElementById(`step${i}Indicator`).classList.remove('active');
        if (i < step) {
            document.getElementById(`step${i}Indicator`).classList.add('completed');
        } else {
            document.getElementById(`step${i}Indicator`).classList.remove('completed');
        }
    }
    
    // Show current step
    document.getElementById(`kycStep${step}`).style.display = 'block';
    document.getElementById(`step${step}Indicator`).classList.add('active');
    currentKYCStep = step;
}

async function submitKYC() {
    const sessionToken = localStorage.getItem('educonnect_session');
    
    // Collect KYC data
    const kycData = {
        name: document.getElementById('firstName').value,
        surname: document.getElementById('lastName').value,
        id_number: document.getElementById('idNumber').value,
        date_of_birth: document.getElementById('dob').value,
        institution_name: document.getElementById('institutionName').value,
        student_staff_id: document.getElementById('staffId').value,
        institution_role: document.getElementById('role').value,
        // In production, these would be actual file uploads
        selfie_url: uploadedFiles.selfie || 'demo_selfie.jpg',
        id_document_url: uploadedFiles.idDoc || 'demo_id.pdf',
        proof_of_residence_url: uploadedFiles.proofRes || 'demo_proof.pdf'
    };
    
    try {
        const response = await fetch('/api/kyc/submit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(kycData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('KYC submitted successfully! Your application is under review.');
            closeKYCModal();
            document.getElementById('kycBanner').style.display = 'none';
            
            // Update current user
            currentUser.kyc_status = 'completed';
            currentUser.name = kycData.name;
            currentUser.surname = kycData.surname;
            localStorage.setItem('educonnect_user', JSON.stringify(currentUser));
            
            // Reload dashboard
            initDashboard();
        } else {
            alert('Failed to submit KYC: ' + data.message);
        }
    } catch (error) {
        console.error('KYC submission error:', error);
        alert('Network error submitting KYC');
    }
}

function saveAndExitKYC() {
    // In production, save progress to backend
    closeKYCModal();
}

// File upload handler
function handleFileSelect(input, previewId) {
    const file = input.files[0];
    if (file) {
        const preview = document.getElementById(previewId);
        preview.textContent = `✅ ${file.name}`;
        
        // Store file reference (in production, upload to R2)
        const fileType = previewId.replace('Preview', '');
        uploadedFiles[fileType] = file.name;
    }
}

// Admin modal functions
function openWhitelistModal() {
    alert('Whitelist management will be available in next update');
}

function openLibraryModal() {
    alert('Solution library management will be available in next update');
}
