import {
  flattenPlans,
  getCheapestPlan,
  getFastestPlan,
  getProviderWebsite,
  type Plan,
  type PlanGroups,
} from "./plan-utils.ts";
import type { ServiceGroups, ServiceWithDistance } from "./services-lookup";

export type ResourceCategory = "internet" | "devices" | "skills";
export const CATEGORIES: ResourceCategory[] = ["internet", "devices", "skills"];
export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  internet: "Internet plans",
  devices: "Devices & computer access",
  skills: "Digital skills training",
};
export interface Resource {
  id: string;
  category: ResourceCategory;
  name: string;
  url?: string;
  plan?: Plan;
  service?: ServiceWithDistance;
}
export interface LookupResponse {
  planGroups: PlanGroups | null;
  serviceGroups: ServiceGroups | null;
  found: boolean;
  validated?: boolean;
  address?: string;
  confirmAddress?: string;
  lat?: number;
  lon?: number;
  nearbyAddresses?: Array<{
    addr: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lon: number;
  }>;
}
export const planKey = (plan: Plan) =>
  JSON.stringify([
    plan.provider,
    plan.planName,
    plan.technology,
    plan.price,
    plan.downloadMbps,
    plan.uploadMbps,
  ]);
export function resourcesFromLookup(result: LookupResponse): Resource[] {
  const plans = result.planGroups ? flattenPlans(result.planGroups) : [];
  const cheapest = getCheapestPlan(plans);
  const fastest = getFastestPlan(plans);
  const ordered = [
    ...new Map(
      [cheapest, fastest, ...plans]
        .filter((p): p is Plan => !!p)
        .map((p) => [planKey(p), p]),
    ).values(),
  ];
  const services = result.serviceGroups
    ? (Object.values(result.serviceGroups).flat() as ServiceWithDistance[])
    : [];
  const resources: Resource[] = ordered.map((plan) => ({
    id: `internet:${planKey(plan)}`,
    category: "internet",
    name: [plan.provider, plan.planName].filter(Boolean).join(" · "),
    url: getProviderWebsite(plan.provider),
    plan,
  }));
  for (const service of services) {
    const categories: ResourceCategory[] = [];
    if (/device/i.test(service.type)) categories.push("devices");
    if (/skills|training/i.test(service.type)) categories.push("skills");
    for (const category of categories)
      resources.push({
        id: JSON.stringify([
          category,
          service.name,
          service.type,
          service.address,
          service.url,
        ]),
        category,
        name: service.name,
        url: safeWebsite(service.url),
        service,
      });
  }
  return [
    ...new Map(resources.map((resource) => [resource.id, resource])).values(),
  ];
}
export function defaultShortlist(resources: Resource[]) {
  return new Set(
    CATEGORIES.flatMap((category) => {
      const first = resources.find(
        (resource) => resource.category === category,
      );
      return first ? [first.id] : [];
    }),
  );
}
export function safeWebsite(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export const priceLabel = (price: string) =>
  price.trim() ? `$${price.trim().replace(/^\$/, "")}` : "";
type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;
export function resourceText(resource: Resource, t: Translate) {
  const lines = [resource.name];
  if (resource.plan) {
    const p = resource.plan;
    lines.push(
      `${priceLabel(p.price) || t("Price not listed")}${p.price.trim() ? t("/mo") : ""} | ${p.downloadMbps}/${p.uploadMbps} Mbps | ${t(p.technology)}`,
    );
    if (p.lowIncome === "Y")
      lines.push(
        `${t("Low-income discount")}: ${priceLabel(p.liDiscount) || t("Confirm with provider")}`,
      );
    if (p.contract === "Y")
      lines.push(t("Contract: {months} months", { months: p.contractMonths }));
    if (p.contract === "N") lines.push(t("No contract"));
    if (p.introDiscount)
      lines.push(
        t("Intro: {discount} for {months} mo", {
          discount: p.introDiscount,
          months: p.introPeriod,
        }),
      );
    if (p.installFee) lines.push(`${t("Installation")}: ${p.installFee}`);
    if (p.otherFeesNote) lines.push(p.otherFeesNote);
  }
  if (resource.service) {
    const s = resource.service;
    if (s.description) lines.push(t(s.description));
    if (s.address) lines.push(t(s.address));
    if (s.distanceMiles != null)
      lines.push(
        t("{distance} miles away", { distance: s.distanceMiles.toFixed(1) }),
      );
    else lines.push(t("National / Online"));
    if (s.phone) lines.push(`${t("Phone")}: ${s.phone}`);
    if (s.languages) lines.push(`${t("Languages")}: ${t(s.languages)}`);
  }
  if (resource.url) lines.push(resource.url);
  return lines.join("\n");
}
export function recommendationsText(
  resources: Resource[],
  t: Translate,
  address?: string,
) {
  return [
    t("Clark County digital resources"),
    ...(address ? [`${t("Current address")}: ${address}`] : []),
    ...CATEGORIES.flatMap((category) => {
      const matches = resources.filter(
        (resource) => resource.category === category,
      );
      return matches.length
        ? [
            `${t(CATEGORY_LABELS[category])}\n\n${matches.map((resource) => resourceText(resource, t)).join("\n\n")}`,
          ]
        : [];
    }),
    t(
      "Directory matches only. Contact each provider to confirm availability, cost, and eligibility. Service receipt is not confirmed.",
    ),
  ].join("\n\n");
}
export const ISSUE_REASONS = {
  "incorrect-details": "Incorrect contact or program details",
  unavailable: "Resource is no longer available",
  "broken-link": "Website link does not work",
  eligibility: "Eligibility or price is incorrect",
  other: "Something else",
} as const;
