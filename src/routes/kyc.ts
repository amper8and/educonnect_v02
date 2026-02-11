import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const kyc = new Hono<{ Bindings: Bindings }>()

// Submit KYC
kyc.post('/submit', async (c) => {
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
      name,
      surname,
      id_number,
      date_of_birth,
      institution_name,
      student_staff_id,
      institution_role,
      selfie_url,
      id_document_url,
      proof_of_residence_url
    } = await c.req.json()
    
    // Update user details
    await c.env.DB.prepare(`
      UPDATE users 
      SET name = ?, surname = ?, id_number = ?, date_of_birth = ?, kyc_status = 'completed'
      WHERE id = ?
    `).bind(name, surname, id_number, date_of_birth, user.id).run()
    
    // Insert KYC documents
    await c.env.DB.prepare(`
      INSERT INTO kyc_documents (
        user_id, institution_name, institution_role, student_staff_id,
        selfie_url, id_document_url, proof_of_residence_url, verification_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
    `).bind(
      user.id,
      institution_name,
      institution_role,
      student_staff_id,
      selfie_url,
      id_document_url,
      proof_of_residence_url
    ).run()
    
    return c.json({
      success: true,
      message: 'KYC submitted successfully'
    })
  } catch (error) {
    console.error('KYC submission error:', error)
    return c.json({ success: false, message: 'Failed to submit KYC' }, 500)
  }
})

export default kyc
