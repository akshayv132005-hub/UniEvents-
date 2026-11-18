import mongoose from 'mongoose'

// Matches the existing `users` collection in Atlas (unievent_hub):
//   name, email, passwordHash, role, universityId, phone, approvalStatus, createdAt
// Role and status values are lowercase there, so they are lowercase here too.
// Added (optional, only on new documents): studentId, and the approvalStatus
// values 'rejected' and 'suspended'. Nothing existing is renamed or migrated.
export const ROLES = ['student', 'club_admin', 'super_admin']
export const APPROVAL = ['pending', 'approved', 'rejected', 'suspended']

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
    phone: { type: String, trim: true },
    studentId: { type: String, trim: true },
    approvalStatus: { type: String, enum: APPROVAL, default: 'approved' },
  },
  {
    collection: 'users',
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash
        return ret
      },
    },
  },
)

export const User = mongoose.model('User', userSchema)
