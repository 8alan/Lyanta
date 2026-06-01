import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'

const router = Router()

// Create a listing after submitting a gift card
router.post('/create', requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      giftCardId,
      buyNowPrice,
      minAcceptPrice,
      acceptsExchange,
      preferredBrand,
      preferredMinValue
    } = req.body
    const clerkId = req.userId!

    if (!giftCardId || (!buyNowPrice && !acceptsExchange)) {
      res.status(400).json({ error: 'Must set a buy now price or accept exchanges' })
      return
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const giftCard = await prisma.giftCard.findFirst({
      where: { id: giftCardId, userId: user.id }
    })

    if (!giftCard) {
      res.status(404).json({ error: 'Gift card not found' })
      return
    }

    if (giftCard.status !== 'PENDING' && giftCard.status !== 'VERIFIED') {
      res.status(400).json({ error: 'Gift card is not available for listing' })
      return
    }

    const existingListing = await prisma.listing.findUnique({
      where: { giftCardId }
    })

    if (existingListing) {
      res.status(400).json({ error: 'A listing already exists for this card' })
      return
    }

    const listing = await prisma.listing.create({
      data: {
        userId: user.id,
        giftCardId,
        buyNowPrice: buyNowPrice ?? null,
        minAcceptPrice: minAcceptPrice ?? null,
        acceptsExchange: acceptsExchange ?? false,
        preferredBrand: preferredBrand ?? null,
        preferredMinValue: preferredMinValue ?? null,
        status: 'PENDING_VERIFICATION'
      }
    })

    res.status(201).json({ listing })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all active listings

router.get('/active', requireAuth, async (req: Request, res: Response) => {
  try {
    
    const brand = Array.isArray(req.query.brand) ? req.query.brand[0] : req.query.brand
    const search = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        userId: { not: user.id },
        giftCard: search
        ? { brand: { contains: search as string, mode: 'insensitive' as const} }
        : brand
        ? { brand: brand as string }
        : undefined
      },
      include: {
        giftCard: {
          select: { brand: true, faceValue: true }
        },
        user: {
          select: { username: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ listings })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get market rate for a brand
router.get('/market-rate/:brand', requireAuth, async (req: Request, res: Response) => {
  try {
    const { brand } = req.params

    const recentTrades = await prisma.trade.findMany({
      where: {
        status: 'COMPLETED',
        tradeType: 'CASH',
        listing: {
          giftCard: { brand }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        listing: {
          include: {
            giftCard: { select: { faceValue: true } }
          }
        }
      }
    })

    if (recentTrades.length === 0) {
      res.json({ marketRate: 0.90, hasHistory: false })
      return
    }

    const avgRate = recentTrades.reduce((sum: number, t: any) => {
      return sum + ((t.finalPrice ?? 0) / t.listing.giftCard.faceValue)
    }, 0) / recentTrades.length

    res.json({ marketRate: avgRate, hasHistory: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's own listings
router.get('/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const listings = await prisma.listing.findMany({
      where: { userId: user.id },
      include: {
        giftCard: { select: { brand: true, faceValue: true, status: true } },
        bids: { select: { id: true, status: true, bidType: true, cashAmount: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ listings })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get a single listing
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        giftCard: { select: { brand: true, faceValue: true } },
        user: { select: { username: true, name: true } },
        bids: {
          where: { status: 'PENDING' },
          select: { id: true, bidType: true, cashAmount: true, createdAt: true }
        }
      }
    })

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' })
      return
    }

    res.json({ listing })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Place a bid on a listing
router.post('/:id/bid', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { bidType, cashAmount, offeredCardId } = req.body
    const clerkId = req.userId!

    if (!bidType || !['CASH', 'EXCHANGE'].includes(bidType)) {
      res.status(400).json({ error: 'Invalid bid type' })
      return
    }

    if (bidType === 'CASH' && !cashAmount) {
      res.status(400).json({ error: 'Cash amount required for cash bids' })
      return
    }

    if (bidType === 'EXCHANGE' && !offeredCardId) {
      res.status(400).json({ error: 'Offered card required for exchange bids' })
      return
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { giftCard: true }
    })

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' })
      return
    }

    if (listing.status !== 'ACTIVE') {
      res.status(400).json({ error: 'This listing is no longer available' })
      return
    }

    if (listing.userId === user.id) {
      res.status(400).json({ error: 'You cannot bid on your own listing' })
      return
    }

    // Check minimum accept price
    if (bidType === 'CASH' && listing.minAcceptPrice && cashAmount < listing.minAcceptPrice) {
      res.status(400).json({ error: `Minimum bid is $${listing.minAcceptPrice}` })
      return
    }

    const bid = await prisma.bid.create({
      data: {
        listingId: id,
        bidderId: user.id,
        bidType,
        cashAmount: cashAmount ?? null,
        offeredCardId: offeredCardId ?? null,
        status: 'PENDING'
      }
    })

    // If bid matches buy now price, auto accept
    if (bidType === 'CASH' && listing.buyNowPrice && cashAmount >= listing.buyNowPrice) {
      await prisma.bid.update({ where: { id: bid.id }, data: { status: 'ACCEPTED' } })
      await prisma.listing.update({ where: { id }, data: { status: 'RESERVED' } })
      await prisma.trade.create({
        data: {
          listingId: id,
          bidId: bid.id,
          sellerId: listing.userId,
          buyerId: user.id,
          tradeType: 'CASH',
          finalPrice: cashAmount,
          status: 'PENDING'
        }
      })
      res.json({ bid, autoAccepted: true })
      return
    }

    res.status(201).json({ bid, autoAccepted: false })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Accept a bid
router.post('/:id/bids/:bidId/accept', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id, bidId } = req.params
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const listing = await prisma.listing.findUnique({ where: { id: id as string } })
    if (!listing || listing.userId !== user.id) {
      res.status(403).json({ error: 'Not authorized' })
      return
    }

    const bid = await prisma.bid.findUnique({ where: { id: bidId as string } })
    if (!bid || bid.listingId !== id) {
      res.status(404).json({ error: 'Bid not found' })
      return
    }

    await prisma.$transaction([
      prisma.bid.update({ where: { id: bidId as string }, data: { status: 'ACCEPTED' } }),
      prisma.listing.update({ where: { id: id as string }, data: { status: 'RESERVED' } }),
      prisma.trade.create({
        data: {
          listingId: id as string,
          bidId: bidId as string,
          sellerId: user.id,
          buyerId: bid.bidderId,
          tradeType: bid.bidType === 'CASH' ? 'CASH' : 'EXCHANGE',
          finalPrice: bid.cashAmount ?? null,
          status: 'PENDING'
        }
      })
    ])

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Reject a bid
router.post('/:id/bids/:bidId/reject', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id, bidId } = req.params
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const listing = await prisma.listing.findUnique({ where: { id: id as string } })
    if (!listing || listing.userId !== user.id) {
      res.status(403).json({ error: 'Not authorized' })
      return
    }

    await prisma.bid.update({
      where: { id: bidId as string },
      data: { status: 'REJECTED' }
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router