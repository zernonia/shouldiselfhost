// Votes live in D1 (display-only — they never touch verdicts). Local dev and prerender have
// no D1 binding, so an in-memory map keeps the API shape identical.
const devVotes = new Map<string, Set<string>>()

let schemaReady = false

function d1(event: any): any | null {
  return event.context.cloudflare?.env?.DB ?? null
}

/** Idempotent bootstrap (mirrors migrations/0001_votes.sql) so a fresh D1 just works. */
async function ensureSchema(db: any) {
  if (schemaReady) return
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS votes (
      app_id TEXT NOT NULL,
      voter_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (app_id, voter_hash)
    )`,
  ).run()
  schemaReady = true
}

export async function voteCounts(event: any): Promise<Record<string, number>> {
  const db = d1(event)
  if (!db) {
    return Object.fromEntries([...devVotes.entries()].map(([k, v]) => [k, v.size]))
  }
  await ensureSchema(db)
  const { results } = await db
    .prepare('SELECT app_id, COUNT(*) AS n FROM votes GROUP BY app_id')
    .all()
  return Object.fromEntries(results.map((r: any) => [r.app_id, r.n]))
}

/** Toggle a vote; returns the new count for the app. */
export async function toggleVote(event: any, appId: string, voterHash: string): Promise<{ count: number; voted: boolean }> {
  const db = d1(event)
  if (!db) {
    const set = devVotes.get(appId) ?? new Set()
    devVotes.set(appId, set)
    const voted = !set.has(voterHash)
    voted ? set.add(voterHash) : set.delete(voterHash)
    return { count: set.size, voted }
  }
  await ensureSchema(db)
  const existing = await db
    .prepare('SELECT 1 FROM votes WHERE app_id = ?1 AND voter_hash = ?2')
    .bind(appId, voterHash)
    .first()
  if (existing) {
    await db.prepare('DELETE FROM votes WHERE app_id = ?1 AND voter_hash = ?2').bind(appId, voterHash).run()
  } else {
    await db.prepare('INSERT INTO votes (app_id, voter_hash) VALUES (?1, ?2)').bind(appId, voterHash).run()
  }
  const row = await db.prepare('SELECT COUNT(*) AS n FROM votes WHERE app_id = ?1').bind(appId).first()
  return { count: row?.n ?? 0, voted: !existing }
}

export async function voterHash(event: any): Promise<string> {
  const ip = getHeader(event, 'cf-connecting-ip') ?? getHeader(event, 'x-forwarded-for') ?? 'local'
  const ua = getHeader(event, 'user-agent') ?? ''
  const data = new TextEncoder().encode(`${ip}|${ua}|shouldiselfhost-v1`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
