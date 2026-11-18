import { z } from 'zod'
import { httpError } from './httpError.js'

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'))
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number')
const name = z.string().trim().min(2, 'Enter your full name').max(100)
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose your university')
const terms = z.literal(true, { error: 'You must accept the terms' })

export const studentRegisterSchema = z.object({
  role: z.literal('student'),
  name,
  email,
  password,
  universityId: objectId,
  studentId: z.string().trim().min(3, 'Enter your student / registration number').max(30),
  acceptTerms: terms,
})

export const clubRegisterSchema = z.object({
  role: z.literal('club_admin'),
  name,
  email,
  password,
  universityId: objectId,
  clubName: z.string().trim().min(2, 'Enter the club or society name').max(120),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^\+?\d{9,12}$/, 'Enter a valid contact number')),
  acceptTerms: terms,
})

// Login only checks shape. Password rules are not revealed at login.
export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
  role: z.enum(['student', 'club_admin', 'super_admin'], { error: 'Choose a portal' }),
})

// The database stores roles in lowercase. Accept STUDENT / CLUB_ADMIN too.
export function normaliseRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : role
}

// Parse or throw a 400 with { field: message } details.
export function parse(schema, body) {
  const result = schema.safeParse(body ?? {})
  if (result.success) return result.data
  const details = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] ?? 'body'
    const missing = issue.code === 'invalid_type' && issue.input === undefined
    details[key] ??= missing && key !== 'acceptTerms' ? 'This field is required' : issue.message
  }
  throw httpError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields', details)
}
