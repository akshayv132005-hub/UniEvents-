import { User } from '../models/User.js'
import { verifyToken } from '../utils/token.js'
import { httpError } from '../utils/httpError.js'

// Verifies "Authorization: Bearer <jwt>" and puts the current user on req.user.
export async function requireAuth(req, res, next) {
  const header = req.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    throw httpError(401, 'UNAUTHENTICATED', 'Please log in')
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw httpError(401, 'INVALID_TOKEN', 'Your session has expired. Please log in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user || user.approvalStatus === 'suspended' || user.approvalStatus === 'rejected') {
    throw httpError(401, 'INVALID_TOKEN', 'Your session has expired. Please log in again.')
  }
  req.user = user
  next()
}
