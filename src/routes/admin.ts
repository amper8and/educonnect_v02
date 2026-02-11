import { Hono } from 'hono'

type Bindings = {
  DB: D1Database;
}

const admin = new Hono<{ Bindings: Bindings }>()

// Middleware to check if user is admin
async function requireAdmin(c: any, next: any) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'No session token' }, 401)
  }
  
  const sessionToken = authHeader.substring(7)
  
  try {
    const user = await c.env.DB.prepare(`
      SELECT id, role FROM users WHERE session_token = ?
    `).bind(sessionToken).first()
    
    if (!user) {
      return c.json({ success: false, message: 'Invalid session' }, 401)
    }
    
    if (user.role !== 'admin') {
      return c.json({ success: false, message: 'Unauthorized - Admin only' }, 403)
    }
    
    c.set('userId', user.id)
    await next()
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ success: false, message: 'Authentication failed' }, 500)
  }
}

// Apply admin middleware to all routes
admin.use('*', requireAdmin)

// ====================
// WHITELIST MANAGEMENT
// ====================

// Get all whitelist entries
admin.get('/whitelist', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, phone, email, role, added_at, added_by
      FROM whitelist
      ORDER BY added_at DESC
    `).all()
    
    return c.json({ success: true, whitelist: results })
  } catch (error) {
    console.error('Load whitelist error:', error)
    return c.json({ success: false, message: 'Failed to load whitelist' }, 500)
  }
})

// Add whitelist entry
admin.post('/whitelist', async (c) => {
  try {
    const { phone, email, role } = await c.req.json()
    const userId = c.get('userId')
    
    // Validate input
    if (!phone && !email) {
      return c.json({ success: false, message: 'Phone or email required' }, 400)
    }
    
    if (!role || !['admin', 'account', 'customer'].includes(role)) {
      return c.json({ success: false, message: 'Invalid role' }, 400)
    }
    
    // Check if entry already exists
    const existing = await c.env.DB.prepare(`
      SELECT id FROM whitelist WHERE phone = ? OR email = ?
    `).bind(phone || null, email || null).first()
    
    if (existing) {
      return c.json({ success: false, message: 'Entry already exists' }, 400)
    }
    
    // Insert new entry
    await c.env.DB.prepare(`
      INSERT INTO whitelist (phone, email, role, added_by)
      VALUES (?, ?, ?, ?)
    `).bind(phone || null, email || null, role, userId).run()
    
    return c.json({ success: true, message: 'Entry added successfully' })
  } catch (error) {
    console.error('Add whitelist error:', error)
    return c.json({ success: false, message: 'Failed to add entry' }, 500)
  }
})

// Delete whitelist entry
admin.delete('/whitelist/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const result = await c.env.DB.prepare(`
      DELETE FROM whitelist WHERE id = ?
    `).bind(id).run()
    
    if (result.meta.changes === 0) {
      return c.json({ success: false, message: 'Entry not found' }, 404)
    }
    
    return c.json({ success: true, message: 'Entry removed successfully' })
  } catch (error) {
    console.error('Delete whitelist error:', error)
    return c.json({ success: false, message: 'Failed to remove entry' }, 500)
  }
})

// Export whitelist as CSV
admin.get('/whitelist/export', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT phone, email, role, added_at FROM whitelist ORDER BY added_at DESC
    `).all()
    
    // Generate CSV
    const csv = [
      'phone,email,role,added_at',
      ...results.map((r: any) => 
        `${r.phone || ''},${r.email || ''},${r.role},${r.added_at}`
      )
    ].join('\n')
    
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="whitelist.csv"'
      }
    })
  } catch (error) {
    console.error('Export whitelist error:', error)
    return c.json({ success: false, message: 'Export failed' }, 500)
  }
})

// Import whitelist from CSV
admin.post('/whitelist/import', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ success: false, message: 'No file provided' }, 400)
    }
    
    const text = await file.text()
    const lines = text.split('\n').slice(1) // Skip header
    const userId = c.get('userId')
    
    let imported = 0
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      const [phone, email, role] = line.split(',').map(s => s.trim())
      
      if (!role || !['admin', 'account', 'customer'].includes(role)) {
        continue
      }
      
      try {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO whitelist (phone, email, role, added_by)
          VALUES (?, ?, ?, ?)
        `).bind(phone || null, email || null, role, userId).run()
        
        imported++
      } catch (error) {
        console.error('Import row error:', error)
      }
    }
    
    return c.json({ success: true, imported, message: `${imported} entries imported` })
  } catch (error) {
    console.error('Import whitelist error:', error)
    return c.json({ success: false, message: 'Import failed' }, 500)
  }
})

// =======================
// SOLUTION LIBRARY MANAGEMENT
// =======================

// Get all library products
admin.get('/library', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM solution_library ORDER BY created_at DESC
    `).all()
    
    return c.json({ success: true, library: results })
  } catch (error) {
    console.error('Load library error:', error)
    return c.json({ success: false, message: 'Failed to load library' }, 500)
  }
})

