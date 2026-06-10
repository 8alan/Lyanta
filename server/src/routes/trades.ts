import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'

const router = Router()

router.get('/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    const trades = await prisma.trade.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id }
        ]
      },
      include: {
        listing: {
          include: {
            giftCard: {
              select: {
                brand: true,
                faceValue: true,
                revealed: true,
                description: true
              }
            }
          }
        },
        seller: { select: { username: true, name: true } },
        buyer: { select: { username: true, name: true } },
        reviews: { select: { reviewerId: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    // Attach hasReviewed flag for each trade
    const tradesWithReviewFlag = trades.map(trade => ({
      ...trade,
      hasReviewed: trade.reviews.some(r => r.reviewerId === user.id)
    }))
    res.json({ trades: tradesWithReviewFlag })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Submit a review for a completed trade
router.post('/:id/review', requireAuth, async (req: Request, res: Response) => {
  try {
    const tradeId = req.params.id as string
    const clerkId = req.userId!
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' })
      return
    }

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { reviews: { select: { reviewerId: true } } }
    })

    if (!trade) {
      res.status(404).json({ error: 'Trade not found' })
      return
    }

    if (trade.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Can only review completed trades' })
      return
    }

    if (trade.buyerId !== user.id && trade.sellerId !== user.id) {
      res.status(403).json({ error: 'Not authorized' })
      return
    }

    const alreadyReviewed = trade.reviews.some(r => r.reviewerId === user.id)
    if (alreadyReviewed) {
      res.status(400).json({ error: 'You have already reviewed this trade' })
      return
    }

    // Reviewer reviews the other party
    const revieweeId = trade.buyerId === user.id ? trade.sellerId : trade.buyerId

    const review = await prisma.review.create({
      data: {
        tradeId,
        reviewerId: user.id,
        revieweeId,
        rating,
        comment: comment ?? null
      }
    })

    res.status(201).json({ review })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router