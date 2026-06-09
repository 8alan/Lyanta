import { Request, Response, NextFunction } from 'express'
import { clerkMiddleware, getAuth } from '@clerk/express'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export const clerkSetup = clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
})

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req)
  console.log('requireAuth - userId:', userId)

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  req.userId = userId
  next()
}

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}