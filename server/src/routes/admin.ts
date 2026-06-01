import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'

const router = Router()

const ADMIN_CLERK_ID = 'user_3E5oYSNAmxL21Dl2gbwF6G2AnbL'

function requireAdmin(req: Request, res: Response, next: Function) {
  if (req.userId !== ADMIN_CLERK_ID) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  next()
}

// Get all pending gift cards
router.get('/gift-cards/pending', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const giftCards = await prisma.giftCard.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { email: true, name: true } },
        listing: { select: { listingType: true, askingPrice: true } }
      },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ giftCards })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Verify a gift card
router.post('/gift-cards/:id/verify', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { verifiedBalance } = req.body

    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
      include: { listing: true, user: true }
    })

    if (!giftCard) {
      res.status(404).json({ error: 'Gift card not found' })
      return
    }

    await prisma.$transaction(async (tx) => {
      // Update gift card status
      await tx.giftCard.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          balance: verifiedBalance ?? giftCard.faceValue,
          verifiedAt: new Date()
        }
      })

      // Credit the user
      const fee = giftCard.faceValue * 0.07
      const creditAmount = giftCard.faceValue - fee

      await tx.creditBalance.upsert({
        where: { userId: giftCard.userId! },
        update: { balance: { increment: creditAmount } },
        create: { userId: giftCard.userId!, balance: creditAmount }
      })
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Reject a gift card
router.post('/gift-cards/:id/reject', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    await prisma.giftCard.update({
      where: { id },
      data: { status: 'FAILED' }
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all users
router.get('/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { creditBalance: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get platform overview
router.get('/overview', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [totalUsers, pendingCards, activeListings, completedListings] = await Promise.all([
      prisma.user.count(),
      prisma.giftCard.count({ where: { status: 'PENDING' } }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'COMPLETED' } })
    ])

    res.json({ totalUsers, pendingCards, activeListings, completedListings })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router