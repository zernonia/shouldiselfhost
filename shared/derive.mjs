/**
 * The golden rule lives here: store inputs, derive outputs.
 * Every savings figure, break-even date, Markup Index and abandonment flag on the site
 * comes from these functions — at build time, in the Worker, and in the client-side
 * hourly-rate slider. Never hand-write a derived number into data/.
 */

export const DEFAULT_HOURLY_RATE = 20; // USD/h — site-wide reference rate; every page has a slider
export const BREAK_EVEN_WINDOW_MO = 18; // rubric: economics pass = break-even inside this window
export const YES_SETUP_CEILING_MIN = 120; // rubric: YES needs core workflow running <= 2h
export const KINDA_SETUP_CEILING_MIN = 960; // rubric: KINDA <= one weekend (16h)
export const ABANDONED_AFTER_DAYS = 365;

/** True monthly cost of self-hosting: server share + storage + your time, valued honestly. */
export function selfHostCostUsdMo(economics, hourlyRate = DEFAULT_HOURLY_RATE) {
  if (!economics) return null;
  const storage = economics.storage_usd_mo ?? 0;
  return economics.vps_share_usd_mo + storage + (economics.maint_min_mo / 60) * hourlyRate;
}

/** What you stop paying, minus what self-hosting really costs you per month. Can be negative. */
export function netMonthlySavingUsd(app, hourlyRate = DEFAULT_HOURLY_RATE) {
  const cost = selfHostCostUsdMo(app.economics, hourlyRate);
  if (cost == null) return null;
  return app.price_usd_mo - cost;
}

/** One-time cost of the migration weekend: measured setup minutes at your rate. */
export function setupCostUsd(app, hourlyRate = DEFAULT_HOURLY_RATE) {
  if (!app.verified?.setup_min) return null;
  return (app.verified.setup_min / 60) * hourlyRate;
}

/** Months until the setup cost is paid back. null = never (saving <= 0). */
export function breakEvenMonths(app, hourlyRate = DEFAULT_HOURLY_RATE) {
  const saving = netMonthlySavingUsd(app, hourlyRate);
  const setup = setupCostUsd(app, hourlyRate);
  if (saving == null || setup == null || saving <= 0) return null;
  return setup / saving;
}

/** Calendar break-even date from the verification date. null = never. */
export function breakEvenDate(app, hourlyRate = DEFAULT_HOURLY_RATE, from = app.verified?.at) {
  const months = breakEvenMonths(app, hourlyRate);
  if (months == null || !from) return null;
  const d = new Date(from + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + Math.round(months * 30.44));
  return d.toISOString().slice(0, 10);
}

/** Markup Index: subscription price ÷ real self-host cost. The argument-starter leaderboard. */
export function markupIndex(app, hourlyRate = DEFAULT_HOURLY_RATE) {
  const cost = selfHostCostUsdMo(app.economics, hourlyRate);
  if (cost == null || cost <= 0) return null;
  return app.price_usd_mo / cost;
}

/** Abandonment flag from bot metrics: last commit older than a year. */
export function isAbandoned(metrics, now = new Date()) {
  if (!metrics?.last_commit) return false;
  const ageDays = (now - new Date(metrics.last_commit)) / 86400000;
  return ageDays > ABANDONED_AFTER_DAYS;
}

/** Verdict staleness: verified more than 12 months ago → badge dims, re-test issue opens. */
export function isStaleVerdict(app, now = new Date()) {
  if (!app.verified?.at) return false;
  const ageDays = (now - new Date(app.verified.at + 'T00:00:00Z')) / 86400000;
  return ageDays > 365;
}

/**
 * The homepage number: "Subscription money escaped: $X/mo" = Σ(app price × votes).
 * caniselfhostit refuses to sum ("you'd replace them one at a time"); we sum. That contrast
 * is the brand — which is why this function is quoted verbatim on the homepage.
 */
export function escapedUsdMo(apps, votesById) {
  return apps.reduce((sum, app) => sum + app.price_usd_mo * (votesById[app.id] ?? 0), 0);
}

/**
 * Rubric check — the four inputs behind every verdict (CONTRIBUTING.md#the-rubric).
 * Returns pass/fail per criterion so pages can show WHY, and validation can flag
 * verdicts that contradict their own inputs.
 */
export function rubric(app, metrics, hourlyRate = DEFAULT_HOURLY_RATE) {
  const be = breakEvenMonths(app, hourlyRate);
  const setup = app.verified?.setup_min ?? null;
  return {
    economics: be != null && be <= BREAK_EVEN_WINDOW_MO,
    effort_yes: setup != null && setup <= YES_SETUP_CEILING_MIN,
    effort_kinda: setup != null && setup <= KINDA_SETUP_CEILING_MIN,
    health: !isAbandoned(metrics),
    break_even_months: be,
    setup_min: setup,
  };
}
