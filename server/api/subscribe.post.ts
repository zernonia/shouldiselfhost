// Newsletter signups live in the same D1 as votes. Same philosophy too: the list is
// infrastructure, not a growth hack — no tracking pixels, one-click unsubscribe when
// sending starts, and "worthy news only" is a promise the send cadence has to keep.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

let schemaReady = false
async function ensureSchema(db: any) {
  if (schemaReady) return
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS subscribers (
      email TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ).run()
  schemaReady = true
}

const devSubscribers = new Set<string>()

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string }>(event)
  const email = body?.email?.trim().toLowerCase() ?? ''
  if (!EMAIL_RE.test(email) || email.length > 254) {
    throw createError({ statusCode: 400, statusMessage: 'valid email required' })
  }
  const db = event.context.cloudflare?.env?.DB ?? null
  if (!db) {
    devSubscribers.add(email)
    return { ok: true }
  }
  await ensureSchema(db)
  await db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?1)').bind(email).run()
  return { ok: true }
})
