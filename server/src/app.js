import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { notFound, errorHandler } from './middleware/error.js'

export function createApp() {
  const app = express()
  app.use(helmet())
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  app.use(notFound)
  app.use(errorHandler)
  return app
}
