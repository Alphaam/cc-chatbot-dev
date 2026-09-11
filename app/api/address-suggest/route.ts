import { createTTLCache } from '@/lib/cache';

interface Suggestion {
  label: string;
  value: string;
}

// Bounding box roughly covering Clark County, NV: lon_min,lat_max,lon_max,lat_min.
// Combined with bounded=1, Nominatim restricts results to this area so
// autocomplete stays focused on the county the tool actually serves rather
// than surfacing same-named streets elsewhere in the country.
const CLARK_COUNTY_VIEWBOX = '-116.10,36.90,-114.00,35.00';

const SUGGEST_TTL_MS = 60 * 60 * 1000;
const cache = createTTLCache<Suggestion[]>(SUGGEST_TTL_MS, 500);

const STATE_ABBR: Record<string, string> = {
  Nevada: 'NV', Arizona: 'AZ', California: 'CA', Utah: 'UT',
};

interface NominatimItem {
  address?: Record<string, string>;
}

// Only house-level results are actionable: the downstream lookup (extractAddress
// + points search) needs a leading house number and street, so street- or
// place-only matches are dropped rather than offered as dead-end suggestions.
function formatSuggestion(item: NominatimItem): Suggestion | null {
  const a = item.address;
  if (!a || !a.house_number || !a.road) return null;

  const line1 = `${a.house_number} ${a.road}`;
  const city = a.city || a.town || a.village || a.hamlet || a.suburb;
  const state = a['ISO3166-2-lvl4']?.split('-')[1] || STATE_ABBR[a.state] || a.state;
  const tail = [city, [state, a.postcode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const full = [line1, tail].filter(Boolean).join(', ');

  return { label: full, value: full };
}

export async function POST(req: Request) {
  const { query } = await req.json();
  const q = (query || '').trim();
  if (q.length < 3) return Response.json({ suggestions: [] });

  const key = q.toLowerCase();
  const cached = cache.get(key);
  if (cached) return Response.json({ suggestions: cached });

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=us&viewbox=${CLARK_COUNTY_VIEWBOX}&bounded=1`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'ClarkCountyDigitalEquityChatbot/2.0' } });
    const data = (await res.json()) as NominatimItem[];

    const seen = new Set<string>();
    const suggestions: Suggestion[] = [];
    for (const item of data) {
      const s = formatSuggestion(item);
      if (s && !seen.has(s.value)) {
        seen.add(s.value);
        suggestions.push(s);
      }
    }

    cache.set(key, suggestions);
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
