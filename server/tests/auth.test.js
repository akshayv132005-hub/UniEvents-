// Auth API tests. They run against an in-memory MongoDB (mongodb-memory-server),
// never against the Atlas database.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { createApp } from '../src/app.js'
import { User } from '../src/models/User.js'
import { Club } from '../src/models/Club.js'
import { University } from '../src/models/University.js'

let mongo
let app
let universityId

const student = (overrides = {}) => ({
  role: 'STUDENT',
  name: 'Nethmi Silva',
  email: 'Nethmi@SJP.ac.lk',
  password: 'secret123',
  universityId,
  studentId: 'AS2023104',
  acceptTerms: true,
  ...overrides,
})

const clubAdmin = (overrides = {}) => ({
  role: 'CLUB_ADMIN',
  name: 'Kasun Perera',
  email: 'kasun@sjp.ac.lk',
  password: 'organiser1',
  universityId,
  clubName: 'Rotaract Club',
  phone: '+94 77 123 4567',
  acceptTerms: true,
  ...overrides,
})

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret'
  mongo = await MongoMemoryServer.create()
  await mongoose.connect(mongo.getUri())
  await Promise.all([User.init(), Club.init(), University.init()]) // build unique indexes
  const uni = await University.create({ name: 'University of Sri Jayewardenepura', domain: 'sjp.ac.lk' })
  universityId = String(uni._id)
  app = createApp()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongo?.stop()
})

describe('POST /api/auth/register', () => {
  it('registers a student as an active account and never returns the hash', async () => {
    const res = await request(app).post('/api/auth/register').send(student())
    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({ email: 'nethmi@sjp.ac.lk', role: 'student', approvalStatus: 'approved' })
    expect(res.body.user.passwordHash).toBeUndefined()
    expect(res.body.token).toBeUndefined()
    const saved = await User.findOne({ email: 'nethmi@sjp.ac.lk' }).select('+passwordHash')
    expect(saved.passwordHash).toMatch(/^\$2[aby]\$/)
  })

  it('rejects a duplicate email with 409', async () => {
    const res = await request(app).post('/api/auth/register').send(student({ email: 'nethmi@sjp.ac.lk' }))
    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ code: 'EMAIL_TAKEN', message: 'This email is already registered' })
  })

  it('rejects a weak password and a public SUPER_ADMIN registration with 400', async () => {
    const weak = await request(app).post('/api/auth/register').send(student({ email: 'weak@sjp.ac.lk', password: 'password' }))
    expect(weak.status).toBe(400)
    expect(weak.body.details.password).toMatch(/number/)

    const admin = await request(app).post('/api/auth/register').send(student({ email: 'boss@sjp.ac.lk', role: 'SUPER_ADMIN' }))
    expect(admin.status).toBe(400)
    expect(await User.exists({ email: 'boss@sjp.ac.lk' })).toBeNull()
  })

  it('registers a club admin as pending, with a linked pending club and no token', async () => {
    const res = await request(app).post('/api/auth/register').send(clubAdmin())
    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({ role: 'club_admin', approvalStatus: 'pending', phone: '+94771234567' })
    expect(res.body.message).toMatch(/approv/i)
    expect(res.body.token).toBeUndefined()
    const club = await Club.findOne({ adminUserId: res.body.user._id })
    expect(club).toMatchObject({ name: 'Rotaract Club', approvalStatus: 'pending' })
  })
})

describe('POST /api/auth/login', () => {
  it('logs a student in and returns a token and the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'NETHMI@sjp.ac.lk', password: 'secret123', role: 'student' })
    expect(res.status).toBe(200)
    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toMatchObject({ email: 'nethmi@sjp.ac.lk', role: 'student' })
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it('returns one generic 401 for a wrong password or an unknown email', async () => {
    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nethmi@sjp.ac.lk', password: 'wrongpass1', role: 'student' })
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@sjp.ac.lk', password: 'wrongpass1', role: 'student' })
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(wrong.body).toEqual(unknown.body)
    expect(wrong.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('blocks a pending club admin with 403 PENDING_APPROVAL', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'kasun@sjp.ac.lk', password: 'organiser1', role: 'club_admin' })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('PENDING_APPROVAL')
  })

  it('blocks a student using the admin portal with 403 WRONG_PORTAL', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nethmi@sjp.ac.lk', password: 'secret123', role: 'super_admin' })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('WRONG_PORTAL')
  })
})

describe('GET /api/auth/me', () => {
  it('returns 401 without a token and the user with a valid token', async () => {
    const none = await request(app).get('/api/auth/me')
    expect(none.status).toBe(401)

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nethmi@sjp.ac.lk', password: 'secret123', role: 'student' })
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`)
    expect(me.status).toBe(200)
    expect(me.body.user).toMatchObject({ email: 'nethmi@sjp.ac.lk', role: 'student' })
    expect(me.body.user.passwordHash).toBeUndefined()
  })
})
