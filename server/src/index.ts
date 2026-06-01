import dotenv from 'dotenv'
dotenv.config()
import adminRouter from './routes/admin.js'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { clerkSetup } from './middleware/auth.js'
import giftCardRouter from './routes/giftcards.js'
import webhookRouter from './routes/webhooks.js'
import listingsRouter from './routes/listings.js'
import stripeRouter from './routes/stripe.js'
console.log('Stripe router loaded:', stripeRouter)


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