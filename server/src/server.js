import 'dotenv/config'
import { createApp } from './app.js'
import { connectDB } from './config/db.js'

const port = Number(process.env.PORT) || 5000

try {
  await connectDB(process.env.MONGODB_URI)
  createApp().listen(port, () => console.log(`API listening on http://localhost:${port}`))
} catch (err) {
  console.error(err.message)
  process.exit(1)
}
