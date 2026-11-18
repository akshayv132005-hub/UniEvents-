// Idempotent demo seed. Upserts ONLY the three demo accounts below (by email)
// and one demo club for the demo club admin.
// $setOnInsert means an account that already exists is left exactly as it is,
// so re-running never duplicates or changes anything, and other users are
// never touched. Usage: npm run seed -w server
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB } from '../src/config/db.js'
import { User } from '../src/models/User.js'
import { University } from '../src/models/University.js'
import { Club } from '../src/models/Club.js'
import mongoose from 'mongoose'

const DEMO = [
  { name: 'Demo Student', email: 'student@unievent.lk', password: 'Student@123', role: 'student', phone: '+94770000001', studentId: 'DEMO/2026/001' },
  { name: 'Demo Club Admin', email: 'club@unievent.lk', password: 'Club@1234', role: 'club_admin', phone: '+94770000002' },
  { name: 'Demo Super Admin', email: 'admin@unievent.lk', password: 'Admin@1234', role: 'super_admin', phone: '+94770000003' },
]

await connectDB(process.env.MONGODB_URI)

// Demo accounts belong to USJ, looked up by its domain (not a hard-coded id).
const usj = await University.findOne({ domain: 'sjp.ac.lk' }).lean()
if (!usj) throw new Error('University with domain sjp.ac.lk not found')

for (const { password, ...account } of DEMO) {
  const result = await User.collection.updateOne(
    { email: account.email },
    {
      $setOnInsert: {
        ...account,
        passwordHash: await bcrypt.hash(password, 10),
        universityId: usj._id,
        approvalStatus: 'approved',
        createdAt: new Date(),
      },
    },
    { upsert: true },
  )
  console.log(`${account.email.padEnd(22)} ${result.upsertedCount ? 'created' : 'already exists, left unchanged'}`)
}

// Every existing club admin has a row in `clubs`, so the demo one gets one too
// (upserted by adminUserId, the unique key of that collection).
const clubAdmin = await User.findOne({ email: 'club@unievent.lk' }).lean()
const club = await Club.collection.updateOne(
  { adminUserId: clubAdmin._id },
  {
    $setOnInsert: {
      name: 'Demo Society',
      universityId: usj._id,
      adminUserId: clubAdmin._id,
      contactInfo: 'club@unievent.lk | +94770000002',
      approvalStatus: 'approved',
    },
  },
  { upsert: true },
)
console.log(`${'Demo Society (club)'.padEnd(22)} ${club.upsertedCount ? 'created' : 'already exists, left unchanged'}`)

await mongoose.disconnect()
