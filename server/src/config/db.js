import mongoose from 'mongoose'

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is not set. Copy server/.env.example to server/.env.')
  // The Atlas database already exists with its own indexes. Do not let Mongoose
  // create collections or indexes on start-up, so connecting never writes.
  await mongoose.connect(uri, { autoIndex: false, autoCreate: false })
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}
