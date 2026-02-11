import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database
}

const auth = new Hono<{ Bindings: Bindings }>()

// Request OTP (Demo Mode)
auth.post('/request-otp', async (c) => {
  try {
    const { phoneOrEmail, method } = await c.req.json()

    if (!phoneOrEmail) {
      return c.json({ success: false, message: 'Phone or email required' }, 400)
    }

    // Demo mode: Always generate OTP code 123456
    const otpCode = '123456'
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    await c.env.DB.prepare(`
      INSERT INTO otp_codes (phone_or_email, otp_code, expires_at, verified)
      VALUES (?, ?, ?, 0)
    `).bind(phoneOrEmail, otpCode, expiresAt.toISOString()).run()

    // In demo mode, return the OTP code (in production, send via SMS/Email)
    return c.json({
      success: true,
      message: `OTP sent to ${phoneOrEmail}`,
      demo_otp: otpCode, // Demo mode only
      expires_in: 600 // seconds
    })
  } catch (error) {
    console.error('OTP request error:', error)
    return c.json({ success: false, message: 'Failed to send OTP' }, 500)
  }
})

// Verify OTP and Create Session
auth.post('/verify-otp', async (c) => {
  try {
    const { phoneOrEmail, otpCode } = await c.req.json()

    if (!phoneOrEmail || !otpCode) {
      return c.json({ success: false, message: 'Phone/email and OTP required' }, 400)
    }

    // Verify OTP
    const otpResult = await c.env.DB.prepare(`
      SELECT * FROM otp_codes 
      WHERE phone_or_email = ? 
      AND otp_code = ? 
      AND verified = 0 
      AND datetime(expires_at) > datetime('now')
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(phoneOrEmail, otpCode).first()

    if (!otpResult) {
      return c.json({ success: false, message: 'Invalid or expired OTP' }, 401)
    }

    // Mark OTP as verified
    await c.env.DB.prepare(`
      UPDATE otp_codes SET verified = 1 WHERE id = ?
    `).bind(otpResult.id).run()

    // Check if user exists
    let user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE phone = ? OR email = ?
    `).bind(phoneOrEmail, phoneOrEmail).first()

    // If user doesn't exist, create new user
    if (!user) {
      const isEmail = phoneOrEmail.includes('@')
      
      const result = await c.env.DB.prepare(`
        INSERT INTO users (phone, email, role, kyc_status)
        VALUES (?, ?, 'customer', 'pending')
      `).bind(
        isEmail ? null : phoneOrEmail,
        isEmail ? phoneOrEmail : null
      ).run()

      // Fetch the newly created user
      user = await c.env.DB.prepare(`
        SELECT * FROM users WHERE id = ?
      `).bind(result.meta.last_row_id).first()
    }

    // Check whitelist for role assignment
    const whitelist = await c.env.DB.prepare(`
      SELECT role FROM whitelist WHERE phone = ? OR email = ?
    `).bind(phoneOrEmail, phoneOrEmail).first()

    if (whitelist) {
      // Update user role from whitelist
      await c.env.DB.prepare(`
        UPDATE users SET role = ?, kyc_status = 'completed' WHERE id = ?
      `).bind(whitelist.role.toLowerCase(), user.id).run()

      // Refresh user data
      user = await c.env.DB.prepare(`
        SELECT * FROM users WHERE id = ?
      `).bind(user.id).first()
    }

    // Generate session token
    const sessionToken = crypto.randomUUID()
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Update user session
    await c.env.DB.prepare(`
      UPDATE users 
      SET session_token = ?, session_expires = ?, last_login = datetime('now')
      WHERE id = ?
    `).bind(sessionToken, sessionExpires.toISOString(), user.id).run()

    // Set session cookie
    setCookie(c, 'educonnect_session', sessionToken, {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      sameSite: 'Lax'
    })

    return c.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        kyc_status: user.kyc_status
      },
      session_token: sessionToken
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return c.json({ success: false, message: 'Failed to verify OTP' }, 500)
  }
})

// Logout
auth.post('/logout', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')

    if (sessionToken) {
      // Clear session from database
      await c.env.DB.prepare(`
        UPDATE users SET session_token = NULL, session_expires = NULL
        WHERE session_token = ?
      `).bind(sessionToken).run()
    }

    // Clear cookie
    setCookie(c, 'educonnect_session', '', {
      path: '/',
      maxAge: 0
    })

    return c.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ success: false, message: 'Logout failed' }, 500)
  }
})

// Check session
auth.get('/session', async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')

    if (!sessionToken) {
      return c.json({ success: false, message: 'No session found' }, 401)
    }

    const user = await c.env.DB.prepare(`
      SELECT id, phone, email, name, surname, role, kyc_status, preferences
      FROM users 
      WHERE session_token = ? 
      AND datetime(session_expires) > datetime('now')
    `).bind(sessionToken).first()

    if (!user) {
      return c.json({ success: false, message: 'Session expired' }, 401)
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
        kyc_status: user.kyc_status,
        preferences: user.preferences ? JSON.parse(user.preferences) : {}
      }
    })
  } catch (error) {
    console.error('Session check error:', error)
    return c.json({ success: false, message: 'Session check failed' }, 500)
  }
})

export default auth
