import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import solutions from './routes/solutions'
import kyc from './routes/kyc'
import dashboard from './routes/dashboard'
import admin from './routes/admin'
import orders from './routes/orders'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Static files are automatically served by Cloudflare Pages from dist/
// No serveStatic middleware needed - files in public/ are copied to dist/ during build
// and Cloudflare Pages serves them automatically at their paths (/icons/*, /fonts/*, /assets/*)

// Mount API routes
app.route('/api/auth', auth)
app.route('/api/solutions', solutions)
app.route('/api/kyc', kyc)
app.route('/api/dashboard', dashboard)
app.route('/api/admin', admin)
app.route('/api/orders', orders)

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
        
        /* Profile Modal */
        .profile-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 2000;
            overflow-y: auto;
            padding: 2rem;
        }
        
        .profile-modal.show {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .profile-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        .profile-modal-header {
            padding: 2rem;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .profile-modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #000;
        }
        
        .profile-close-btn {
            background: none;
            border: none;
            font-size: 2rem;
            color: #999;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .profile-close-btn:hover {
            color: #000;
        }
        
        .profile-modal-body {
            padding: 2rem;
        }
        
        .profile-section {
            margin-bottom: 2rem;
        }
        
        .profile-section h3 {
            font-size: 1.125rem;
            font-weight: 700;
            color: #000;
            margin-bottom: 1rem;
        }
        
        .profile-info-grid {
            display: grid;
            gap: 1rem;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background: #f5f5f5;
            border-radius: 6px;
        }
        
        .info-label {
            font-weight: 600;
            color: #666;
        }
        
        .info-value {
            font-weight: 600;
            color: #000;
        }
        
        .admin-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .btn-admin {
            padding: 1rem;
            background: #FFCB00;
            border: none;
            border-radius: 8px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-weight: 700;
            color: #000;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }
        
        .btn-admin:hover {
            background: #E6B800;
            transform: translateY(-2px);
        }
        
        .btn-icon {
            font-size: 1.5rem;
        }
        
        .profile-modal-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
        }
        
        .btn-logout {
            padding: 0.875rem 1.5rem;
            background: #f44336;
            border: none;
            border-radius: 6px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-weight: 700;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-logout:hover {
            background: #d32f2f;
        }
        
        /* Admin Modals */
        .admin-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 3000;
            overflow-y: auto;
            padding: 2rem;
        }
        
        .admin-modal.show {
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        
        .admin-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 1000px;
            width: 100%;
            margin: 2rem auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        .admin-modal-header {
            padding: 2rem;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .admin-modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #000;
        }
        
        .admin-close-btn {
            background: none;
            border: none;
            font-size: 2rem;
            color: #999;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .admin-close-btn:hover {
            color: #000;
        }
        
        .admin-modal-body {
            padding: 2rem;
        }
        
        .admin-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .import-export-group {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn-import, .btn-export {
            padding: 0.75rem 1.5rem;
            background: #4caf50;
            border: none;
            border-radius: 6px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-weight: 600;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-import:hover, .btn-export:hover {
            background: #45a049;
        }
        
        .btn-export {
            background: #2196f3;
        }
        
        .btn-export:hover {
            background: #1976d2;
        }
        
        .btn-add {
            padding: 0.75rem 1.5rem;
            background: #FFCB00;
            border: none;
            border-radius: 6px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-weight: 700;
            color: #000;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-add:hover {
            background: #E6B800;
        }
        
        .table-container {
            overflow-x: auto;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        
        .admin-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .admin-table thead {
            background: #f5f5f5;
        }
        
        .admin-table th {
            padding: 1rem;
            text-align: left;
            font-weight: 700;
            color: #000;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .admin-table td {
            padding: 1rem;
            border-bottom: 1px solid #f0f0f0;
            color: #333;
        }
        
        .admin-table tbody tr:hover {
            background: #f9f9f9;
        }
        
        .loading-row {
            text-align: center;
            color: #999;
            font-style: italic;
        }
        
        .btn-delete {
            padding: 0.5rem 1rem;
            background: #f44336;
            border: none;
            border-radius: 4px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-weight: 600;
            color: white;
            cursor: pointer;
            font-size: 0.875rem;
        }
        
        .btn-delete:hover {
            background: #d32f2f;
        }
        
        .btn-edit {
            padding: 0.5rem 1rem;
            background: #2196f3;
            border: none;
            border-radius: 4px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-weight: 600;
            color: white;
            cursor: pointer;
            font-size: 0.875rem;
            margin-right: 0.5rem;
        }
        
        .btn-edit:hover {
            background: #1976d2;
        }
        
        .admin-modal-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid #f0f0f0;
            display: flex;
            justify-content: flex-end;
        }
        
        .btn-action {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            font-family: 'MTN Brighter Sans', sans-serif;
            font-weight: 600;
            color: white;
            cursor: pointer;
            font-size: 0.875rem;
            margin-right: 0.5rem;
        }
        
        .role-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .role-badge.role-admin {
            background: #ffebee;
            color: #c62828;
        }
        
        .role-badge.role-account {
            background: #e3f2fd;
            color: #1565c0;
        }
        
        .role-badge.role-customer {
            background: #f3e5f5;
            color: #6a1b9a;
        }
        
        .error-row {
            text-align: center;
            color: #f44336;
            font-style: italic;
            padding: 2rem !important;
        }
        
        .empty-row {
            text-align: center;
            color: #999;
            font-style: italic;
            padding: 2rem !important;
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
    
    <!-- Profile Modal -->
    <div class="profile-modal" id="profileModal">
        <div class="profile-modal-content">
            <div class="profile-modal-header">
                <h2 class="profile-modal-title">Profile Settings</h2>
                <button class="profile-close-btn" id="profileCloseBtn">&times;</button>
            </div>
            
            <div class="profile-modal-body">
                <div class="profile-section">
                    <h3>Personal Information</h3>
                    <div class="profile-info-grid">
                        <div class="info-item">
                            <span class="info-label">Name:</span>
                            <span class="info-value" id="profileName">-</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span>
                            <span class="info-value" id="profilePhone">-</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value" id="profileEmail">-</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Role:</span>
                            <span class="info-value" id="profileRole">-</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">KYC Status:</span>
                            <span class="info-value" id="profileKYC">-</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section" id="adminSection" style="display: none;">
                    <h3>Admin Tools</h3>
                    <div class="admin-buttons">
                        <button class="btn-admin" id="btnManageWhitelist">
                            <span class="btn-icon">👥</span>
                            Manage Whitelist
                        </button>
                        <button class="btn-admin" id="btnManageLibrary">
                            <span class="btn-icon">📚</span>
                            Manage Solution Library
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="profile-modal-footer">
                <button class="btn-secondary" id="profileCloseBtn2">Close</button>
                <button class="btn-logout" id="btnLogout">Logout</button>
            </div>
        </div>
    </div>
    
    <!-- Whitelist Admin Modal -->
    <div class="admin-modal" id="whitelistModal">
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h2 class="admin-modal-title">Manage Whitelist</h2>
                <button class="admin-close-btn" id="whitelistCloseBtn">&times;</button>
            </div>
            
            <div class="admin-modal-body">
                <div class="admin-actions">
                    <div class="import-export-group">
                        <label class="btn-import">
                            <input type="file" id="whitelistImport" accept=".csv" style="display: none;">
                            📥 Import CSV
                        </label>
                        <button class="btn-export" id="whitelistExport">📤 Export CSV</button>
                    </div>
                    <button class="btn-add" id="btnAddWhitelist">+ Add Entry</button>
                </div>
                
                <div class="table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Added</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="whitelistTableBody">
                            <tr><td colspan="5" class="loading-row">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="admin-modal-footer">
                <button class="btn-secondary" id="whitelistCloseBtn2">Close</button>
            </div>
        </div>
    </div>
    
    <!-- Solution Library Admin Modal -->
    <div class="admin-modal" id="libraryModal">
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h2 class="admin-modal-title">Manage Solution Library</h2>
                <button class="admin-close-btn" id="libraryCloseBtn">&times;</button>
            </div>
            
            <div class="admin-modal-body">
                <div class="admin-actions">
                    <div class="import-export-group">
                        <label class="btn-import">
                            <input type="file" id="libraryImport" accept=".csv" style="display: none;">
                            📥 Import CSV
                        </label>
                        <button class="btn-export" id="libraryExport">📤 Export CSV</button>
                    </div>
                    <button class="btn-add" id="btnAddLibrary">+ Add Product</button>
                </div>
                
                <div class="table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Solution</th>
                                <th>Product</th>
                                <th>Price Range</th>
                                <th>Once-off</th>
                                <th>Monthly</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="libraryTableBody">
                            <tr><td colspan="6" class="loading-row">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="admin-modal-footer">
                <button class="btn-secondary" id="libraryCloseBtn2">Close</button>
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
            
            // Show/Hide KYC banner based on status
            const kycBanner = document.getElementById('kycBanner');
            if (user.kyc_status === 'pending') {
                kycBanner.classList.remove('hidden');
            } else {
                kycBanner.classList.add('hidden');
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
            openProfileModal();
        });
        
        document.getElementById('btnCreateSolution').addEventListener('click', () => {
            window.location.href = '/solution-builder';
        });
        
        document.getElementById('btnCompleteKYC').addEventListener('click', () => {
            openKYCModal();
        });
        
        function viewSolution(id) {
            // Navigate to solution builder with solution ID for editing
            window.location.href = \`/solution-builder?id=\${id}\`;
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
                const savedData = JSON.parse(draft);
                
                // Merge saved data with existing kycData (preserving image data)
                kycData = {
                    ...kycData,
                    ...savedData
                };
                
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
        
        // Profile Modal Logic
        const profileModal = document.getElementById('profileModal');
        const profileCloseBtn = document.getElementById('profileCloseBtn');
        const profileCloseBtn2 = document.getElementById('profileCloseBtn2');
        const btnLogout = document.getElementById('btnLogout');
        const btnManageWhitelist = document.getElementById('btnManageWhitelist');
        const btnManageLibrary = document.getElementById('btnManageLibrary');
        const adminSection = document.getElementById('adminSection');
        
        function openProfileModal() {
            // Load current user data
            const user = JSON.parse(localStorage.getItem('educonnect_user') || '{}');
            
            document.getElementById('profileName').textContent = user.name || '-';
            document.getElementById('profilePhone').textContent = user.phone || '-';
            document.getElementById('profileEmail').textContent = user.email || '-';
            document.getElementById('profileRole').textContent = (user.role || 'customer').toUpperCase();
            document.getElementById('profileKYC').textContent = (user.kyc_status || 'pending').toUpperCase();
            
            // Show admin section if user is admin
            if (user.role === 'admin') {
                adminSection.style.display = 'block';
            } else {
                adminSection.style.display = 'none';
            }
            
            profileModal.classList.add('show');
        }
        
        function closeProfileModal() {
            profileModal.classList.remove('show');
        }
        
        profileCloseBtn.addEventListener('click', closeProfileModal);
        profileCloseBtn2.addEventListener('click', closeProfileModal);
        
        // Logout handler
        btnLogout.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    // Call logout API
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + sessionToken
                        }
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }
                
                // Clear local storage
                localStorage.removeItem('educonnect_session');
                localStorage.removeItem('educonnect_user');
                
                // Redirect to login
                window.location.href = '/';
            }
        });
        
        // Admin modal handlers
        btnManageWhitelist.addEventListener('click', () => {
            closeProfileModal();
            openWhitelistModal();
        });
        
        btnManageLibrary.addEventListener('click', () => {
            closeProfileModal();
            openLibraryModal();
        });
        
        // Whitelist Admin Modal Logic
        const whitelistModal = document.getElementById('whitelistModal');
        const whitelistCloseBtn = document.getElementById('whitelistCloseBtn');
        const whitelistCloseBtn2 = document.getElementById('whitelistCloseBtn2');
        const btnAddWhitelist = document.getElementById('btnAddWhitelist');
        const whitelistExport = document.getElementById('whitelistExport');
        const whitelistImport = document.getElementById('whitelistImport');
        const whitelistTableBody = document.getElementById('whitelistTableBody');
        
        async function openWhitelistModal() {
            whitelistModal.classList.add('show');
            await loadWhitelistData();
        }
        
        function closeWhitelistModal() {
            whitelistModal.classList.remove('show');
        }
        
        async function loadWhitelistData() {
            try {
                whitelistTableBody.innerHTML = '<tr><td colspan="5" class="loading-row">Loading...</td></tr>';
                
                const response = await fetch('/api/admin/whitelist', {
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load whitelist');
                }
                
                const data = await response.json();
                
                if (data.success && data.whitelist) {
                    renderWhitelistTable(data.whitelist);
                } else {
                    whitelistTableBody.innerHTML = '<tr><td colspan="5" class="error-row">Failed to load whitelist</td></tr>';
                }
            } catch (error) {
                console.error('Load whitelist error:', error);
                whitelistTableBody.innerHTML = '<tr><td colspan="5" class="error-row">Error loading whitelist</td></tr>';
            }
        }
        
        function renderWhitelistTable(whitelist) {
            if (whitelist.length === 0) {
                whitelistTableBody.innerHTML = '<tr><td colspan="5" class="empty-row">No entries found</td></tr>';
                return;
            }
            
            whitelistTableBody.innerHTML = whitelist.map(entry => \`
                <tr>
                    <td>\${entry.phone || '-'}</td>
                    <td>\${entry.email || '-'}</td>
                    <td><span class="role-badge role-\${entry.role}">\${entry.role.toUpperCase()}</span></td>
                    <td>\${new Date(entry.added_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-action btn-delete" onclick="deleteWhitelistEntry(\${entry.id})">🗑️ Delete</button>
                    </td>
                </tr>
            \`).join('');
        }
        
        async function deleteWhitelistEntry(id) {
            if (!confirm('Are you sure you want to remove this entry?')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/admin/whitelist/\${id}\`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Entry removed successfully');
                    await loadWhitelistData();
                } else {
                    alert('Failed to remove entry: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Error removing entry');
            }
        }
        
        // Make deleteWhitelistEntry globally accessible
        window.deleteWhitelistEntry = deleteWhitelistEntry;
        
        btnAddWhitelist.addEventListener('click', () => {
            const phone = prompt('Enter phone number (with country code, e.g., +27821234567):');
            if (!phone) return;
            
            const email = prompt('Enter email address (optional):');
            const role = prompt('Enter role (admin/account/customer):');
            
            if (!role || !['admin', 'account', 'customer'].includes(role.toLowerCase())) {
                alert('Invalid role. Must be admin, account, or customer.');
                return;
            }
            
            addWhitelistEntry(phone, email, role.toLowerCase());
        });
        
        async function addWhitelistEntry(phone, email, role) {
            try {
                const response = await fetch('/api/admin/whitelist', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ phone, email, role })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Entry added successfully');
                    await loadWhitelistData();
                } else {
                    alert('Failed to add entry: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Add error:', error);
                alert('Error adding entry');
            }
        }
        
        whitelistCloseBtn.addEventListener('click', closeWhitelistModal);
        whitelistCloseBtn2.addEventListener('click', closeWhitelistModal);
        
        whitelistExport.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/admin/whitelist/export', {
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Export failed');
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'whitelist_' + new Date().toISOString().split('T')[0] + '.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Export error:', error);
                alert('Failed to export whitelist');
            }
        });
        
        whitelistImport.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await fetch('/api/admin/whitelist/import', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(\`Import successful: \${data.imported} entries added\`);
                    await loadWhitelistData();
                } else {
                    alert('Import failed: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing file');
            }
            
            e.target.value = '';
        });
        
        // Solution Library Admin Modal Logic
        const libraryModal = document.getElementById('libraryModal');
        const libraryCloseBtn = document.getElementById('libraryCloseBtn');
        const libraryCloseBtn2 = document.getElementById('libraryCloseBtn2');
        const btnAddLibrary = document.getElementById('btnAddLibrary');
        const libraryExport = document.getElementById('libraryExport');
        const libraryImport = document.getElementById('libraryImport');
        const libraryTableBody = document.getElementById('libraryTableBody');
        
        async function openLibraryModal() {
            libraryModal.classList.add('show');
            await loadLibraryData();
        }
        
        function closeLibraryModal() {
            libraryModal.classList.remove('show');
        }
        
        async function loadLibraryData() {
            try {
                libraryTableBody.innerHTML = '<tr><td colspan="6" class="loading-row">Loading...</td></tr>';
                
                const response = await fetch('/api/admin/library', {
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load library');
                }
                
                const data = await response.json();
                
                if (data.success && data.library) {
                    renderLibraryTable(data.library);
                } else {
                    libraryTableBody.innerHTML = '<tr><td colspan="6" class="error-row">Failed to load library</td></tr>';
                }
            } catch (error) {
                console.error('Load library error:', error);
                libraryTableBody.innerHTML = '<tr><td colspan="6" class="error-row">Error loading library</td></tr>';
            }
        }
        
        function renderLibraryTable(library) {
            if (library.length === 0) {
                libraryTableBody.innerHTML = '<tr><td colspan="6" class="empty-row">No products found</td></tr>';
                return;
            }
            
            libraryTableBody.innerHTML = library.map(product => {
                const prices = [];
                if (product.price1) prices.push('R' + product.price1);
                if (product.price2) prices.push('R' + product.price2);
                if (product.price3) prices.push('R' + product.price3);
                const priceRange = prices.length > 0 ? prices.join(' / ') : '-';
                
                return \`
                    <tr>
                        <td>\${product.solution}</td>
                        <td>\${product.product}</td>
                        <td>\${priceRange}</td>
                        <td>R\${product.once_off || 0}</td>
                        <td>R\${product.month_on_month || 0}</td>
                        <td>
                            <button class="btn-action btn-edit" onclick="editLibraryProduct(\${product.id})">✏️ Edit</button>
                            <button class="btn-action btn-delete" onclick="deleteLibraryProduct(\${product.id})">🗑️ Delete</button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }
        
        async function deleteLibraryProduct(id) {
            if (!confirm('Are you sure you want to remove this product?')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/admin/library/\${id}\`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Product removed successfully');
                    await loadLibraryData();
                } else {
                    alert('Failed to remove product: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Error removing product');
            }
        }
        
        function editLibraryProduct(id) {
            alert('Edit functionality coming soon! Product ID: ' + id);
        }
        
        // Make functions globally accessible
        window.deleteLibraryProduct = deleteLibraryProduct;
        window.editLibraryProduct = editLibraryProduct;
        
        btnAddLibrary.addEventListener('click', () => {
            alert('Add product form coming soon!');
        });
        
        libraryCloseBtn.addEventListener('click', closeLibraryModal);
        libraryCloseBtn2.addEventListener('click', closeLibraryModal);
        
        libraryExport.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/admin/library/export', {
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Export failed');
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'solution_library_' + new Date().toISOString().split('T')[0] + '.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Export error:', error);
                alert('Failed to export library');
            }
        });
        
        libraryImport.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await fetch('/api/admin/library/import', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + sessionToken
                    },
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert(\`Import successful: \${data.imported} products added\`);
                    await loadLibraryData();
                } else {
                    alert('Import failed: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing file');
            }
            
            e.target.value = '';
        });
        
        // Load dashboard on page load
        loadDashboard();
    </script>
</body>
</html>
  `)
})

// Solution Builder route - Single Page Design
app.get('/solution-builder', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solution Builder - MTN EduConnect</title>
        <style>
            @font-face {
                font-family: 'MTN Brighter Sans';
                src: url('/fonts/MTN_Brighter_Sans_Regular.ttf') format('truetype');
                font-weight: 400;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'MTN Brighter Sans', sans-serif;
                background: #f5f5f5;
                padding: 20px;
            }
            
            /* Header */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .back-button {
                display: flex;
                align-items: center;
                gap: 8px;
                background: white;
                border: 2px solid #000;
                border-radius: 8px;
                padding: 10px 20px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .back-button:hover {
                background: #FFCB00;
                transform: translateX(-4px);
            }
            
            .back-button svg {
                width: 20px;
                height: 20px;
            }
            
            .logo-title {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .logo {
                background: #FFCB00;
                padding: 10px 20px;
                font-weight: 700;
                font-size: 1.2rem;
            }
            
            .title {
                font-size: 1.5rem;
                font-weight: 700;
            }
            
            .total-indicator {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .total-label {
                font-size: 1rem;
            }
            
            .total-amount {
                background: white;
                border: 2px solid #000;
                border-radius: 50%;
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: 700;
            }
            
            /* Solution Type Selection */
            .solution-types {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .section-label {
                font-weight: 600;
                margin-bottom: 15px;
            }
            
            .types-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
            }
            
            .type-card {
                border: 3px solid #e0e0e0;
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                position: relative;
                transition: all 0.3s;
            }
            
            .type-card:hover {
                border-color: #FFCB00;
            }
            
            .type-card.selected {
                border-color: #FFCB00;
                background: #FFFEF5;
            }
            
            .type-radio {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 20px;
                height: 20px;
                border: 2px solid #ccc;
                border-radius: 50%;
            }
            
            .type-card.selected .type-radio {
                border-color: #FFCB00;
                background: #FFCB00;
            }
            
            .type-icon {
                width: 60px;
                height: 60px;
                background: #FFCB00;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 10px;
                overflow: hidden;
            }
            
            .type-icon img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            .type-name {
                font-weight: 700;
                margin-bottom: 5px;
            }
            
            .type-desc {
                font-size: 0.875rem;
                color: #666;
            }
            
            /* Address & Customer Section */
            .details-section {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .detail-field {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .field-icon {
                width: 40px;
                height: 40px;
                background: #FFCB00;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            
            .field-input {
                flex: 1;
                padding: 10px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 25px;
                font-family: inherit;
                font-size: 1rem;
            }
            
            .field-input:focus {
                outline: none;
                border-color: #FFCB00;
            }
            
            .availability {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 0.875rem;
            }
            
            .availability-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #00C853;
            }
            
            /* Product Selection Area */
            .products-section {
                display: grid;
                grid-template-columns: 1fr 350px;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .products-main {
                background: white;
                padding: 20px;
                border-radius: 8px;
            }
            
            /* Product Rows with Sliders */
            .product-row-slider {
                padding: 20px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .slider-name {
                font-weight: 700;
                margin-bottom: 8px;
                font-size: 0.95rem;
            }
            
            .slider-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                font-size: 0.75rem;
                color: #666;
            }
            
            .slider-label-left,
            .slider-label-center,
            .slider-label-right {
                flex: 1;
                text-align: center;
            }
            
            .slider-label-left {
                text-align: left;
                padding-left: 10px;
            }
            
            .slider-label-right {
                text-align: right;
                padding-right: 10px;
            }
            
            /* Custom Slider */
            .custom-slider {
                position: relative;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                margin: 0 10px;
            }
            
            .slider-track-line {
                position: absolute;
                left: 0;
                right: 0;
                top: 50%;
                height: 4px;
                background: #e0e0e0;
                border-radius: 2px;
                z-index: 1;
            }
            
            .slider-option {
                position: relative;
                z-index: 2;
                cursor: pointer;
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 8px;
            }
            
            .slider-option:first-child {
                justify-content: flex-start;
            }
            
            .slider-option:last-child {
                justify-content: flex-end;
            }
            
            .slider-circle {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: white;
                border: 3px solid #ccc;
                transition: all 0.2s ease;
            }
            
            .slider-option:hover .slider-circle {
                border-color: #FFCB00;
                transform: scale(1.1);
            }
            
            .slider-option.selected .slider-circle {
                background: #FFCB00;
                border-color: #FFCB00;
                box-shadow: 0 0 0 3px rgba(255, 203, 0, 0.2);
            }
            
            /* Product Rows with Radio Buttons */
            .product-row-radio {
                padding: 20px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .product-row-radio:last-child {
                border-bottom: none;
            }
            
            .product-row-radio .product-name {
                font-weight: 700;
                margin-bottom: 15px;
                font-size: 0.95rem;
            }
            
            .radio-options {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .radio-options-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin: 0 10px;
            }
            
            .radio-options-grid .option-selector {
                justify-content: flex-start;
            }
            
            .radio-options-grid .option-selector:nth-child(2) {
                justify-content: center;
            }
            
            .radio-options-grid .option-selector:nth-child(3) {
                justify-content: flex-end;
            }
            
            /* 4th child (myPanic) aligns left like 1st child in new row */
            .radio-options-grid .option-selector:nth-child(4) {
                justify-content: flex-start;
            }
            
            .product-row {
                padding: 15px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .product-row:last-child {
                border-bottom: none;
            }
            
            .product-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .product-name {
                font-weight: 700;
            }
            
            .product-options {
                display: flex;
                gap: 15px;
                align-items: center;
            }
            
            .option-group {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .option-selector {
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
            }
            
            .option-radio {
                width: 24px;
                height: 24px;
                border: 2px solid #ccc;
                border-radius: 50%;
                position: relative;
            }
            
            .option-selector.selected .option-radio {
                border-color: #FFCB00;
            }
            
            .option-selector.selected .option-radio::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                background: #FFCB00;
                border-radius: 50%;
            }
            
            .option-label {
                font-size: 0.875rem;
            }
            
            /* Key Features Panel */
            .features-panel {
                background: #FFFEF5;
                padding: 20px;
                border-radius: 8px;
                border: 2px solid #FFCB00;
            }
            
            .features-title {
                font-weight: 700;
                margin-bottom: 15px;
            }
            
            .feature-item {
                padding: 8px 0;
                font-size: 0.875rem;
                color: #666;
            }
            
            .feature-item::before {
                content: '•';
                color: #FFCB00;
                font-weight: 700;
                margin-right: 8px;
            }
            
            /* Chat Interface */
            .chat-section {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .chat-input-area {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .chat-input {
                flex: 1;
                padding: 15px;
                border: 2px solid #e0e0e0;
                border-radius: 25px;
                font-family: inherit;
                font-size: 1rem;
            }
            
            .chat-button {
                width: 50px;
                height: 50px;
                background: #FFCB00;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chat-button:hover {
                background: #E6B800;
            }
            
            /* Account Modal */
            .account-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.6);
                z-index: 1000;
                padding: 20px;
                overflow-y: auto;
            }
            
            .account-modal.show {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                max-width: 900px;
                width: 100%;
                padding: 30px;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
            }
            
            .summary-section {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .term-options {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                margin: 20px 0;
            }
            
            .term-btn {
                padding: 15px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                text-align: center;
            }
            
            .term-btn.selected {
                border-color: #FFCB00;
                background: #FFFEF5;
            }
            
            .term-label {
                font-weight: 700;
                margin-bottom: 5px;
            }
            
            .term-discount {
                font-size: 0.875rem;
                color: #00C853;
            }
            
            .action-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-top: 20px;
            }
            
            .btn {
                padding: 15px;
                border: none;
                border-radius: 25px;
                font-family: inherit;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
            }
            
            .btn-primary {
                background: #FFCB00;
                color: #000;
            }
            
            .btn-secondary {
                background: white;
                color: #000;
                border: 2px solid #000;
            }
            
            .btn-cancel {
                background: #f0f0f0;
                color: #666;
            }
            
            /* Usage Tab */
            .tab-buttons {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .tab-btn {
                padding: 10px 20px;
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            }
            
            .tab-btn.active {
                border-color: #FFCB00;
                background: #FFFEF5;
            }
            
            .usage-cards {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .usage-card {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
            }
            
            .usage-value {
                font-size: 2rem;
                font-weight: 700;
                color: #FFCB00;
            }
            
            .usage-label {
                font-size: 0.875rem;
                color: #666;
                margin-top: 5px;
            }
            
            .usage-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .usage-table th,
            .usage-table td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .usage-table th {
                background: #f9f9f9;
                font-weight: 600;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .header {
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .back-button {
                    order: -1;
                    width: 100%;
                    justify-content: center;
                }
                
                .back-button span {
                    display: inline;
                }
                
                .types-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .products-section {
                    grid-template-columns: 1fr;
                }
                
                .details-section {
                    flex-direction: column;
                }
                
                .term-options {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .total-amount {
                    width: 60px;
                    height: 60px;
                    font-size: 1.2rem;
                }
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <button class="back-button" id="backToDashboard" title="Back to Dashboard">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Dashboard</span>
            </button>
            <div class="logo-title">
                <div class="logo">EduConnect</div>
                <div class="title">Solution Builder</div>
            </div>
            <div class="total-indicator">
                <span class="total-label">Your total</span>
                <div class="total-amount" id="totalAmount">R0</div>
            </div>
        </div>
        
        <!-- Solution Type Selection -->
        <div class="solution-types">
            <div class="section-label">I need:</div>
            <div class="types-grid">
                <div class="type-card" data-type="EduStudent">
                    <div class="type-radio"></div>
                    <div class="type-icon"><img src="/icons/edustudent.png" alt="EduStudent"></div>
                    <div class="type-name">EduStudent</div>
                    <div class="type-desc">Student connectivity on the go</div>
                </div>
                <div class="type-card" data-type="EduFlex">
                    <div class="type-radio"></div>
                    <div class="type-icon"><img src="/icons/eduflex.png" alt="EduFlex"></div>
                    <div class="type-name">EduFlex</div>
                    <div class="type-desc">Student connectivity @ my accommodation</div>
                </div>
                <div class="type-card" data-type="EduSchool">
                    <div class="type-radio"></div>
                    <div class="type-icon"><img src="/icons/eduschool.png" alt="EduSchool"></div>
                    <div class="type-name">EduSchool</div>
                    <div class="type-desc">Always On productivity for education sites</div>
                </div>
                <div class="type-card" data-type="EduSafe">
                    <div class="type-radio"></div>
                    <div class="type-icon"><img src="/icons/edusafe.png" alt="EduSafe"></div>
                    <div class="type-name">EduSafe</div>
                    <div class="type-desc">Safety first student protection & monitoring</div>
                </div>
            </div>
        </div>
        
        <!-- Address & Customer Details -->
        <div class="details-section">
            <div class="section-label">For:</div>
            <div class="detail-field">
                <div class="field-icon"><img src="/icons/school.png" alt="Address" style="width: 100%; height: 100%; object-fit: contain;"></div>
                <input type="text" class="field-input" id="addressInput" placeholder="Address:">
            </div>
            <div class="detail-field">
                <div class="field-icon"><img src="/icons/person.png" alt="Customer" style="width: 100%; height: 100%; object-fit: contain;"></div>
                <input type="text" class="field-input" id="customerInput" placeholder="Customer:">
            </div>
            <div class="availability">
                <span>This service is available</span>
                <div class="availability-dot"></div>
                <div class="availability-dot" style="background: #FFC107;"></div>
                <div class="availability-dot" style="background: #e0e0e0;"></div>
            </div>
        </div>
        
        <!-- Product Selection & Features -->
        <div class="products-section">
            <div class="products-main">
                <div class="section-label">Setup as follows:</div>
                
                <!-- Prepaid Bundle with Slider -->
                <div class="product-row-slider">
                    <div class="slider-name">Prepaid bundle</div>
                    <div class="slider-header">
                        <span class="slider-label-left">5GB + 50mins</span>
                        <span class="slider-label-center">10GB + 100mins</span>
                        <span class="slider-label-right">25GB + 200mins</span>
                    </div>
                    <div class="custom-slider" data-product="prepaid" data-options='["5GB","10GB","25GB"]'>
                        <div class="slider-track-line"></div>
                        <div class="slider-option" data-index="0" data-value="5GB">
                            <div class="slider-circle"></div>
                        </div>
                        <div class="slider-option selected" data-index="1" data-value="10GB">
                            <div class="slider-circle"></div>
                        </div>
                        <div class="slider-option" data-index="2" data-value="25GB">
                            <div class="slider-circle"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Uncapped Wireless with Slider -->
                <div class="product-row-slider">
                    <div class="slider-name">Uncapped wireless</div>
                    <div class="slider-header">
                        <span class="slider-label-left">10Mbps</span>
                        <span class="slider-label-center">20Mbps</span>
                        <span class="slider-label-right">100Mbps</span>
                    </div>
                    <div class="custom-slider" data-product="wireless" data-options='["10Mbps","20Mbps","100Mbps"]'>
                        <div class="slider-track-line"></div>
                        <div class="slider-option" data-index="0" data-value="10Mbps">
                            <div class="slider-circle"></div>
                        </div>
                        <div class="slider-option selected" data-index="1" data-value="20Mbps">
                            <div class="slider-circle"></div>
                        </div>
                        <div class="slider-option" data-index="2" data-value="100Mbps">
                            <div class="slider-circle"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Uncapped Fibre with Slider -->
                <div class="product-row-slider">
                    <div class="slider-name">Uncapped fibre</div>
                    <div class="slider-header">
                        <span class="slider-label-left">50Mbps</span>
                        <span class="slider-label-center">200Mbps</span>
                        <span class="slider-label-right">500Mbps</span>
                    </div>
                    <div class="custom-slider" data-product="fibre" data-options='["50Mbps","200Mbps","500Mbps"]'>
                        <div class="slider-track-line"></div>
                        <div class="slider-option" data-index="0" data-value="50Mbps">
                            <div class="slider-circle"></div>
                        </div>
                        <div class="slider-option selected" data-index="1" data-value="200Mbps">
                            <div class="slider-circle"></div>
                        </div>
                        <div class="slider-option" data-index="2" data-value="500Mbps">
                            <div class="slider-circle"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Additional Services with Radio Buttons -->
                <div class="product-row-radio">
                    <div class="product-name">Additional Services</div>
                    <div class="radio-options-grid">
                        <div class="option-selector selected" data-product="services" data-value="ai-tutor">
                            <div class="option-radio"></div>
                            <span class="option-label">AI-Tutor & Market</span>
                        </div>
                        <div class="option-selector" data-product="services" data-value="apn">
                            <div class="option-radio"></div>
                            <span class="option-label">APN + Eagle Eye</span>
                        </div>
                        <div class="option-selector" data-product="services" data-value="firewall">
                            <div class="option-radio"></div>
                            <span class="option-label">Secure Firewall</span>
                        </div>
                    </div>
                </div>
                
                <!-- Security & Tracking with Radio Buttons -->
                <div class="product-row-radio">
                    <div class="product-name">Security & Tracking</div>
                    <div class="radio-options-grid">
                        <div class="option-selector" data-product="security" data-value="powerfleet-video">
                            <div class="option-radio"></div>
                            <span class="option-label">PowerFleet AI Video</span>
                        </div>
                        <div class="option-selector" data-product="security" data-value="powerfleet-dash">
                            <div class="option-radio"></div>
                            <span class="option-label">PowerFleet Dash Cam</span>
                        </div>
                        <div class="option-selector" data-product="security" data-value="mix-telematics">
                            <div class="option-radio"></div>
                            <span class="option-label">MiX Telematics</span>
                        </div>
                        <div class="option-selector" data-product="security" data-value="mypanic">
                            <div class="option-radio"></div>
                            <span class="option-label">myPanic App</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Key Features Panel -->
            <div class="features-panel">
                <div class="features-title">Key features:</div>
                <div class="feature-item">Zero-rated access to MTN school portal</div>
                <div class="feature-item">Free parent calls</div>
                <div class="feature-item">Additional education apps & services access</div>
            </div>
        </div>
        
        <!-- LLM Chat Interface -->
        <div class="chat-section">
            <div class="chat-input-area">
                <input type="text" class="chat-input" id="chatInput" placeholder="Ask me anything about your solution...">
                <button class="chat-button" id="chatSend">💬</button>
            </div>
        </div>
        
        <!-- Account Modal -->
        <div class="account-modal" id="accountModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Solution Summary</h2>
                    <button class="modal-close" id="modalClose">&times;</button>
                </div>
                
                <!-- Tabs -->
                <div class="tab-buttons">
                    <button class="tab-btn active" data-tab="overview">Overview</button>
                    <button class="tab-btn" data-tab="usage">Usage</button>
                </div>
                
                <!-- Overview Tab -->
                <div class="tab-content" id="overviewTab">
                    <div class="summary-section">
                        <div class="summary-row">
                            <span>Once off Setup Costs:</span>
                            <strong id="setupCost">R799</strong>
                        </div>
                        <div class="summary-row">
                            <span>Monthly Recurring Costs:</span>
                            <strong id="monthlyCost">R99/month</strong>
                        </div>
                    </div>
                    
                    <div class="section-label">Contract Term Options:</div>
                    <div class="term-options">
                        <div class="term-btn selected" data-term="0">
                            <div class="term-label">Month-to-month</div>
                            <div class="term-discount">No discount</div>
                        </div>
                        <div class="term-btn" data-term="6">
                            <div class="term-label">6 months</div>
                            <div class="term-discount">-5%</div>
                        </div>
                        <div class="term-btn" data-term="12">
                            <div class="term-label">12 months</div>
                            <div class="term-discount">-10%</div>
                        </div>
                        <div class="term-btn" data-term="24">
                            <div class="term-label">24 months</div>
                            <div class="term-discount">-20%</div>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="btnSave">Save</button>
                        <button class="btn btn-primary" id="btnBuyUpgrade">Buy / Upgrade</button>
                        <button class="btn btn-secondary" id="btnCreateOffer">Create Offer</button>
                        <button class="btn btn-cancel" id="btnCancel">Cancel</button>
                    </div>
                </div>
                
                <!-- Usage Tab -->
                <div class="tab-content" id="usageTab" style="display: none;">
                    <div class="usage-cards">
                        <div class="usage-card">
                            <div class="usage-value" id="dataUsage">25</div>
                            <div class="usage-label">Data (GB)</div>
                        </div>
                        <div class="usage-card">
                            <div class="usage-value" id="voiceUsage">78</div>
                            <div class="usage-label">Voice (mins)</div>
                        </div>
                        <div class="usage-card">
                            <div class="usage-value" id="smsUsage">0</div>
                            <div class="usage-label">SMS (msgs)</div>
                        </div>
                    </div>
                    
                    <div class="section-label">Recent Usage:</div>
                    <table class="usage-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Mobile (GB)</th>
                                <th>FWA (GB)</th>
                                <th>Fibre (GB)</th>
                                <th>Voice (mins)</th>
                                <th>SMS (msgs)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Feb 2026</td>
                                <td>25</td>
                                <td>104</td>
                                <td>0</td>
                                <td>78</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td>Jan 2026</td>
                                <td>82</td>
                                <td>238</td>
                                <td>0</td>
                                <td>94</td>
                                <td>0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <script>
            // Check session
            const sessionToken = localStorage.getItem('educonnect_session');
            if (!sessionToken) {
                window.location.href = '/';
            }
            
            // Check if editing existing solution
            const urlParams = new URLSearchParams(window.location.search);
            const solutionId = urlParams.get('id');
            let isEditMode = false;
            
            // Back to Dashboard button
            document.getElementById('backToDashboard').addEventListener('click', () => {
                if (confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
                    window.location.href = '/dashboard';
                }
            });
            
            // Builder state
            let builderData = {
                solutionType: '',
                address: '',
                customer: '',
                products: {
                    prepaid: '10GB',
                    wireless: '',
                    fibre: '',
                    services: [],  // Changed to array for multiple selections
                    security: []   // Changed to array for multiple selections
                },
                term: 0,
                pricing: {
                    setup: 0,      // Start at R0
                    monthly: 0     // Start at R0
                }
            };
            
            // Solution type selection
            document.querySelectorAll('.type-card').forEach(card => {
                card.addEventListener('click', function() {
                    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    builderData.solutionType = this.dataset.type;
                    
                    // Apply product visibility rules based on solution type
                    applyProductRules(builderData.solutionType);
                    updatePricing();
                });
            });
            
            // Apply product visibility rules
            function applyProductRules(solutionType) {
                // Get all product rows
                const prepaidRow = document.querySelector('[data-product="prepaid"]')?.closest('.product-row-slider');
                const wirelessRow = document.querySelector('[data-product="wireless"]')?.closest('.product-row-slider');
                const fibreRow = document.querySelector('[data-product="fibre"]')?.closest('.product-row-slider');
                const additionalServicesRow = document.querySelectorAll('.product-row-radio')[0];
                const securityRow = document.querySelectorAll('.product-row-radio')[1];
                
                // Get individual service options
                const aiTutor = document.querySelector('[data-value="ai-tutor"]');
                const apn = document.querySelector('[data-value="apn"]');
                const firewall = document.querySelector('[data-value="firewall"]');
                const powerfleetVideo = document.querySelector('[data-value="powerfleet-video"]');
                const powerfleetDash = document.querySelector('[data-value="powerfleet-dash"]');
                const mixTelematics = document.querySelector('[data-value="mix-telematics"]');
                const mypanic = document.querySelector('[data-value="mypanic"]');
                
                // Reset all to hidden/disabled
                [prepaidRow, wirelessRow, fibreRow, additionalServicesRow, securityRow].forEach(row => {
                    if (row) {
                        row.style.display = 'none';
                        row.style.opacity = '0.5';
                        row.style.pointerEvents = 'none';
                    }
                });
                
                // Hide all service options initially
                [aiTutor, apn, firewall, powerfleetVideo, powerfleetDash, mixTelematics, mypanic].forEach(opt => {
                    if (opt) {
                        opt.style.display = 'none';
                    }
                });
                
                // Apply rules based on solution type
                switch(solutionType) {
                    case 'EduStudent':
                        // Show: Prepaid bundle + AI-Tutor & Market
                        if (prepaidRow) {
                            prepaidRow.style.display = 'block';
                            prepaidRow.style.opacity = '1';
                            prepaidRow.style.pointerEvents = 'auto';
                        }
                        if (additionalServicesRow) {
                            additionalServicesRow.style.display = 'block';
                            additionalServicesRow.style.opacity = '1';
                            additionalServicesRow.style.pointerEvents = 'auto';
                        }
                        if (aiTutor) aiTutor.style.display = 'flex';
                        // Clear other product selections and their visual states
                        builderData.products.wireless = '';
                        builderData.products.fibre = '';
                        builderData.products.services = [];
                        builderData.products.security = [];
                        // Clear selected class from all options
                        document.querySelectorAll('.option-selector').forEach(opt => opt.classList.remove('selected'));
                        break;
                        
                    case 'EduFlex':
                        // Show: Uncapped wireless only
                        if (wirelessRow) {
                            wirelessRow.style.display = 'block';
                            wirelessRow.style.opacity = '1';
                            wirelessRow.style.pointerEvents = 'auto';
                        }
                        // Clear other product selections and their visual states
                        builderData.products.prepaid = '';
                        builderData.products.fibre = '';
                        builderData.products.services = [];
                        builderData.products.security = [];
                        // Clear selected class from all options
                        document.querySelectorAll('.option-selector').forEach(opt => opt.classList.remove('selected'));
                        break;
                        
                    case 'EduSchool':
                        // Show: Uncapped fibre + APN + Eagle Eye + Secure Firewall
                        if (fibreRow) {
                            fibreRow.style.display = 'block';
                            fibreRow.style.opacity = '1';
                            fibreRow.style.pointerEvents = 'auto';
                        }
                        if (additionalServicesRow) {
                            additionalServicesRow.style.display = 'block';
                            additionalServicesRow.style.opacity = '1';
                            additionalServicesRow.style.pointerEvents = 'auto';
                        }
                        if (apn) apn.style.display = 'flex';
                        if (firewall) firewall.style.display = 'flex';
                        // Clear other product selections and their visual states
                        builderData.products.prepaid = '';
                        builderData.products.wireless = '';
                        builderData.products.services = [];
                        builderData.products.security = [];
                        // Clear selected class from all options
                        document.querySelectorAll('.option-selector').forEach(opt => opt.classList.remove('selected'));
                        break;
                        
                    case 'EduSafe':
                        // Show: All security options
                        if (securityRow) {
                            securityRow.style.display = 'block';
                            securityRow.style.opacity = '1';
                            securityRow.style.pointerEvents = 'auto';
                        }
                        if (powerfleetVideo) powerfleetVideo.style.display = 'flex';
                        if (powerfleetDash) powerfleetDash.style.display = 'flex';
                        if (mixTelematics) mixTelematics.style.display = 'flex';
                        if (mypanic) mypanic.style.display = 'flex';
                        // Clear other product selections and their visual states
                        builderData.products.prepaid = '';
                        builderData.products.wireless = '';
                        builderData.products.fibre = '';
                        builderData.products.services = [];
                        // Clear selected class from all options
                        document.querySelectorAll('.option-selector').forEach(opt => opt.classList.remove('selected'));
                        break;
                        
                    default:
                        // Show all if no solution selected
                        [prepaidRow, wirelessRow, fibreRow, additionalServicesRow, securityRow].forEach(row => {
                            if (row) {
                                row.style.display = 'block';
                                row.style.opacity = '1';
                                row.style.pointerEvents = 'auto';
                            }
                        });
                        [aiTutor, apn, firewall, powerfleetVideo, powerfleetDash, mixTelematics, mypanic].forEach(opt => {
                            if (opt) opt.style.display = 'flex';
                        });
                }
            }
            
            // Load existing solution if editing
            async function loadSolution(id) {
                try {
                    const response = await fetch(\`/api/solutions/\${id}\`, {
                        headers: {
                            'Authorization': 'Bearer ' + sessionToken
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.success && data.solution) {
                        const solution = data.solution;
                        isEditMode = true;
                        
                        // Parse configuration JSON
                        const config = JSON.parse(solution.configuration);
                        
                        // Populate builderData
                        builderData.solutionType = solution.solution_type;
                        builderData.address = solution.address;
                        builderData.customer = solution.customer_name;
                        builderData.products = config;
                        builderData.term = solution.term_months || 0;
                        builderData.pricing = {
                            setup: solution.price_once_off,
                            monthly: solution.price_monthly
                        };
                        
                        // Populate UI
                        // 1. Select solution type card
                        document.querySelectorAll('.type-card').forEach(card => {
                            if (card.dataset.type === solution.solution_type) {
                                card.classList.add('selected');
                            }
                        });
                        
                        // 2. Apply product rules for this solution type
                        applyProductRules(solution.solution_type);
                        
                        // 3. Fill address and customer fields
                        document.getElementById('addressInput').value = solution.address || '';
                        document.getElementById('customerInput').value = solution.customer_name || '';
                        
                        // 4. Set slider values
                        if (config.prepaid) {
                            const prepaidSlider = document.querySelector('[data-product="prepaid"]');
                            if (prepaidSlider) {
                                const options = JSON.parse(prepaidSlider.dataset.options);
                                const index = options.indexOf(config.prepaid);
                                if (index >= 0) {
                                    prepaidSlider.querySelectorAll('.slider-option').forEach((opt, i) => {
                                        if (i === index) {
                                            opt.classList.add('selected');
                                        } else {
                                            opt.classList.remove('selected');
                                        }
                                    });
                                }
                            }
                        }
                        
                        if (config.wireless) {
                            const wirelessSlider = document.querySelector('[data-product="wireless"]');
                            if (wirelessSlider) {
                                const options = JSON.parse(wirelessSlider.dataset.options);
                                const index = options.indexOf(config.wireless);
                                if (index >= 0) {
                                    wirelessSlider.querySelectorAll('.slider-option').forEach((opt, i) => {
                                        if (i === index) {
                                            opt.classList.add('selected');
                                        } else {
                                            opt.classList.remove('selected');
                                        }
                                    });
                                }
                            }
                        }
                        
                        if (config.fibre) {
                            const fibreSlider = document.querySelector('[data-product="fibre"]');
                            if (fibreSlider) {
                                const options = JSON.parse(fibreSlider.dataset.options);
                                const index = options.indexOf(config.fibre);
                                if (index >= 0) {
                                    fibreSlider.querySelectorAll('.slider-option').forEach((opt, i) => {
                                        if (i === index) {
                                            opt.classList.add('selected');
                                        } else {
                                            opt.classList.remove('selected');
                                        }
                                    });
                                }
                            }
                        }
                        
                        // 5. Select service options (array-based)
                        if (Array.isArray(config.services)) {
                            config.services.forEach(service => {
                                const option = document.querySelector(\`[data-product="services"][data-value="\${service}"]\`);
                                if (option) option.classList.add('selected');
                            });
                        }
                        
                        // 6. Select security options (array-based)
                        if (Array.isArray(config.security)) {
                            config.security.forEach(security => {
                                const option = document.querySelector(\`[data-product="security"][data-value="\${security}"]\`);
                                if (option) option.classList.add('selected');
                            });
                        }
                        
                        // 7. Select term
                        document.querySelectorAll('.term-btn').forEach(btn => {
                            if (parseInt(btn.dataset.term) === builderData.term) {
                                btn.classList.add('selected');
                            } else {
                                btn.classList.remove('selected');
                            }
                        });
                        
                        // 8. Update pricing display
                        updatePricing();
                        
                        console.log('Solution loaded successfully', solution);
                    }
                } catch (error) {
                    console.error('Error loading solution:', error);
                    alert('Failed to load solution');
                }
            }
            
            // Initialize with no solution selected (show all)
            applyProductRules('');
            
            // Load solution if in edit mode
            if (solutionId) {
                loadSolution(solutionId);
            }
            
            // Product option selection (radio buttons - now independent toggles)
            document.querySelectorAll('.option-selector').forEach(option => {
                option.addEventListener('click', function() {
                    const product = this.dataset.product;
                    const value = this.dataset.value;
                    
                    // Toggle selection on/off (checkbox behavior, not radio)
                    if (this.classList.contains('selected')) {
                        // Deselect if already selected
                        this.classList.remove('selected');
                        
                        // Remove from builderData.products
                        if (!builderData.products[product]) {
                            builderData.products[product] = [];
                        }
                        if (Array.isArray(builderData.products[product])) {
                            builderData.products[product] = builderData.products[product].filter(v => v !== value);
                        } else {
                            builderData.products[product] = '';
                        }
                    } else {
                        // Select if not already selected
                        this.classList.add('selected');
                        
                        // Add to builderData.products (support multiple selections)
                        if (!builderData.products[product] || !Array.isArray(builderData.products[product])) {
                            builderData.products[product] = [];
                        }
                        builderData.products[product].push(value);
                    }
                    
                    updatePricing();
                });
            });
            
            // Product sliders (custom sliders with clickable circles)
            document.querySelectorAll('.custom-slider').forEach(slider => {
                const product = slider.dataset.product;
                const options = JSON.parse(slider.dataset.options);
                
                // Get all slider options
                const sliderOptions = slider.querySelectorAll('.slider-option');
                
                sliderOptions.forEach(option => {
                    option.addEventListener('click', function() {
                        // Remove selected class from all options in this slider
                        sliderOptions.forEach(opt => opt.classList.remove('selected'));
                        
                        // Add selected class to clicked option
                        this.classList.add('selected');
                        
                        // Update builder data
                        const value = this.dataset.value;
                        builderData.products[product] = value;
                        updatePricing();
                    });
                });
                
                // Initialize default value from selected option
                const selectedOption = slider.querySelector('.slider-option.selected');
                if (selectedOption) {
                    builderData.products[product] = selectedOption.dataset.value;
                }
            });
            
            // Address & Customer inputs
            document.getElementById('addressInput').addEventListener('input', (e) => {
                builderData.address = e.target.value;
            });
            
            document.getElementById('customerInput').addEventListener('input', (e) => {
                builderData.customer = e.target.value;
            });
            
            // Pricing data from solution_library.csv
            const pricingData = {
                'EduStudent': {
                    'Prepaid Bundle': {
                        '5GB': { monthly: 49, setup: 0 },
                        '10GB': { monthly: 99, setup: 0 },
                        '25GB': { monthly: 149, setup: 0 }
                    },
                    'AI-Tutor & Market': { monthly: 29, setup: 0 }
                },
                'EduFlex': {
                    'Uncapped Wireless': {
                        '10Mbps': { monthly: 249, setup: 499 },
                        '20Mbps': { monthly: 299, setup: 499 },
                        '100Mbps': { monthly: 349, setup: 499 }
                    }
                },
                'EduSchool': {
                    'Uncapped Fibre': {
                        '50Mbps': { monthly: 325, setup: 999 },
                        '200Mbps': { monthly: 425, setup: 999 },
                        '500Mbps': { monthly: 845, setup: 999 }
                    },
                    'APN + Eagle Eye': { monthly: 199, setup: 0 },
                    'Secure Firewall': { monthly: 599, setup: 0 }
                },
                'EduSafe': {
                    'PowerFleet AI Video': { monthly: 800, setup: 2500 },
                    'PowerFleet Dash Cam': { monthly: 600, setup: 200 },
                    'MiX Telematics': { monthly: 550, setup: 550 },
                    'myPanic App': { monthly: 0, setup: 0 }
                }
            };
            
            // Update pricing based on actual selections
            function updatePricing() {
                let monthly = 0;  // Start at R0
                let setup = 0;    // Start at R0
                
                const solutionType = builderData.solutionType;
                if (!solutionType || !pricingData[solutionType]) {
                    // No solution selected, show R0
                    builderData.pricing.monthly = 0;
                    builderData.pricing.setup = 0;
                    document.getElementById('totalAmount').textContent = 'R0';
                    document.getElementById('monthlyCost').textContent = 'R0/month';
                    document.getElementById('setupCost').textContent = 'R0';
                    return;
                }
                
                const solutionPricing = pricingData[solutionType];
                
                // Prepaid Bundle pricing
                if (builderData.products.prepaid && solutionPricing['Prepaid Bundle']) {
                    const option = builderData.products.prepaid;
                    if (solutionPricing['Prepaid Bundle'][option]) {
                        monthly += solutionPricing['Prepaid Bundle'][option].monthly;
                        setup += solutionPricing['Prepaid Bundle'][option].setup;
                    }
                }
                
                // Uncapped Wireless pricing
                if (builderData.products.wireless && solutionPricing['Uncapped Wireless']) {
                    const option = builderData.products.wireless;
                    if (solutionPricing['Uncapped Wireless'][option]) {
                        monthly += solutionPricing['Uncapped Wireless'][option].monthly;
                        setup += solutionPricing['Uncapped Wireless'][option].setup;
                    }
                }
                
                // Uncapped Fibre pricing
                if (builderData.products.fibre && solutionPricing['Uncapped Fibre']) {
                    const option = builderData.products.fibre;
                    if (solutionPricing['Uncapped Fibre'][option]) {
                        monthly += solutionPricing['Uncapped Fibre'][option].monthly;
                        setup += solutionPricing['Uncapped Fibre'][option].setup;
                    }
                }
                
                // Additional Services pricing (now array-based)
                if (Array.isArray(builderData.products.services)) {
                    builderData.products.services.forEach(service => {
                        // Map data-value to product name
                        const serviceMap = {
                            'ai-tutor': 'AI-Tutor & Market',
                            'apn': 'APN + Eagle Eye',
                            'firewall': 'Secure Firewall'
                        };
                        const serviceName = serviceMap[service];
                        if (serviceName && solutionPricing[serviceName]) {
                            monthly += solutionPricing[serviceName].monthly;
                            setup += solutionPricing[serviceName].setup;
                        }
                    });
                }
                
                // Security & Tracking pricing (now array-based)
                if (Array.isArray(builderData.products.security)) {
                    builderData.products.security.forEach(security => {
                        // Map data-value to product name
                        const securityMap = {
                            'powerfleet-video': 'PowerFleet AI Video',
                            'powerfleet-dash': 'PowerFleet Dash Cam',
                            'mix-telematics': 'MiX Telematics',
                            'mypanic': 'myPanic App'
                        };
                        const securityName = securityMap[security];
                        if (securityName && solutionPricing[securityName]) {
                            monthly += solutionPricing[securityName].monthly;
                            setup += solutionPricing[securityName].setup;
                        }
                    });
                }
                
                // Apply term discount (from CSV: -5%, -10%, -20%)
                let discount = 0;
                if (builderData.term === 6) discount = 0.05;
                if (builderData.term === 12) discount = 0.10;
                if (builderData.term === 24) discount = 0.20;
                
                monthly = Math.round(monthly * (1 - discount));
                
                builderData.pricing.monthly = monthly;
                builderData.pricing.setup = setup;
                
                document.getElementById('totalAmount').textContent = 'R' + monthly;
                document.getElementById('monthlyCost').textContent = 'R' + monthly + '/month';
                document.getElementById('setupCost').textContent = 'R' + setup;
            }
            
            // Modal controls
            document.getElementById('totalAmount').addEventListener('click', () => {
                document.getElementById('accountModal').classList.add('show');
            });
            
            document.getElementById('modalClose').addEventListener('click', () => {
                document.getElementById('accountModal').classList.remove('show');
            });
            
            document.getElementById('btnCancel').addEventListener('click', () => {
                document.getElementById('accountModal').classList.remove('show');
            });
            
            // Tab switching
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    document.getElementById('overviewTab').style.display = 'none';
                    document.getElementById('usageTab').style.display = 'none';
                    
                    if (this.dataset.tab === 'overview') {
                        document.getElementById('overviewTab').style.display = 'block';
                    } else {
                        document.getElementById('usageTab').style.display = 'block';
                    }
                });
            });
            
            // Term selection
            document.querySelectorAll('.term-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.term-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    builderData.term = parseInt(this.dataset.term);
                    updatePricing();
                });
            });
            
            // Save solution
            document.getElementById('btnSave').addEventListener('click', async () => {
                if (!builderData.solutionType) {
                    alert('Please select a solution type');
                    return;
                }
                
                try {
                    const response = await fetch('/api/solutions', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + sessionToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            solution_type: builderData.solutionType,
                            name: builderData.address || 'Unnamed Solution',
                            address: builderData.address || '',
                            customer_name: builderData.customer || 'Unknown Customer',
                            configuration: JSON.stringify(builderData.products),
                            price_once_off: builderData.pricing.setup,
                            price_monthly: builderData.pricing.monthly,
                            term_months: builderData.term
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('Solution saved successfully!');
                        document.getElementById('accountModal').classList.remove('show');
                    } else {
                        alert('Failed to save solution');
                    }
                } catch (error) {
                    console.error('Save error:', error);
                    alert('Error saving solution');
                }
            });
            
            // Buy/Upgrade - Create order and process payment (Demo mode)
            document.getElementById('btnBuyUpgrade').addEventListener('click', async () => {
                if (!builderData.solutionType) {
                    alert('Please select a solution type first');
                    return;
                }
                
                try {
                    // First, save the solution if not already saved
                    const solutionResponse = await fetch('/api/solutions', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + sessionToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            solution_type: builderData.solutionType,
                            name: builderData.address || 'Unnamed Solution',
                            address: builderData.address || '',
                            customer_name: builderData.customer || 'Unknown Customer',
                            configuration: JSON.stringify(builderData.products),
                            price_once_off: builderData.pricing.setup,
                            price_monthly: builderData.pricing.monthly,
                            term_months: builderData.term
                        })
                    });
                    
                    const solutionData = await solutionResponse.json();
                    
                    if (!solutionData.success) {
                        alert('Failed to save solution');
                        return;
                    }
                    
                    const solution_id = solutionData.solution_id;
                    
                    // Create order
                    const orderResponse = await fetch('/api/orders', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + sessionToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            solution_id,
                            payment_method: 'mobile_money', // Demo: default payment method
                            amount_once_off: builderData.pricing.setup,
                            amount_monthly: builderData.pricing.monthly
                        })
                    });
                    
                    const orderData = await orderResponse.json();
                    
                    if (!orderData.success) {
                        alert('Failed to create order');
                        return;
                    }
                    
                    const order_id = orderData.order_id;
                    const order_number = orderData.order_number;
                    
                    // Process payment (Demo mode - auto-approve)
                    const paymentResponse = await fetch(\`/api/orders/\${order_id}/payment\`, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + sessionToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            payment_method: 'mobile_money'
                        })
                    });
                    
                    const paymentData = await paymentResponse.json();
                    
                    if (paymentData.success) {
                        alert(\`🎉 Payment Successful!\\n\\nOrder Number: \${order_number}\\nSetup: R\${builderData.pricing.setup.toFixed(2)}\\nMonthly: R\${builderData.pricing.monthly.toFixed(2)}/month\\n\\n(Demo Mode - Payment auto-approved)\`);
                        document.getElementById('accountModal').classList.remove('show');
                        window.location.href = '/dashboard';
                    } else {
                        alert('Payment processing failed');
                    }
                } catch (error) {
                    console.error('Buy/Upgrade error:', error);
                    alert('Error processing order');
                }
            });
            
            // Create Offer
            document.getElementById('btnCreateOffer').addEventListener('click', () => {
                alert('Offer creation coming soon!');
            });
            
            // Chat functionality
            document.getElementById('chatSend').addEventListener('click', () => {
                const message = document.getElementById('chatInput').value;
                if (message.trim()) {
                    alert('LLM Chat integration coming in Delivery 7!\\nYour message: ' + message);
                    document.getElementById('chatInput').value = '';
                }
            });
            
            // Initialize pricing
            updatePricing();
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
