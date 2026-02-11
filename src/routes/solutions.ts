import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const solutions = new Hono<{ Bindings: Bindings }>()

// Get user solutions
solutions.get('/', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, message: 'No session token' }, 401)
    }
    
    // Get user from session
    const user = await c.env.DB.prepare(`
      SELECT id FROM users WHERE session_token = ?
    `).bind(sessionToken).first()
    
    if (!user) {
      return c.json({ success: false, message: 'Invalid session' }, 401)
    }
    
    // Get user's solutions
    const results = await c.env.DB.prepare(`
      SELECT * FROM solutions WHERE user_id = ? ORDER BY created_at DESC
    `).bind(user.id).all()
    
    return c.json({
      success: true,
      solutions: results.results || []
    })
  } catch (error) {
    console.error('Get solutions error:', error)
    return c.json({ success: false, message: 'Failed to load solutions' }, 500)
  }
})

// Create solution
solutions.post('/', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!sessionToken) {
      return c.json({ success: false, message: 'No session token' }, 401)
    }
    
    const user = await c.env.DB.prepare(`
      SELECT id FROM users WHERE session_token = ?
    `).bind(sessionToken).first()
    
    if (!user) {
      return c.json({ success: false, message: 'Invalid session' }, 401)
    }
    
    const { solution_type, name, address, customer_name, configuration, price_once_off, price_monthly, term_months } = await c.req.json()
    
    const result = await c.env.DB.prepare(`
      INSERT INTO solutions (
        user_id, solution_type, name, address, customer_name, 
        configuration, price_once_off, price_monthly, term_months, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `).bind(
      user.id,
      solution_type,
      name,
      address,
      customer_name,
      JSON.stringify(configuration),
      price_once_off || 0,
      price_monthly || 0,
      term_months || 0
    ).run()
    
    return c.json({
      success: true,
      solution_id: result.meta.last_row_id
    })
  } catch (error) {
    console.error('Create solution error:', error)
    return c.json({ success: false, message: 'Failed to create solution' }, 500)
  }
})

export default solutions
