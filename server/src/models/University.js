import mongoose from 'mongoose'

// Matches the existing `universities` collection: name, location, domain.
const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    domain: { type: String, unique: true },
  },
  { collection: 'universities', versionKey: false },
)

export const University = mongoose.model('University', universitySchema)
