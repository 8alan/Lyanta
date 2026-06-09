import { Router, Request, Response } from 'express'
import { Webhook } from 'svix'
import prisma from '../db.js'

const router = Router()

router.post('/clerk', async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    res.status(500).json({ error: 'Webhook secret not configured' })
    return
  }

  const svix_id = req.headers['svix-id'] as string
  const svix_timestamp = req.headers['svix-timestamp'] as string
  const svix_signature = req.headers['svix-signature'] as string

  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.status(400).json({ error: 'Missing svix headers' })
    return
  }

  const payload = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook verification failed:', err)
    res.status(400).json({ error: 'Invalid webhook signature' })
    return
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const email = email_addresses?.[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    if (!email) {
      console.log('No email found in webhook payload, skipping user creation')
      res.json({ received: true })
      return
    }

    await prisma.user.upsert({
      where: { clerkId: id },
      update: { email, name },
      create: {
        clerkId: id,
        email,
        name,
        creditBalance: {
          create: { balance: 0 }
        }
      }
    })
  }

  res.json({ received: true })
})

export default router