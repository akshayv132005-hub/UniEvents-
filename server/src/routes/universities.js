import { Router } from 'express'
import { University } from '../models/University.js'

const router = Router()

// GET /api/universities -> [{ _id, name, domain }] for the registration dropdowns
router.get('/', async (req, res) => {
  const universities = await University.find({}, { name: 1, domain: 1 }).sort({ name: 1 }).lean()
  res.json({ universities })
})

export default router
