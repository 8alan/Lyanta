import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'
import { decrypt } from '../services/encryption.js'

const router = Router()
const ADMIN_CLERK_ID = 'user_3EkMoyxFtTPRfXQUL5VL5eKCPil'

function requireAdmin(req: Request, res: Response, next: Function) {
  console.log('requireAdmin - userId:', req.userId)
  console.log('requireAdmin - ADMIN_CLERK_ID:', ADMIN_CLERK_ID)
  if (req.userId !== ADMIN_CLERK_ID) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  next()
}

router.get('/gift-cards/pending', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const giftCards = await prisma.giftCard.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        brand: true,
        description: true,
        cardNumber: true,
        pin: true,
        faceValue: true,
        status: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
        listing: { select: { buyNowPrice: true, minAcceptPrice: true, acceptsExchange: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    const decrypted = giftCards.map(card => ({
      ...card,
      cardNumber: decrypt(card.cardNumber),
      pin: decrypt(card.pin)
    }))

    res.json({ giftCards: decrypted })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

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
      await tx.giftCard.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          balance: verifiedBalance ?? giftCard.faceValue,
          verifiedAt: new Date()
        }
      })

      if (giftCard.listing) {
        await tx.listing.update({
          where: { id: giftCard.listing.id },
          data: { status: 'ACTIVE' }
        })
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/gift-cards/:id/reject', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    await prisma.giftCard.update({
      where: { id },
      data: { status: 'FAILED' }
    })

    await prisma.listing.updateMany({
      where: { giftCardId: id },
      data: { status: 'CANCELLED' }
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

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