import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const orders = new Hono<{ Bindings: Bindings }>()

// Get user's orders
orders.get('/', async (c) => {
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
    
    const result = await c.env.DB.prepare(`
      SELECT 
        o.*,
        s.solution_type,
        s.name as solution_name,
        s.address,
        s.customer_name
      FROM orders o
      LEFT JOIN solutions s ON o.solution_id = s.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).bind(user.id).all()
    
    return c.json({
      success: true,
      orders: result.results || []
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return c.json({ success: false, message: 'Failed to get orders' }, 500)
  }
})

// Create order from solution
orders.post('/', async (c) => {
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
    
    const {
      solution_id,
      payment_method,
      amount_once_off,
      amount_monthly
    } = await c.req.json()
    
    // Validate solution belongs to user
    const solution = await c.env.DB.prepare(`
      SELECT id FROM solutions WHERE id = ? AND user_id = ?
    `).bind(solution_id, user.id).first()
    
    if (!solution) {
      return c.json({ success: false, message: 'Solution not found' }, 404)
    }
    
    // Generate order number (format: EDU-YYYY-NNNN)
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    const order_number = `EDU-${year}-${random}`
    
    // Create order
    const result = await c.env.DB.prepare(`
      INSERT INTO orders (
        solution_id,
        user_id,
        order_number,
        payment_method,
        payment_status,
        amount_once_off,
        amount_monthly
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
      solution_id,
      user.id,
      order_number,
      payment_method,
      amount_once_off || 0,
      amount_monthly || 0
    ).run()
    
    return c.json({
      success: true,
      message: 'Order created successfully',
      order_id: result.meta.last_row_id,
      order_number
    })
  } catch (error) {
    console.error('Create order error:', error)
    return c.json({ success: false, message: 'Failed to create order' }, 500)
  }
})

// Get order details
orders.get('/:id', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    const orderId = c.req.param('id')
    
    if (!sessionToken) {
      return c.json({ success: false, message: 'No session token' }, 401)
    }
    
    const user = await c.env.DB.prepare(`
      SELECT id FROM users WHERE session_token = ?
    `).bind(sessionToken).first()
    
    if (!user) {
      return c.json({ success: false, message: 'Invalid session' }, 401)
    }
    
    const order = await c.env.DB.prepare(`
      SELECT 
        o.*,
        s.solution_type,
        s.name as solution_name,
        s.address,
        s.customer_name,
        s.configuration
      FROM orders o
      LEFT JOIN solutions s ON o.solution_id = s.id
      WHERE o.id = ? AND o.user_id = ?
    `).bind(orderId, user.id).first()
    
    if (!order) {
      return c.json({ success: false, message: 'Order not found' }, 404)
    }
    
    return c.json({
      success: true,
      order
    })
  } catch (error) {
    console.error('Get order error:', error)
    return c.json({ success: false, message: 'Failed to get order' }, 500)
  }
})

// Process payment (Demo mode)
orders.post('/:id/payment', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
    const orderId = c.req.param('id')
    
    if (!sessionToken) {
      return c.json({ success: false, message: 'No session token' }, 401)
    }
    
    const user = await c.env.DB.prepare(`
      SELECT id FROM users WHERE session_token = ?
    `).bind(sessionToken).first()
    
    if (!user) {
      return c.json({ success: false, message: 'Invalid session' }, 401)
    }
    
    const { payment_method } = await c.req.json()
    
    // Verify order belongs to user
    const order = await c.env.DB.prepare(`
      SELECT id FROM orders WHERE id = ? AND user_id = ?
    `).bind(orderId, user.id).first()
    
    if (!order) {
      return c.json({ success: false, message: 'Order not found' }, 404)
    }
    
    // Demo mode: Auto-approve all payments
    await c.env.DB.prepare(`
      UPDATE orders 
      SET payment_status = 'completed',
          payment_method = ?,
          payment_date = datetime('now')
      WHERE id = ?
    `).bind(payment_method, orderId).run()
    
    // Update solution status to active
    await c.env.DB.prepare(`
      UPDATE solutions 
      SET status = 'active'
      WHERE id = (SELECT solution_id FROM orders WHERE id = ?)
    `).bind(orderId).run()
    
    return c.json({
      success: true,
      message: 'Payment processed successfully (Demo mode)',
      payment_status: 'completed'
    })
  } catch (error) {
    console.error('Payment error:', error)
    return c.json({ success: false, message: 'Failed to process payment' }, 500)
  }
})

export default orders
