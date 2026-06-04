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
console.log('Stripe router loaded:', stripeRouter)

dotenv.config()


const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))

// Test route BEFORE clerk middleware
app.get('/ping', (req, res) => {
  res.json({ ok: true })
})

// Security headers
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' }
})

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' }
})

app.use(limiter)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(clerkSetup)

app.use('/webhooks', express.raw({ type: '*/*' }))
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Lantana server is running' })
})

// Apply strict rate limiting to sensitive routes
app.use('/api/giftcards/submit', strictLimiter)
app.use('/api/listings/:id/bid', strictLimiter)

app.use('/api/giftcards', giftCardRouter)
app.use('/webhooks', webhookRouter)
app.use('/api/stripe', stripeRouter)
app.use('/api/listings', listingsRouter)
app.use('/api/admin', adminRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(clerkSetup)
app.use('/webhooks', express.raw({ type: '*/*' }))
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use('/api/listings', listingsRouter)
app.use('/api/admin', adminRouter)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Lantana server is running' })
})

app.use('/api/giftcards', giftCardRouter)
app.use('/webhooks', webhookRouter)

app.get('/api/stripe/test-direct', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/stripe', stripeRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  
})


export default app