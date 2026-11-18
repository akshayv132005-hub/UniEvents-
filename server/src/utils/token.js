import jwt from 'jsonwebtoken'

function secret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set')
  return s
}

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, secret(), { expiresIn: '1d' })
}

export function verifyToken(token) {
  return jwt.verify(token, secret())
}
