import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const dashboard = new Hono<{ Bindings: Bindings }>()

// Get dashboard data (user info + solutions)
dashboard.get('/data', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, message: 'No session token' }, 401)
    }
    
    // Get user from session
    const user = await c.env.DB.prepare(`
      SELECT id, phone, email, name, surname, role, kyc_status 
      FROM users 
      WHERE session_token = ?
    `).bind(sessionToken).first()
    
    if (!user) {
      return c.json({ success: false, message: 'Invalid session' }, 401)
    }
    
    // Get user's solutions
    const solutions = await c.env.DB.prepare(`
      SELECT * FROM solutions WHERE user_id = ? ORDER BY created_at DESC
    `).bind(user.id).all()
    
    // Get solution library (for admins)
    let solutionLibrary = []
    if (user.role === 'admin') {
      const library = await c.env.DB.prepare(`
        SELECT * FROM solution_library ORDER BY solution, product
      `).all()
      solutionLibrary = library.results || []
    }
    
    // Get whitelist (for admins)
    let whitelist = []
    if (user.role === 'admin') {
      const wlist = await c.env.DB.prepare(`
        SELECT * FROM whitelist ORDER BY added_at DESC
      `).all()
      whitelist = wlist.results || []
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        kyc_status: user.kyc_status
      },
      solutions: solutions.results || [],
      solutionLibrary,
      whitelist
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return c.json({ success: false, message: 'Failed to load dashboard data' }, 500)
  }
})

export default dashboard
