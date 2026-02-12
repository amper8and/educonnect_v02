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

// Get single solution by ID
solutions.get('/:id', async (c) => {
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
    
    const solutionId = c.req.param('id')
    
    // Get the specific solution for this user
    const solution = await c.env.DB.prepare(`
      SELECT * FROM solutions WHERE id = ? AND user_id = ?
    `).bind(solutionId, user.id).first()
    
    if (!solution) {
      return c.json({ success: false, message: 'Solution not found' }, 404)
    }
    
    return c.json({
      success: true,
      solution: solution
    })
  } catch (error) {
    console.error('Get solution error:', error)
    return c.json({ success: false, message: 'Failed to load solution' }, 500)
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
      configuration,  // Already a JSON string from frontend
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

// Update solution
solutions.put('/:id', async (c) => {
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
    
    const solutionId = c.req.param('id')
    
    // Check if solution exists and belongs to user
    const existingSolution = await c.env.DB.prepare(`
      SELECT id, user_id, status FROM solutions WHERE id = ?
    `).bind(solutionId).first()
    
    if (!existingSolution) {
      return c.json({ success: false, message: 'Solution not found' }, 404)
    }
    
    if (existingSolution.user_id !== user.id) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }
    
    const { solution_type, name, address, customer_name, configuration, price_once_off, price_monthly, term_months } = await c.req.json()
    
    // Update the solution
    await c.env.DB.prepare(`
      UPDATE solutions 
      SET solution_type = ?, 
          name = ?, 
          address = ?, 
          customer_name = ?, 
          configuration = ?, 
          price_once_off = ?, 
          price_monthly = ?, 
          term_months = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      solution_type,
      name,
      address,
      customer_name,
      configuration,  // Already a JSON string from frontend
      price_once_off || 0,
      price_monthly || 0,
      term_months || 0,
      solutionId
    ).run()
    
    return c.json({
      success: true,
      solution_id: solutionId
    })
  } catch (error) {
    console.error('Update solution error:', error)
    return c.json({ success: false, message: 'Failed to update solution' }, 500)
  }
})

// Delete solution
solutions.delete('/:id', async (c) => {
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
    
    const solutionId = c.req.param('id')
    
    // Get the solution to check ownership and status
    const solution = await c.env.DB.prepare(`
      SELECT id, user_id, status FROM solutions WHERE id = ?
    `).bind(solutionId).first()
    
    if (!solution) {
      return c.json({ success: false, message: 'Solution not found' }, 404)
    }
    
    // Verify ownership
    if (solution.user_id !== user.id) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }
    
    // Check if solution can be deleted (not active or offer)
    if (solution.status === 'active' || solution.status === 'offer') {
      return c.json({ 
        success: false, 
        message: 'Cannot delete active or pending offer solutions. Please contact support.' 
      }, 400)
    }
    
    // Delete the solution
    await c.env.DB.prepare(`
      DELETE FROM solutions WHERE id = ?
    `).bind(solutionId).run()
    
    return c.json({
      success: true,
      message: 'Solution deleted successfully'
    })
  } catch (error) {
    console.error('Delete solution error:', error)
    return c.json({ success: false, message: 'Failed to delete solution' }, 500)
  }
})

export default solutions
