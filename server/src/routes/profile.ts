import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth.js'
import prisma from '../db.js'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'

const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB limit

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Get current user's profile
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        verification: true,
        reviewsReceived: {
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: { select: { username: true, name: true } }
          }
        },
        _count: {
          select: {
            tradesAsSeller: { where: { status: 'COMPLETED' } },
            tradesAsBuyer: { where: { status: 'COMPLETED' } }
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({
      profile: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        isVerified: user.verification?.status === 'APPROVED',
        completedTrades: (user._count?.tradesAsSeller ?? 0) + (user._count?.tradesAsBuyer ?? 0),
        reviews: user.reviewsReceived.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          reviewer: r.reviewer.username ?? r.reviewer.name ?? 'Anonymous'
        }))
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update username
router.patch('/username', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const { username } = req.body
    if (!username || username.length < 3 || username.length > 20) {
      res.status(400).json({ error: 'Username must be between 3 and 20 characters' })
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      res.status(400).json({ error: 'Username can only contain letters, numbers and underscores' })
      return
    }
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing && existing.clerkId !== clerkId) {
      res.status(400).json({ error: 'Username already taken' })
      return
    }
    const user = await prisma.user.update({
      where: { clerkId },
      data: { username: username.toLowerCase() }
    })
    res.json({ username: user.username })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update bio
router.patch('/bio', requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    const { bio } = req.body
    if (bio && bio.length > 300) {
      res.status(400).json({ error: 'Bio must be 300 characters or less' })
      return
    }
    const user = await prisma.user.update({
      where: { clerkId },
      data: { bio: bio ?? null }
    })
    res.json({ bio: user.bio })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Upload avatar
router.post('/avatar', requireAuth, upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    const clerkId = req.userId!
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({ error: 'Only JPEG, PNG and WebP images are allowed' })
      return
    }
    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'lantana/avatars',
          transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
          resource_type: 'image'
        },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file!.buffer)
    })
    const user = await prisma.user.update({
      where: { clerkId },
      data: { avatarUrl: result.secure_url }
    })
    res.json({ avatarUrl: user.avatarUrl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get public profile by username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username as string
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
      include: {
        verification: true,
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            giftCard: { select: { brand: true, faceValue: true, description: true } },
            bids: { where: { status: 'PENDING' }, select: { id: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        reviewsReceived: {
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: { select: { username: true, name: true } }
          }
        },
        _count: {
          select: {
            tradesAsSeller: { where: { status: 'COMPLETED' } },
            tradesAsBuyer: { where: { status: 'COMPLETED' } }
          }
        }
      }
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({
      profile: {
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        isVerified: user.verification?.status === 'APPROVED',
        completedTrades: (user._count?.tradesAsSeller ?? 0) + (user._count?.tradesAsBuyer ?? 0),
        listings: user.listings.map(l => ({
          id: l.id,
          brand: l.giftCard.brand,
          faceValue: l.giftCard.faceValue,
          description: l.giftCard.description,
          buyNowPrice: l.buyNowPrice,
          acceptsExchange: l.acceptsExchange,
          bidCount: l.bids.length,
          createdAt: l.createdAt
        })),
        reviews: user.reviewsReceived.map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          reviewer: r.reviewer.username ?? r.reviewer.name ?? 'Anonymous'
        }))
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router