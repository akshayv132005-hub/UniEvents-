import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Club } from '../models/Club.js'
import { University } from '../models/University.js'
import { httpError } from '../utils/httpError.js'
import { signToken } from '../utils/token.js'
import { requireAuth } from '../middleware/auth.js'
import {
  parse,
  normaliseRole,
  studentRegisterSchema,
  clubRegisterSchema,
  loginSchema,
} from '../utils/validation.js'

const router = Router()
const BCRYPT_COST = 10
// Compared against when the email is unknown, so both cases take the same time.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-1', BCRYPT_COST)

const WRONG_PORTAL = {
  student: 'This is a student account. Use the Student tab.',
  club_admin: 'This is an organizer account. Use the Club Admin tab.',
  super_admin: 'This is a platform admin account. Use "Platform admin? Sign in here".',
}
const BLOCKED = {
  pending: ['PENDING_APPROVAL', 'Your account is waiting for Super Admin approval.'],
  rejected: ['REJECTED', 'Your organizer request was not approved. Contact the platform admin.'],
  suspended: ['SUSPENDED', 'This account has been suspended. Contact the platform admin.'],
}

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

// POST /api/auth/login  { email, password, role } -> { token, user }
// Order matters: check the password first, and only then reveal the portal or
// account state, so the endpoint never confirms whether an email exists.
router.post('/login', async (req, res) => {
  const data = parse(loginSchema, { ...req.body, role: normaliseRole(req.body?.role) })

  const user = await User.findOne({ email: data.email }).select('+passwordHash')
  const ok = await bcrypt.compare(data.password, user?.passwordHash || DUMMY_HASH)
  if (!user || !ok) {
    throw httpError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password')
  }

  if (user.role !== data.role) {
    throw httpError(403, 'WRONG_PORTAL', WRONG_PORTAL[user.role] || 'Use the correct sign-in tab.')
  }
  const blocked = BLOCKED[user.approvalStatus]
  if (blocked) throw httpError(403, blocked[0], blocked[1])

  res.json({ token: signToken(user), user })
})

// GET /api/auth/me  (Authorization: Bearer <jwt>)
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

export default router
