import { extractAddress, searchPoints, geocodeAddress, formatParsedAddress, fuzzyCorrectStreet, findNearbyPoints, type NearbyPoint, type ParsedAddress, type PointsRow } from '@/lib/address';
import { parseTechRules, matchPlans, groupPlans, type PlanGroups } from '@/lib/plans';
import { getServicesNearAddress, nationalServicesOnly, type ServiceGroups } from '@/lib/services-lookup';
import { createTTLCache } from '@/lib/cache';

interface LookupResponse {
  planGroups: PlanGroups | null;
  serviceGroups: ServiceGroups | null;
  found: boolean;
  validated: boolean;
  lat?: number;
  lon?: number;
  address?: string;
  // The geocoder-resolved address, for a "Did you mean...?" confirmation
  // before any plans/resources are shown — distinct from `address`, which
  // only exists once a matching FCC dataset row is found.
  confirmAddress?: string;
  // Nearest known addresses in the FCC dataset, offered when the geocoded
  // address itself has no exact record — lets the user pick a close match
  // instead of guessing at spelling or unit numbers.
  nearbyAddresses?: NearbyPoint[];
}

// Keyed by normalized address — avoids re-hitting Postgres and the external
// geocoder (the two slow, network-bound steps) for repeat lookups of the same
// address, which happens often since a session re-queries when the user
// pivots between internet-plan and digital-equity questions.
const FOUND_TTL_MS = 30 * 60 * 1000;
const NOT_FOUND_TTL_MS = 5 * 60 * 1000;
const lookupCache = createTTLCache<LookupResponse>(FOUND_TTL_MS, 1000);

function buildFoundResponse(row: PointsRow, lat: number, lon: number, confirmAddress: string): LookupResponse {
  const matched = matchPlans(row.BRANDNAMES, parseTechRules(row.TECHRULES), row.BLD_TYPE);
  return {
    planGroups: groupPlans(matched),
    serviceGroups: getServicesNearAddress(lat, lon),
    found: true, validated: true, lat, lon,
    address: `${row.ADDR}, ${row.CITY}, ${row.STATE} ${row.ZIP}`,
    confirmAddress,
  };
}

// A suggestion the user clicked: a dataset row we already know exists, so skip
// text parsing and geocoding and match it exactly.
interface ExactPick { addr: string; city: string; state: string; zip: string; lat: number; lon: number }

export async function POST(req: Request) {
  const { text, exact }: { text: string; exact?: ExactPick } = await req.json();

  if (exact?.addr && exact.state) {
    const pick: ParsedAddress = { addr: exact.addr, addrAlt: null, city: exact.city, state: exact.state, zip: exact.zip };
    const row = await searchPoints(pick);
    if (row) {
      const confirmAddress = `${row.ADDR}, ${row.CITY}, ${row.STATE} ${row.ZIP}`;
      return Response.json(buildFoundResponse(row, row.LATITUDE ?? exact.lat, row.LONGITUDE ?? exact.lon, confirmAddress));
    }
  }

  const parsed = extractAddress(text);
  if (!parsed) {
    return Response.json({ planGroups: null, serviceGroups: null, found: false, validated: false });
  }

  const cacheKey = `${parsed.addr}|${parsed.city ?? ''}|${parsed.state}|${parsed.zip}`;
  const cached = lookupCache.get(cacheKey);
  if (cached) {
    return Response.json(cached);
  }

  // Validate the address against OpenStreetMap before ever touching the FCC
  // broadband dataset — an address OSM can't locate isn't worth searching for.
  let effectiveParsed = parsed;
  let geoResult = await geocodeAddress(parsed.addr, parsed.city, parsed.state, parsed.zip);
  if (!geoResult) {
    // Nominatim can't correct a misspelled street name on its own — try the
    // closest real street at this house number in the FCC dataset before
    // giving up on the address entirely.
    const corrected = await fuzzyCorrectStreet(parsed);
    if (corrected) {
      const correctedGeo = await geocodeAddress(corrected.addr, corrected.city, corrected.state, corrected.zip);
      if (correctedGeo) {
        geoResult = correctedGeo;
        effectiveParsed = corrected;
      }
    }
  }
  if (!geoResult) {
    const invalid: LookupResponse = { planGroups: null, serviceGroups: null, found: false, validated: false };
    lookupCache.set(cacheKey, invalid, NOT_FOUND_TTL_MS);
    return Response.json(invalid);
  }

  const confirmAddress = geoResult.formatted ?? formatParsedAddress(effectiveParsed);

  const row = await searchPoints(effectiveParsed);
  const { lat, lon } = geoResult;

  if (!row) {
    // A geocode with no house number is a street-level fallback; its
    // coordinates are only roughly on the street, so don't quote distances.
    const nearbyAddresses = await findNearbyPoints(lat, lon, { parsed: effectiveParsed, precise: !!geoResult.formatted });
    const notFound: LookupResponse = { planGroups: null, serviceGroups: nationalServicesOnly(), found: false, validated: true, lat, lon, confirmAddress, nearbyAddresses };
    lookupCache.set(cacheKey, notFound, NOT_FOUND_TTL_MS);
    return Response.json(notFound);
  }

  const response = buildFoundResponse(row, lat, lon, confirmAddress);
  lookupCache.set(cacheKey, response);
  return Response.json(response);
}
