import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Club } from '../models/Club.js'
import { University } from '../models/University.js'
import { httpError } from '../utils/httpError.js'
import { parse, normaliseRole, studentRegisterSchema, clubRegisterSchema } from '../utils/validation.js'

const router = Router()
const BCRYPT_COST = 10

// POST /api/auth/register
// Public registration only creates students (active) and club admins (pending).
router.post('/register', async (req, res) => {
  const role = normaliseRole(req.body?.role)
  if (role !== 'student' && role !== 'club_admin') {
    throw httpError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields', {
      role: 'Choose Student or Club Admin',
    })
  }
  const schema = role === 'student' ? studentRegisterSchema : clubRegisterSchema
  const data = parse(schema, { ...req.body, role })

  if (!(await University.exists({ _id: data.universityId }))) {
    throw httpError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields', {
      universityId: 'Choose your university',
    })
  }
  if (await User.exists({ email: data.email })) {
    throw httpError(409, 'EMAIL_TAKEN', 'This email is already registered', {
      email: 'This email is already registered',
    })
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST)
  let user
  try {
    user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role,
      universityId: data.universityId,
      ...(role === 'student'
        ? { studentId: data.studentId, approvalStatus: 'approved' }
        : { phone: data.phone, approvalStatus: 'pending' }),
    })
  } catch (err) {
    if (err.code === 11000) throw httpError(409, 'EMAIL_TAKEN', 'This email is already registered')
    throw err
  }

  if (role === 'student') return res.status(201).json({ user })

  // Club admins: link the club in the existing clubs collection.
  try {
    await Club.create({
      name: data.clubName,
      universityId: data.universityId,
      adminUserId: user._id,
      contactInfo: `${data.email} | ${data.phone}`,
      approvalStatus: 'pending',
    })
  } catch (err) {
    await User.deleteOne({ _id: user._id }) // undo the half-finished registration
    throw err
  }
  res.status(201).json({
    user,
    message: 'Request submitted. You will be able to log in once the Super Admin approves your account.',
  })
})

export default router
