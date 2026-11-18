import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import { notFound, errorHandler } from './middleware/error.js'

export function createApp({ authLimit = 20 } = {}) {
  const app = express()
  app.use(helmet())
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
  app.use(express.json({ limit: '100kb' }))

  // Brute-force protection: 20 failed auth attempts per 15 minutes per IP.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: authLimit,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many attempts. Try again in a few minutes.', code: 'RATE_LIMITED' },
  })

  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.use('/api/auth', authLimiter, authRoutes)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