// Add library product
admin.post('/library', async (c) => {
  try {
    const data = await c.req.json()
    
    const {
      solution, product,
      option1, option2, option3, option4, option5,
      price1, price2, price3, price4, price5,
      once_off, month_on_month,
      discount_6mth, discount_12mth, discount_24mth,
      discount_code, discount_percent
    } = data
    
    if (!solution || !product) {
      return c.json({ success: false, message: 'Solution and product are required' }, 400)
    }
    
    await c.env.DB.prepare(`
      INSERT INTO solution_library (
        solution, product,
        option1, option2, option3, option4, option5,
        price1, price2, price3, price4, price5,
        once_off, month_on_month,
        discount_6mth, discount_12mth, discount_24mth,
        discount_code, discount_percent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      solution, product,
      option1 || null, option2 || null, option3 || null, option4 || null, option5 || null,
      price1 || null, price2 || null, price3 || null, price4 || null, price5 || null,
      once_off || null, month_on_month || null,
      discount_6mth || null, discount_12mth || null, discount_24mth || null,
      discount_code || null, discount_percent || null
    ).run()
    
    return c.json({ success: true, message: 'Product added successfully' })
  } catch (error) {
    console.error('Add library error:', error)
    return c.json({ success: false, message: 'Failed to add product' }, 500)
  }
})

// Update library product
admin.put('/library/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    
    const {
      solution, product,
      option1, option2, option3, option4, option5,
      price1, price2, price3, price4, price5,
      once_off, month_on_month,
      discount_6mth, discount_12mth, discount_24mth,
      discount_code, discount_percent
    } = data
    
    const result = await c.env.DB.prepare(`
      UPDATE solution_library SET
        solution = ?, product = ?,
        option1 = ?, option2 = ?, option3 = ?, option4 = ?, option5 = ?,
        price1 = ?, price2 = ?, price3 = ?, price4 = ?, price5 = ?,
        once_off = ?, month_on_month = ?,
        discount_6mth = ?, discount_12mth = ?, discount_24mth = ?,
        discount_code = ?, discount_percent = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      solution, product,
      option1 || null, option2 || null, option3 || null, option4 || null, option5 || null,
      price1 || null, price2 || null, price3 || null, price4 || null, price5 || null,
      once_off || null, month_on_month || null,
      discount_6mth || null, discount_12mth || null, discount_24mth || null,
      discount_code || null, discount_percent || null,
      id
    ).run()
    
    if (result.meta.changes === 0) {
      return c.json({ success: false, message: 'Product not found' }, 404)
    }
    
    return c.json({ success: true, message: 'Product updated successfully' })
  } catch (error) {
    console.error('Update library error:', error)
    return c.json({ success: false, message: 'Failed to update product' }, 500)
  }
})

// Delete library product
admin.delete('/library/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const result = await c.env.DB.prepare(`
      DELETE FROM solution_library WHERE id = ?
    `).bind(id).run()
    
    if (result.meta.changes === 0) {
      return c.json({ success: false, message: 'Product not found' }, 404)
    }
    
    return c.json({ success: true, message: 'Product removed successfully' })
  } catch (error) {
    console.error('Delete library error:', error)
    return c.json({ success: false, message: 'Failed to remove product' }, 500)
  }
})

// Export library as CSV
admin.get('/library/export', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM solution_library ORDER BY created_at DESC
    `).all()
    
    // Generate CSV with all fields
    const headers = [
      'solution', 'product',
      'option1', 'option2', 'option3', 'option4', 'option5',
      'price1', 'price2', 'price3', 'price4', 'price5',
      'once_off', 'month_on_month',
      'discount_6mth', 'discount_12mth', 'discount_24mth',
      'discount_code', 'discount_percent'
    ]
    
    const csv = [
      headers.join(','),
      ...results.map((r: any) => 
        headers.map(h => r[h] || '').join(',')
      )
    ].join('\n')
    
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="solution_library.csv"'
      }
    })
  } catch (error) {
    console.error('Export library error:', error)
    return c.json({ success: false, message: 'Export failed' }, 500)
  }
})

// Import library from CSV
admin.post('/library/import', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ success: false, message: 'No file provided' }, 400)
    }
    
    const text = await file.text()
    const lines = text.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    let imported = 0
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      
      headers.forEach((h, idx) => {
        row[h] = values[idx] || null
      })
      
      if (!row.solution || !row.product) {
        continue
      }
      
      try {
        await c.env.DB.prepare(`
          INSERT INTO solution_library (
            solution, product,
            option1, option2, option3, option4, option5,
            price1, price2, price3, price4, price5,
            once_off, month_on_month,
            discount_6mth, discount_12mth, discount_24mth,
            discount_code, discount_percent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          row.solution, row.product,
          row.option1, row.option2, row.option3, row.option4, row.option5,
          row.price1, row.price2, row.price3, row.price4, row.price5,
          row.once_off, row.month_on_month,
          row.discount_6mth, row.discount_12mth, row.discount_24mth,
          row.discount_code, row.discount_percent
        ).run()
        
        imported++
      } catch (error) {
        console.error('Import row error:', error)
      }
    }
    
    return c.json({ success: true, imported, message: `${imported} products imported` })
  } catch (error) {
    console.error('Import library error:', error)
    return c.json({ success: false, message: 'Import failed' }, 500)
  }
})

export default admin
