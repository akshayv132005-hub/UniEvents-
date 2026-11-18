// READ-ONLY. Prints the field shapes of users, clubs and universities so the
// Mongoose models can match the existing Atlas data. It never writes, and it
// never prints password hashes, tokens or other secrets.
// Usage: npm run inspect-db -w server
import 'dotenv/config'
import mongoose from 'mongoose'

const COLLECTIONS = ['users', 'clubs', 'universities']
const SAMPLE = 5
const SECRET = /pass|hash|token|secret|otp|salt/i
const ENUM_HINT = /role|status|type|active|approved|verified/i

function typeOf(v) {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  if (v instanceof Date) return 'date'
  if (v?._bsontype) return v._bsontype
  return typeof v
}

// Collect "path -> set of types" for every field, recursing into plain objects.
function shape(doc, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(doc)) {
    const path = prefix + k
    const t = typeOf(v)
    ;(out[path] ||= new Set()).add(t)
    if (t === 'object' && !SECRET.test(k)) shape(v, path + '.', out)
    if (t === 'array' && v[0] && typeOf(v[0]) === 'object') shape(v[0], path + '[].', out)
  }
  return out
}

await mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection.db
console.log(`Database: ${db.databaseName}`)
const names = (await db.listCollections().toArray()).map((c) => c.name).sort()
console.log(`Collections: ${names.join(', ')}\n`)

for (const name of COLLECTIONS) {
  const col = db.collection(name)
  const count = await col.countDocuments()
  const docs = await col.find({}).limit(SAMPLE).toArray()
  const fields = {}
  docs.forEach((d) => shape(d, '', fields))
  console.log(`== ${name} (${count} documents, ${docs.length} sampled)`)
  for (const [path, types] of Object.entries(fields)) {
    const note = SECRET.test(path) ? '  [secret, value hidden]' : ''
    console.log(`  ${path}: ${[...types].join('|')}${note}`)
  }
  // Distinct values for enum-like top-level fields (never for secret fields).
  for (const path of Object.keys(fields)) {
    if (!path.includes('.') && ENUM_HINT.test(path) && !SECRET.test(path)) {
      const values = await col.distinct(path)
      console.log(`  distinct ${path}: ${JSON.stringify(values.slice(0, 15))}`)
    }
  }
  const indexes = await col.indexes()
  console.log(`  indexes: ${indexes.map((i) => JSON.stringify(i.key) + (i.unique ? ' unique' : '')).join(', ')}`)
  if (name === 'universities') {
    const sample = docs.slice(0, 3).map((d) => d.name ?? d.shortName ?? d._id)
    console.log(`  sample names: ${JSON.stringify(sample)}`)
  }
  console.log()
}

await mongoose.disconnect()
