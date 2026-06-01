import { Request, Response, NextFunction } from 'express'
import { clerkMiddleware, getAuth } from '@clerk/express'

export const clerkSetup = clerkMiddleware()

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req)

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