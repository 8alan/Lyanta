import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'

const router = Router()

const SUPPORTED_BRANDS = [
  'Abercrombie', 'Amazon', 'Banana Republic', 'Best Buy', 'Blizzard',
  'Chipotle', 'DoorDash', 'GameStop', 'Google Play', 'H&M',
  'IKEA', 'Instacart', 'Kohls', 'Lego', 'Lowes', 'Lululemon',
  'Macys', 'Mastercard', 'Nautica', 'Pink', 'Roblox', 'Sephora',
  'Staples', 'Starbucks', 'Steam', 'Taco Bell', 'Tinder', 'Uber', 'Valorant', 'Other'
]

// Submit a gift card
router.post('/submit', requireAuth, async (req: Request, res: Response) => {
  try {
    const { brand, cardNumber, pin, declaredValue, description } = req.body
    const clerkId = req.userId!

    if (!brand || !cardNumber || !pin || !declaredValue) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    if (cardNumber.length < 8 || cardNumber.length > 20) {
      res.status(400).json({ error: 'Invalid card number length' })
      return
    }

    if (pin.length < 4 || pin.length > 8) {
      res.status(400).json({ error: 'Invalid PIN length' })
      return
    }

    if (declaredValue < 1 || declaredValue > 2000) {
      res.status(400).json({ error: 'Card value must be between $1 and $2,000' })
      return
    }

    if (!SUPPORTED_BRANDS.includes(brand) && brand !== 'Other') {
      res.status(400).json({ error: 'Unsupported gift card brand' })
      return
    }

    let user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const existing = await prisma.giftCard.findFirst({
      where: { cardNumber, pin }
    })

    if (existing) {
      res.status(400).json({ error: 'This card has already been submitted' })
      return
    }

    const giftCard = await prisma.giftCard.create({
      data: {
        userId: user.id,
        brand,
        cardNumber,
        pin,
        balance: declaredValue,
        faceValue: declaredValue,
        status: 'PENDING',
        source: 'USER',
        description: description ?? null,
      }
    })

    res.status(201).json({
      giftCard,
      message: 'Gift card submitted successfully. Verification in progress.'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's submitted gift cards
router.get('/mine', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const giftCards = await prisma.giftCard.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ giftCards })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get balance
router.get('/balance', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { creditBalance: true }
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ balance: user.creditBalance?.balance ?? 0 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const clerkId = req.userId!

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const giftCard = await prisma.giftCard.findFirst({
      where: { id, userId: user.id },
      include: { listing: true }
    })

    if (!giftCard) {
      res.status(404).json({ error: 'Gift card not found' })
      return
    }

    if (giftCard.status !== 'PENDING' && giftCard.status !== 'AVAILABLE') {
      res.status(400).json({ error: 'Only pending or unsold cards can be deleted' })
      return
    }

    await prisma.$transaction(async (tx) => {
      if (giftCard.listing) {
        await tx.listing.delete({ where: { id: giftCard.listing!.id } })
      }
      await tx.giftCard.delete({ where: { id } })
    })

    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
export default router