import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const router = Router()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// ── Test ──
router.get('/test', (req, res) => {
  res.json({ ok: true })
})

// ── Create Payment Intent (escrow for listing purchase) ──
router.post('/create-payment-intent', requireAuth, async (req: Request, res: Response) => {
  try {
    const { listingId } = req.body
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true, giftCard: true }
    })
    if (!listing) { res.status(404).json({ error: 'Listing not found' }); return }
    if (listing.status !== 'ACTIVE') { res.status(400).json({ error: 'Listing is not active' }); return }
    if (listing.userId === user.id) { res.status(400).json({ error: 'You cannot buy your own listing' }); return }
    if (!listing.buyNowPrice) { res.status(400).json({ error: 'Listing has no buy now price' }); return }

    const amount = Math.round(listing.buyNowPrice * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      capture_method: 'automatic',
      metadata: {
        listingId: listing.id,
        buyerId: user.id,
        sellerId: listing.userId,
        type: 'listing_purchase'
      }
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Stripe Connect: Create onboarding link for seller ──
router.post('/connect/onboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }

    let stripeAccountId = user.stripeAccountId

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            schedule: { interval: 'manual' }
          }
        },
        metadata: { userId: user.id }
      })
      stripeAccountId = account.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId }
      })
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.CLIENT_URL}/dashboard?onboarding=refresh`,
      return_url: `${process.env.CLIENT_URL}/dashboard?onboarding=complete`,
      type: 'account_onboarding',
    })

    res.json({ url: accountLink.url })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Check if seller has completed Connect onboarding ──
router.get('/connect/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }

    if (!user.stripeAccountId) {
      res.json({ connected: false })
      return
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId)
    const connected = account.details_submitted && !account.requirements?.currently_due?.length

    res.json({
      connected,
      detailsSubmitted: account.details_submitted,
      requirementsDue: account.requirements?.currently_due ?? []
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Buyer confirms they received card details → release funds to seller ──
router.post('/confirm-trade/:tradeId', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    // Fix 1: Cast tradeId to string to resolve string | string[] type error
    const tradeId = req.params.tradeId as string

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }

    // Fix 2: Include seller and listing relations
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        seller: true,
        listing: {
          include: {
            giftCard: true
          }
        }
      }
    })
    if (!trade) { res.status(404).json({ error: 'Trade not found' }); return }
    if (trade.buyerId !== user.id) { res.status(403).json({ error: 'Only the buyer can confirm' }); return }
    if (trade.status !== 'PENDING') { res.status(400).json({ error: 'Trade is not pending' }); return }

    // Fix 3: Narrow stripePaymentIntentId to string
    const paymentIntentId = trade.stripePaymentIntentId
    if (!paymentIntentId) { res.status(400).json({ error: 'No payment found for this trade' }); return }

    if (!trade.seller.stripeAccountId) { res.status(400).json({ error: 'Seller has not set up payouts' }); return }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const totalAmount = paymentIntent.amount

    const platformFeeAmount = Math.round(totalAmount * 0.05)
    const sellerAmount = totalAmount - platformFeeAmount

    const transfer = await stripe.transfers.create({
      amount: sellerAmount,
      currency: 'usd',
      destination: trade.seller.stripeAccountId,
      metadata: { tradeId, sellerId: trade.sellerId }
    })

    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: 'COMPLETED',
        stripeTransferId: transfer.id
      }
    })

    await prisma.listing.update({
      where: { id: trade.listingId },
      data: { status: 'COMPLETED' }
    })

    await prisma.giftCard.update({
      where: { id: trade.listing.giftCardId },
      data: { status: 'TRADED' }
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Seller requests a payout from their Connect balance ──
router.post('/connect/payout', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }
    if (!user.stripeAccountId) { res.status(400).json({ error: 'Payout account not set up' }); return }

    const balance = await stripe.balance.retrieve(
      {},
      { stripeAccount: user.stripeAccountId }
    )

    const available = balance.available.find(b => b.currency === 'usd')
    if (!available || available.amount < 100) {
      res.status(400).json({ error: 'Insufficient balance for payout' })
      return
    }

    const payout = await stripe.payouts.create(
      { amount: available.amount, currency: 'usd' },
      { stripeAccount: user.stripeAccountId }
    )

    await prisma.payout.create({
      data: {
        userId: user.id,
        amount: available.amount / 100,
        status: 'PROCESSING',
        method: 'ACH',
        destination: payout.destination as string
      }
    })

    res.json({ success: true, amount: available.amount / 100 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Stripe Identity verification ──
router.post('/verify-identity', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) { res.status(404).json({ error: 'User not found' }); return }

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
      create: { userId: user.id, status: 'PENDING', method: 'stripe_identity' }
    })

    res.json({ url: verificationSession.url })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ── Webhooks ──
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) { res.status(500).json({ error: 'Webhook secret not configured' }); return }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch {
    res.status(400).json({ error: 'Invalid webhook signature' }); return
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const { listingId, buyerId, sellerId, type } = paymentIntent.metadata

      if (type === 'listing_purchase') {
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          include: { giftCard: true }
        })
        if (!listing) break

        await prisma.trade.create({
          data: {
            listingId,
            sellerId,
            buyerId,
            tradeType: 'CASH',
            finalPrice: paymentIntent.amount / 100,
            status: 'PENDING',
            stripePaymentIntentId: paymentIntent.id
          }
        })

        await prisma.listing.update({
          where: { id: listingId },
          data: { status: 'RESERVED' }
        })

        await prisma.giftCard.update({
          where: { id: listing.giftCardId },
          data: { status: 'RESERVED' }
        })
      }

      if (type === 'credit_purchase') {
        const amount = paymentIntent.amount / 100
        const { userId } = paymentIntent.metadata
        await prisma.creditBalance.update({
          where: { userId },
          data: { balance: { increment: amount } }
        })
        await prisma.creditPurchase.create({
          data: { userId, amount, status: 'COMPLETED', method: 'ACH' }
        })
      }
      break
    }

    // Fix 4: correct Stripe event name for transfers
    case 'transfer.created': {
      const transfer = event.data.object as Stripe.Transfer
      const { tradeId, sellerId } = transfer.metadata
      if (tradeId && sellerId) {
        await prisma.payout.updateMany({
          where: { userId: sellerId },
          data: { status: 'COMPLETED' }
        })
      }
      break
    }

    case 'identity.verification_session.verified': {
      const session = event.data.object as Stripe.Identity.VerificationSession
      await prisma.userVerification.update({
        where: { userId: session.metadata.userId },
        data: { status: 'APPROVED', updatedAt: new Date() }
      })
      break
    }

    case 'identity.verification_session.requires_input': {
      const session = event.data.object as Stripe.Identity.VerificationSession
      await prisma.userVerification.update({
        where: { userId: session.metadata.userId },
        data: { status: 'REJECTED', updatedAt: new Date() }
      })
      break
    }
  }

  res.json({ received: true })
})

export default router