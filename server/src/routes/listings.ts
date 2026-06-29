import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'
import { decrypt } from '../services/encryption.js'
import { sendBidReceivedEmail, sendBidAcceptedEmail, sendBidRejectedEmail, sendCardDetailsEmail } from '../services/email.js'

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

    const allowedStatuses = ['PENDING', 'VERIFIED', 'AVAILABLE']
    if (!allowedStatuses.includes(giftCard.status)) {
      res.status(400).json({ error: 'This gift card cannot be listed' })
      return
    }

    if (giftCard.status === 'TRADED' || giftCard.status === 'CASHED_OUT') {
      res.status(400).json({ error: 'This gift card has already been sold' })
      return
    }
    const existingListing = await prisma.listing.findFirst({
      where: { 
        giftCardId,
        status: { not: 'CANCELLED' }
      }
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

// Get earnings for the past 90 days
  router.get('/my/earnings', requireAuth, async (req: Request, res: Response) => {
    try {
      const clerkId = req.userId!

      const user = await prisma.user.findUnique({ where: { clerkId } })
      if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
      }

      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const trades = await prisma.trade.findMany({
        where: {
          sellerId: user.id,
          status: 'COMPLETED',
          tradeType: 'CASH',
          createdAt: { gte: ninetyDaysAgo }
        }
      })

      const total = trades.reduce((sum, t) => sum + (t.finalPrice ?? 0), 0)

      res.json({ total })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })

  // Get top selling card brands
  router.get('/my/top-cards', async (req: Request, res: Response) => {
    try {
      const trades = await prisma.trade.findMany({
        where: { status: 'COMPLETED' },
        include: {
          listing: {
            include: {
              giftCard: { select: { brand: true } }
            }
          }
        }
      })

      const brandCounts: Record<string, number> = {}
      for (const trade of trades) {
        const brand = trade.listing.giftCard.brand
        brandCounts[brand] = (brandCounts[brand] ?? 0) + 1
      }

      const topCards = Object.entries(brandCounts)
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      res.json({ topCards })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
  })


// Edit a listing
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { buyNowPrice, minAcceptPrice, acceptsExchange, preferredBrand, preferredMinValue } = req.body
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing || listing.userId !== user.id) {
      res.status(403).json({ error: 'Not authorized' })
      return
    }

    if (listing.status !== 'ACTIVE' && listing.status !== 'PENDING_VERIFICATION') {
      res.status(400).json({ error: 'This listing cannot be edited' })
      return
    }
      
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        buyNowPrice: buyNowPrice ?? listing.buyNowPrice,
        minAcceptPrice: minAcceptPrice ?? listing.minAcceptPrice,
        acceptsExchange: acceptsExchange ?? listing.acceptsExchange,
        preferredBrand: preferredBrand ?? listing.preferredBrand,
        preferredMinValue: preferredMinValue ?? listing.preferredMinValue,
      }
    })

    res.json({ listing: updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Cancel a listing
router.post('/:id/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { bids: { where: { status: 'PENDING' } } }
    })

    if (!listing || listing.userId !== user.id) {
      res.status(403).json({ error: 'Not authorized' })
      return
    }

    if (listing.status !== 'ACTIVE' && listing.status !== 'PENDING_VERIFICATION') {
      res.status(400).json({ error: 'This listing cannot be cancelled' })
      return
    }

    await prisma.$transaction(async (tx) => {
      // Reject all pending bids
      await tx.bid.updateMany({
      where: { listingId: id, status: 'PENDING' },
      data: { status: 'CANCELLED' }
    })
      // Cancel the listing
      await tx.listing.update({
        where: { id },
        data: { status: 'CANCELLED' }
      })
      // Return gift card to available
      await tx.giftCard.update({
        where: { id: listing.giftCardId },
        data: { status: 'AVAILABLE' }
      })
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
// Get all active listings
// Get card details for a completed trade (buyer only, one-time reveal)
router.get('/:id/card-details', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const trade = await prisma.trade.findFirst({
      where: {
        listingId: id,
        buyerId: user.id,
        status: { in: ['PENDING', 'COMPLETED'] }
      },
      include: {
        listing: {
          include: {
            giftCard: true
          }
        },
        seller: { select: { email: true, name: true } }
      }
    })

    if (!trade) {
      res.status(403).json({ error: 'Not authorized to view these card details' })
      return
    }

    const giftCard = trade.listing.giftCard

    const cardDetails = {
      brand: giftCard.brand,
      cardNumber: decrypt(giftCard.cardNumber),
      pin: decrypt(giftCard.pin),
      faceValue: giftCard.faceValue,
      description: giftCard.description
    }

    // Mark as revealed and complete the trade
    await prisma.$transaction([
      prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { revealed: true, status: 'TRADED' }
      }),
      prisma.trade.update({
        where: { id: trade.id },
        data: { status: 'COMPLETED' }
      }),
      prisma.listing.update({
        where: { id },
        data: { status: 'COMPLETED' }
      })
    ])

    // Send card details via email
    if (user.email) {
      sendCardDetailsEmail(
        user.email,
        user.name ?? 'there',
        cardDetails.brand,
        cardDetails.cardNumber,
        cardDetails.pin,
        cardDetails.faceValue
      ).catch(console.error)
    }

    res.json({ cardDetails })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/active', async (req: Request, res: Response) => {
  try {
    const brandFilter = typeof req.query.brand === 'string' ? req.query.brand : undefined
    const searchFilter = typeof req.query.search === 'string' ? req.query.search : undefined

    const giftCardFilter = searchFilter
      ? { brand: { contains: searchFilter, mode: 'insensitive' as const } }
      : brandFilter
      ? { brand: { equals: brandFilter } }
      : undefined

    const listings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        giftCard: giftCardFilter
      },
      include: {
        giftCard: { select: { brand: true, faceValue: true, description: true } },
        user: {
          select: {
            username: true,
            name: true,
            clerkId: true,
            avatarUrl: true,
            verification: { select: { status: true } }
          }
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
    const brand = req.params.brand as string

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
// Get a single listing
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        giftCard: { select: { brand: true, faceValue: true, description: true } },
        user: {
          select: {
            username: true,
            name: true,
            avatarUrl: true,
            verification: { select: { status: true } },
            reviewsReceived: { select: { rating: true } }
          }
        },
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
    const reviews = listing.user.reviewsReceived
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null
    res.json({
      listing: {
        ...listing,
        user: {
          username: listing.user.username,
          name: listing.user.name,
          avatarUrl: listing.user.avatarUrl,
          isVerified: listing.user.verification?.status === 'APPROVED',
          avgRating,
          reviewCount: reviews.length
        }
      }
    })
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

    
    const existingBid = await prisma.bid.findFirst({
      where: {
        listingId: id,
        bidderId: user.id,
        status: 'PENDING'
      }
    })

    if (existingBid) {
      res.status(400).json({ error: 'You already have a pending bid on this listing' })
      return
    }
    
    if (offeredCardId) {
      const offeredCard = await prisma.giftCard.findFirst({
        where: { id: offeredCardId, userId: user.id, status: 'AVAILABLE' }
      })
      if (!offeredCard) {
        res.status(403).json({ error: 'You do not own this card or it is not available' })
        return
      }
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
    // Notify seller
    const seller = await prisma.user.findUnique({ where: { id: listing.userId } })
    if (seller?.email) {
      sendBidReceivedEmail(
        seller.email,
        seller.name ?? 'there',
        listing.giftCard.brand,
        listing.giftCard.faceValue,
        bidType,
        cashAmount ?? null
      ).catch(console.error)
    }

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

    const bidder = await prisma.user.findUnique({ where: { id: bid.bidderId } })
    const listingWithCard = await prisma.listing.findUnique({
      where: { id: id as string },
      include: { giftCard: true }
    })
    if (bidder?.email && listingWithCard) {
      sendBidAcceptedEmail(
        bidder.email,
        bidder.name ?? 'there',
        listingWithCard.giftCard.brand,
        listingWithCard.giftCard.faceValue
      ).catch(console.error)
    }

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
      where: { id: bidId as string, listingId: id as string },
      data: { status: 'REJECTED' }
    })

    const rejectedBid = await prisma.bid.findUnique({ where: { id: bidId as string } })
    const listingWithCard = await prisma.listing.findUnique({
      where: { id: id as string },
      include: { giftCard: true }
    })
    const bidder = rejectedBid ? await prisma.user.findUnique({ where: { id: rejectedBid.bidderId } }) : null
    if (bidder?.email && listingWithCard) {
      sendBidRejectedEmail(
        bidder.email,
        bidder.name ?? 'there',
        listingWithCard.giftCard.brand,
        listingWithCard.giftCard.faceValue
      ).catch(console.error)
    }
    res.json({ success: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal server error' })
    }
})
export default router