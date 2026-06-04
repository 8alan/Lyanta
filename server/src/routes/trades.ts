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
        buyer: { select: { username: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ trades })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router