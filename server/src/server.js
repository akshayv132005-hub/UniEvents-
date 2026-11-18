import dotenv from 'dotenv'
import { createApp } from './app.js'
import { connectDB } from './config/db.js'

// server/.env wins over variables inherited from the shell (e.g. a stray PORT).
dotenv.config({ override: true, quiet: true })

const port = Number(process.env.PORT) || 5000

try {
  await connectDB(process.env.MONGODB_URI)
  createApp().listen(port, () => console.log(`API listening on http://localhost:${port}`))
} catch (err) {
  console.error(err.message)
  process.exit(1)
}
