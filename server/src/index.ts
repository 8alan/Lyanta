import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { clerkSetup } from './middleware/auth.js'
import giftCardRouter from './routes/giftcards.js'
import webhookRouter from './routes/webhooks.js'
import stripeRouter from './routes/stripe.js'
import listingsRouter from './routes/listings.js'
import adminRouter from './routes/admin.js'
import tradesRouter from './routes/trades.js'
import { requireAuth } from './middleware/auth.js'
import profileRouter from './routes/profile.js'
import supportRouter from './routes/support.js'

dotenv.config()


const app = express()
app.set('trust proxy', 1)

const PORT = process.env.PORT || 5000

// Security headers
app.use(helmet())

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://lantana-rho.vercel.app',
    'https://myriapods.com',
    'https://www.myriapods.com'
  ],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // increase from 100 to 500
  message: { error: 'Too many requests, please try again later' }
})
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // increase from 20 to 100
  message: { error: 'Too many requests, please try again later' }
})

app.use(limiter)

// Webhook raw body parsing must come before express.json()
app.use('/webhooks', express.raw({ type: '*/*' }))
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

// JSON parsing
app.use(express.json())

// Clerk auth middleware
app.use(clerkSetup)

app.get('/who-am-i', (req: Request, res: Response) => {
  res.json({ userId: req.userId ?? 'not set' })
})

// Public test routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Lantana server is running' })
})

app.get('/ping', (req: Request, res: Response) => {
  res.json({ ok: true })
})

app.get('/auth-test', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  res.json({
    hasAuth: !!authHeader,
    preview: authHeader?.substring(0, 30)
  })
})

app.get('/auth-check', requireAuth, (req: Request, res: Response) => {
  res.json({ userId: req.userId })
})

// Strict rate limiting on sensitive routes
app.use('/api/giftcards/submit', strictLimiter)
app.use('/api/listings/:id/bid', strictLimiter)

// Routes
app.use('/api/giftcards', giftCardRouter)
app.use('/webhooks', webhookRouter)
app.use('/api/stripe', stripeRouter)
app.use('/api/listings', listingsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/trades', tradesRouter)
app.use('/api/profile', profileRouter)
app.use('/api/support', supportRouter)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app