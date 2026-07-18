import { Router, Request, Response } from 'express'
import { Webhook } from 'svix'
import prisma from '../db.js'

const router = Router()

router.post('/clerk', async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in environment variables!')
    res.status(500).json({ error: 'Webhook secret not configured' })
    return
  }

  // Quick sanity check: Does the secret start with whsec_?
  if (!WEBHOOK_SECRET.startsWith('whsec_')) {
    console.error('Your CLERK_WEBHOOK_SECRET is invalid. It MUST start with "whsec_"!')
    res.status(500).json({ error: 'Invalid webhook secret format' })
    return
  }

  const svix_id = req.headers['svix-id'] as string
  const svix_timestamp = req.headers['svix-timestamp'] as string
  const svix_signature = req.headers['svix-signature'] as string

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers from Clerk')
    res.status(400).json({ error: 'Missing svix headers' })
    return
  }

  // FORCE the payload to be a string without altering Clerk's original formatting
  let payload: string
  if (Buffer.isBuffer(req.body)) {
    payload = req.body.toString('utf8')
  } else if (typeof req.body === 'string') {
    payload = req.body
  } else {
    // If we land here, Vercel/Express auto-parsed it and we are in danger
    console.warn('WARNING: req.body is an object. Webhook verification might fail.')
    payload = JSON.stringify(req.body)
  }

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: any

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook verification failed! The signature did not match.')
    console.error('Error details:', err)
    res.status(400).json({ error: 'Invalid webhook signature' })
    return
  }

  // If we get here, the signature was verified perfectly!
  console.log(`Webhook verified successfully! Event type: ${evt.type}`)

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const email = email_addresses?.[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    if (!email) {
      console.log('No email found in webhook payload, skipping user creation')
      res.json({ received: true })
      return
    }

    try {
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
      console.log(`Successfully created user ${email} in database!`)
    } catch (dbError) {
      console.error('Database error while saving user:', dbError)
      res.status(500).json({ error: 'Database error' })
      return
    }
  }

  res.json({ received: true })
})

export default router