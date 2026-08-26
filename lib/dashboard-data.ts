import sql from './db';
import { districtForPoint } from './districts';
import { DEVICE_COUNT_OPTIONS } from './plan-utils';

const ZIP_RE = /(\d{5}) *$/;

// The only place a full address should ever be turned into a ZIP — every
// dashboard/export surface reads r.zip_code, never r.address_queried, so the
// full address (kept in Postgres for internal use) never reaches the client.
const zipFromAddress = (address: string | null): string | null => {
  if (!address) return null;
  const m = ZIP_RE.exec(address);
  return m ? m[1] : null;
};

export interface ChatLogRow {
  id: number;
  session_id: string;
  created_at: string;
  user_message: string;
  intent: string;
  // Full address and precise coordinates — kept for internal use only
  // (deriving zip_code/district below). Never spread into an API response,
  // CSV export, or component prop; downstream code should read zip_code and
  // district instead.
  address_queried: string | null;
  lat: number | null;
  long: number | null;
  num_plans_returned: number | null;
  num_services_returned: number | null;
  household_size: string | null;
  usage_profile: string | null;
  device_count: string | null;
  service_type_selected: string | null;
  zip_code: string | null;
  district: string | null;
}

// One SQL round-trip for every chart, the map, and the Messages/Sessions table —
// all filtering (intent, commissioner district, date range) and aggregation
// happens here in JS afterward. This isn't a shortcut: district can only be
// determined by a JS point-in-polygon test (no PostGIS on this Neon instance),
// and at ~150-200 rows fetching everything and computing in-process is trivial
// work, so there's no reason to also split intent/date filtering into SQL.
export async function getEnrichedChatLogs(): Promise<ChatLogRow[]> {
  const rows = await sql`
    SELECT
      c.id, c.session_id, c.created_at, c.user_message, c.intent, c.address_queried,
      COALESCE(c.lat, p.lat) AS lat,
      COALESCE(c.long, p.long) AS long,
      c.num_plans_returned, c.num_services_returned,
      c.household_size, c.usage_profile, c.device_count, c.service_type_selected
    FROM chat_logs c
    LEFT JOIN LATERAL (
      SELECT lat, long FROM points
      WHERE addr = split_part(c.address_queried, ', ', 1)
        AND state = split_part(split_part(c.address_queried, ', ', 3), ' ', 1)
        AND (city = split_part(c.address_queried, ', ', 2) OR c.address_queried !~ '^[^,]+, [^,]+, ')
      LIMIT 1
    ) p ON true
    ORDER BY c.created_at DESC
  `;
  return rows.map(r => ({
    ...r,
    district: districtForPoint(r.lat, r.long),
    zip_code: zipFromAddress(r.address_queried),
  })) as ChatLogRow[];
}

export interface DashboardFilters {
  intent?: string;
  district?: string;
  from?: string; // YYYY-MM-DD, inclusive
  to?: string;   // YYYY-MM-DD, inclusive
}

export function parseFilters(searchParams: URLSearchParams): DashboardFilters {
  const filters: DashboardFilters = {};
  const intent = searchParams.get('intent');
  const district = searchParams.get('district');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (intent) filters.intent = intent;
  if (district) filters.district = district;
  if (from) filters.from = from;
  if (to) filters.to = to;
  return filters;
}

const PACIFIC_TZ = 'America/Los_Angeles';

// Matches the day-bucketing convention already used for the Daily Activity
// chart (`created_at AT TIME ZONE 'America/Los_Angeles'`).
function localDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ });
}

export function applyFilters(rows: ChatLogRow[], filters: DashboardFilters): ChatLogRow[] {
  return rows.filter(row => {
    if (filters.intent && row.intent !== filters.intent) return false;
    if (filters.district && row.district !== filters.district) return false;
    if (filters.from || filters.to) {
      const day = localDay(row.created_at);
      if (filters.from && day < filters.from) return false;
      if (filters.to && day > filters.to) return false;
    }
    return true;
  });
}

function maxOrNull(group: ChatLogRow[], field: 'num_plans_returned' | 'num_services_returned'): number | null {
  let max: number | null = null;
  for (const r of group) {
    const v = r[field];
    if (v == null) continue;
    if (max == null || v > max) max = v;
  }
  return max;
}

function mostRecentNonNull(sortedDesc: ChatLogRow[], field: 'zip_code' | 'household_size' | 'usage_profile' | 'device_count' | 'service_type_selected'): string | null {
  const hit = sortedDesc.find(r => r[field] != null);
  return hit ? (hit[field] as string) : null;
}

export interface SessionRollup {
  session_id: string;
  started_at: string;
  ended_at: string;
  message_count: string;
  intents: string;
  zip_code: string | null;
  household_size: string | null;
  usage_profile: string | null;
  device_count: string | null;
  service_type_selected: string | null;
  num_plans_returned: number | null;
  num_services_returned: number | null;
}

