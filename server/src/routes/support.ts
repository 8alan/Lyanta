import { Router, Request, Response } from 'express'
import { sendContactEmail } from '../services/email.js'

const router = Router()

router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, reportedUser } = req.body

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    if (message.length > 2000) {
      res.status(400).json({ error: 'Message too long' })
      return
    }

    await sendContactEmail(name, email, subject, message, reportedUser)
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

export default router