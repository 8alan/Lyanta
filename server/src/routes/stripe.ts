import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const router = Router()

console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

router.get('/test', (req, res) => {
  res.json({ ok: true })
})

router.post('/create-payment-intent', requireAuth, async (req: Request, res: Response) => {
  console.log('create-payment-intent hit', req.body)
  try {
    const { amount } = req.body
    const clerkId = req.userId!

    if (!amount || amount < 1 || amount > 10000) {
      res.status(400).json({ error: 'Amount must be between $1 and $10,000' })
      return
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        userId: user.id,
        clerkId,
        type: 'credit_purchase'
      }
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a Stripe Identity verification session
router.post('/verify-identity', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { userId: user.id, clerkId },
      options: {
        document: {
          allowed_types: ['driving_license', 'passport', 'id_card'],
          require_id_number: false,
          require_live_capture: true,
          require_matching_selfie: true,
        }
      },
      return_url: `${process.env.CLIENT_URL}/profile?verified=true`,
    })

    await prisma.userVerification.upsert({
      where: { userId: user.id },
      update: { status: 'PENDING', method: 'stripe_identity' },
      create: {
        userId: user.id,
        status: 'PENDING',
        method: 'stripe_identity'
      }
    })

    res.json({ url: verificationSession.url })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    res.status(500).json({ error: 'Webhook secret not configured' })
    return
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch {
    res.status(400).json({ error: 'Invalid webhook signature' })
    return
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const { userId, type } = paymentIntent.metadata

    if (type === 'credit_purchase') {
      const amount = paymentIntent.amount / 100

      await prisma.creditBalance.update({
        where: { userId },
        data: { balance: { increment: amount } }
      })

      await prisma.creditPurchase.create({
        data: {
          userId,
          amount,
          status: 'COMPLETED',
          method: 'ACH'
        }
      })
    }
  }

  if (event.type === 'identity.verification_session.verified') {
    const session = event.data.object as Stripe.Identity.VerificationSession
    const { userId } = session.metadata

    await prisma.userVerification.update({
      where: { userId },
      data: { status: 'APPROVED', updatedAt: new Date() }
    })
  }

  if (event.type === 'identity.verification_session.requires_input') {
    const session = event.data.object as Stripe.Identity.VerificationSession
    const { userId } = session.metadata

    await prisma.userVerification.update({
      where: { userId },
      data: { status: 'REJECTED', updatedAt: new Date() }
    })
  }

  res.json({ received: true })
})

// 1. Create a Stripe Connect account for a Seller
router.post('/connect/onboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const user = await prisma.user.findUnique({ where: { clerkId } })
    
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    let accountId = user.stripeAccountId

    // If the user doesn't have a Stripe Connect account yet, create one
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Adjust if you operate internationally
        email: user.email, // Assuming you have email on your user model
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      
      accountId = account.id
      
      // Save this ID to the database field we just added!
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId }
      })
    }

    // Generate the onboarding URL for them to fill out their bank info
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.CLIENT_URL}/profile?stripe_refresh=true`,
      return_url: `${process.env.CLIENT_URL}/profile?stripe_return=true`,
      type: 'account_onboarding',
    })

    res.json({ url: accountLink.url })
  } catch (error) {
    console.error('Error in connect/onboard:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 2. Buy a giftcard (Funds go to Escrow/Platform Balance)
router.post('/create-trade-payment-intent', requireAuth, async (req: Request, res: Response) => {
  try {
    const { amount, tradeId } = req.body
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
       res.status(404).json({ error: 'User not found' })
       return
    }

    // Create a PaymentIntent that sits in YOUR balance
    // The transfer_group links this payment to the future payout
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      transfer_group: `trade_${tradeId}`, 
      metadata: {
        userId: user.id,
        tradeId: tradeId,
        type: 'trade_escrow'
      }
    })

    // Save the paymentIntentId to your Trade database model
    await prisma.trade.update({
      where: { id: tradeId },
      data: { stripePaymentIntentId: paymentIntent.id }
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Error creating trade payment intent:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 3. Release Escrow to Seller
router.post('/release-escrow', requireAuth, async (req: Request, res: Response) => {
  try {
    const { tradeId } = req.body
    
    // Fetch the trade to get the finalPrice and the seller's info
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { seller: true } 
    })

    if (!trade || !trade.seller?.stripeAccountId) {
      res.status(400).json({ error: 'Trade or Seller Stripe Account not found' })
      return
    }

    // Since finalPrice is optional in the schema, we must ensure it exists for cash trades
    if (!trade.finalPrice) {
      res.status(400).json({ error: 'Trade does not have a final price' })
      return
    }

    // Optional: Calculate your platform fee here (e.g., you keep 5%)
    const platformFee = trade.finalPrice * 0.05 
    const payoutAmount = trade.finalPrice - platformFee

    // Transfer the money to the seller
    const transfer = await stripe.transfers.create({
      amount: Math.round(payoutAmount * 100),
      currency: 'usd',
      destination: trade.seller.stripeAccountId,
      transfer_group: `trade_${trade.id}`, // This must match the transfer_group from checkout!
    })

    // Update the trade in the database to show it was paid out
    await prisma.trade.update({
      where: { id: tradeId },
      data: { 
        stripeTransferId: transfer.id,
        status: 'COMPLETED' 
      }
    })

    res.json({ success: true, transferId: transfer.id })
  } catch (error) {
    console.error('Error releasing escrow:', error)
    res.status(500).json({ error: 'Failed to release funds' })
  }
})

export default router