// Direct JS translation of the SQL rollup this used to be (see git history of
// lib/sessions.ts): household_size/usage_profile/service_type_selected/zip_code
// take the most-recently-set non-null value per session, since they're only
// ever populated on one row at a time (see logSelection in lib/analytics.ts).
export function buildSessionRollups(rows: ChatLogRow[], limit?: number): SessionRollup[] {
  const bySession = new Map<string, ChatLogRow[]>();
  for (const r of rows) {
    const group = bySession.get(r.session_id);
    if (group) group.push(r);
    else bySession.set(r.session_id, [r]);
  }

  const rollups: SessionRollup[] = [];
  for (const [session_id, group] of bySession) {
    const sortedDesc = group.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    const startedAt = sortedDesc[sortedDesc.length - 1].created_at;
    const endedAt = sortedDesc[0].created_at;
    rollups.push({
      session_id,
      started_at: startedAt,
      ended_at: endedAt,
      message_count: String(group.length),
      intents: Array.from(new Set(group.map(r => r.intent))).join(', '),
      zip_code: mostRecentNonNull(sortedDesc, 'zip_code'),
      household_size: mostRecentNonNull(sortedDesc, 'household_size'),
      usage_profile: mostRecentNonNull(sortedDesc, 'usage_profile'),
      device_count: mostRecentNonNull(sortedDesc, 'device_count'),
      service_type_selected: mostRecentNonNull(sortedDesc, 'service_type_selected'),
      num_plans_returned: maxOrNull(group, 'num_plans_returned'),
      num_services_returned: maxOrNull(group, 'num_services_returned'),
    });
  }

  rollups.sort((a, b) => (a.ended_at < b.ended_at ? 1 : -1));
  return limit ? rollups.slice(0, limit) : rollups;
}

export function computeTotals(rows: ChatLogRow[]) {
  const sessions = new Set(rows.map(r => r.session_id));
  const zips = new Set(rows.filter(r => r.zip_code != null).map(r => r.zip_code));
  return {
    total_messages: String(rows.length),
    total_sessions: String(sessions.size),
    unique_zip_codes: String(zips.size),
  };
}

export function groupByIntent(rows: ChatLogRow[]) {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.intent, (counts.get(r.intent) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([intent, count]) => ({ intent, count: String(count) }));
}

export function groupByDay(rows: ChatLogRow[]) {
  const counts = new Map<string, { sessions: Set<string>; messages: number }>();
  for (const r of rows) {
    const day = localDay(r.created_at);
    const entry = counts.get(day) ?? { sessions: new Set<string>(), messages: 0 };
    entry.sessions.add(r.session_id);
    entry.messages += 1;
    counts.set(day, entry);
  }
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, entry]) => ({ day, sessions: String(entry.sessions.size), messages: String(entry.messages) }));
}

function groupBySelectionField(rows: ChatLogRow[], field: 'household_size' | 'usage_profile') {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const value = r[field];
    if (value == null) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ [field]: value, count: String(count) }));
}

export const groupByHouseholdSize = (rows: ChatLogRow[]) =>
  groupBySelectionField(rows, 'household_size') as Array<{ household_size: string; count: string }>;

export const groupByUsageProfile = (rows: ChatLogRow[]) =>
  groupBySelectionField(rows, 'usage_profile') as Array<{ usage_profile: string; count: string }>;

// Sorted by the guidance table's device-count order (1-2, 2-3, 3-5, ...), not
// alphabetically — alphabetical would put "10-15" before "2-3".
const DEVICE_COUNT_ORDER: string[] = DEVICE_COUNT_OPTIONS.map(o => o.value);

export function groupByDeviceCount(rows: ChatLogRow[]) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (r.device_count == null) continue;
    counts.set(r.device_count, (counts.get(r.device_count) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => DEVICE_COUNT_ORDER.indexOf(a[0]) - DEVICE_COUNT_ORDER.indexOf(b[0]))
    .map(([device_count, count]) => ({ device_count, count: String(count) }));
}

export function groupByServiceType(rows: ChatLogRow[]) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (r.service_type_selected == null) continue;
    counts.set(r.service_type_selected, (counts.get(r.service_type_selected) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([service_type_selected, count]) => ({ service_type_selected, count: String(count) }));
}

export function groupByZipIntent(rows: ChatLogRow[]) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (!r.zip_code) continue;
    const key = `${r.zip_code}|${r.intent}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, count]) => {
      const [zip, intent] = key.split('|');
      return { zip, intent, count: String(count) };
    });
}

export function recentMessages(rows: ChatLogRow[], limit = 50) {
  // rows is already ordered by created_at DESC from getEnrichedChatLogs(),
  // and .filter() preserves order, so no re-sort needed here.
  return rows.slice(0, limit).map(r => ({
    id: r.id,
    session_id: r.session_id,
    created_at: r.created_at,
    user_message: r.user_message,
    intent: r.intent,
    zip_code: r.zip_code,
    num_plans_returned: r.num_plans_returned,
    num_services_returned: r.num_services_returned,
  }));
}

// Counts per commissioner district for the choropleth map — the map only
// ever sees this aggregate, never the per-row lat/long/address it's derived
// from.
export function districtCounts(rows: ChatLogRow[]) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (!r.district) continue;
    counts.set(r.district, (counts.get(r.district) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([district, count]) => ({ district, count }));
}
