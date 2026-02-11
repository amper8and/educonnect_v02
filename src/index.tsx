import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

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

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes placeholder (will be added in Delivery 3)
app.get('/api/*', (c) => {
  return c.json({ message: 'API endpoint not yet implemented' }, 501)
})

// Main route - will serve login page in Delivery 3
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MTN EduConnect V2.0</title>
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
            body {
                font-family: 'MTN Brighter Sans', sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #FFCB00;
            }
            .container {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #000000;
                margin-bottom: 1rem;
                font-weight: 700;
            }
            p {
                color: #333;
                font-weight: 300;
            }
            .status {
                margin-top: 1rem;
                padding: 1rem;
                background: #f5f5f5;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            .success {
                color: #00C853;
                font-weight: 700;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>MTN EduConnect V2.0</h1>
            <p>Delivery 1 Complete ✅</p>
            <div class="status">
                <p class="success">Project initialized successfully</p>
                <p>• Database schema created</p>
                <p>• Hono + Cloudflare Pages configured</p>
                <p>• MTN fonts loaded</p>
                <p>• Ready for Delivery 3: Login Development</p>
            </div>
        </div>
    </body>
    </html>
  `)
})

export default app
