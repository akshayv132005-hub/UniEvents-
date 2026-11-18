import mongoose from 'mongoose'

// Matches the existing `clubs` collection: name, universityId, adminUserId,
// contactInfo ("email | phone"), approvalStatus.
const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    contactInfo: { type: String, trim: true },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { collection: 'clubs', versionKey: false },
)

export const Club = mongoose.model('Club', clubSchema)
