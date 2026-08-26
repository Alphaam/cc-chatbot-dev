import Papa from 'papaparse';
import sql from '@/lib/db';
import { getEnrichedChatLogs, parseFilters, applyFilters, buildSessionRollups } from '@/lib/dashboard-data';

function csvResponse<T extends object>(rows: T[], filename: string) {
  const csv = Papa.unparse(rows);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

const MESSAGE_FIELDS = [
  'id', 'session_id', 'created_at', 'user_message', 'intent', 'zip_code',
  'num_plans_returned', 'num_services_returned', 'household_size', 'usage_profile', 'device_count', 'service_type_selected',
] as const;

// address_queried holds the full street address kept internally for zip/district
// derivation — selected here only so zip_code can be computed, then dropped
// before the row is ever written to a CSV.
interface RawLogRow extends Record<string, unknown> {
  address_queried: string | null;
}
const ZIP_RE = /(\d{5}) *$/;
const withZipOnly = (row: RawLogRow) => {
  const { address_queried, ...rest } = row;
  const m = address_queried ? ZIP_RE.exec(address_queried) : null;
  return { ...rest, zip_code: m ? m[1] : null };
};

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const type = params.get('type');
  const id = params.get('id');
  const date = new Date().toISOString().slice(0, 10);

  // "Download everything currently shown" — same filters as the dashboard.
  if (type === 'sessions') {
    const rows = applyFilters(await getEnrichedChatLogs(), parseFilters(params));
    return csvResponse(buildSessionRollups(rows), `sessions-${date}.csv`);
  }

  if (type === 'messages') {
    const rows = applyFilters(await getEnrichedChatLogs(), parseFilters(params));
    const csvRows = rows.map(r => Object.fromEntries(MESSAGE_FIELDS.map(f => [f, r[f]])));
    return csvResponse(csvRows, `messages-${date}.csv`);
  }

  // Single-session transcript / single message row: explicit "get me this
  // exact thing" requests from a per-row download icon, intentionally
  // unaffected by whatever dashboard filters happen to be active.
  if (type === 'session' && id) {
    const rows = await sql`
      SELECT id, session_id, created_at, user_message, intent, address_queried,
        num_plans_returned, num_services_returned, household_size, usage_profile, device_count, service_type_selected
      FROM chat_logs
      WHERE session_id = ${id}
      ORDER BY created_at
    ` as unknown as RawLogRow[];
    return csvResponse(rows.map(withZipOnly), `session-${id}-${date}.csv`);
  }

  if (type === 'message' && id && /^\d+$/.test(id)) {
    const rows = await sql`
      SELECT id, session_id, created_at, user_message, intent, address_queried,
        num_plans_returned, num_services_returned, household_size, usage_profile, device_count, service_type_selected
      FROM chat_logs
      WHERE id = ${Number(id)}
    ` as unknown as RawLogRow[];
    return csvResponse(rows.map(withZipOnly), `message-${id}-${date}.csv`);
  }

  return Response.json({ error: 'Unknown export type' }, { status: 400 });
}
