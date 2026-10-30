import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resourcesFromLookup,
  defaultShortlist,
  resourceText,
  recommendationsText,
  resourceCaseNote,
  categoryCounts,
  safeWebsite,
  isAddressQuery,
} from "../lib/resource-finder.ts";
import { translate } from "../lib/i18n.ts";

test("mixed input routes addresses without treating household questions as addresses", () => {
  for (const address of ["@ 500 S Grand Central Pkwy", "500 S Grand Central Pkwy, Las Vegas, NV 89155", "123 Main", "Find plans at 123 Main St, Las Vegas", "123 Main Coirt"]) assert.equal(isAddressQuery(address), true, address);
  for (const question of ["What is broadband?", "Which plan costs less?", "100 Mbps for 2 people?", "2 people need internet", "3 devices", "How do I sign up?", "¿Qué plan es más barato?"]) assert.equal(isAddressQuery(question), false, question);
});

const t = (key, values) => translate("en", key, values);
const plan = (name, price, speed) => ({
  provider: "Cox Communications",
  planName: name,
  technology: "Cable",
  price,
  downloadMbps: speed,
  uploadMbps: "25",
  introDiscount: "",
  introPeriod: "",
  dataCap: "",
  dataCapGB: "",
  contract: "N",
  contractMonths: "",
  otherFees: "",
  otherFeesNote: "",
  installFee: "",
  etf: "",
  lowIncome: "N",
  liDiscount: "",
  meetsThreshold: true,
});
const service = {
  name: "Test library",
  type: "Digital Skills Training, Device Access Resources",
  phone: "555-0100",
  url: "https://example.org",
  address: "Public library",
  lat: 36,
  long: -115,
  description:
    "Open to Clark County residents. Offers digital skills training via the EBSCO LearningExpress Library.",
  languages: "English",
  distanceMiles: 1.2,
};
const cheap = plan("Lower cost", "25", "100");
const fast = plan("Faster", "70", "1000");
const normal = plan("Middle", "50", "300");
const lookup = {
  found: true,
  validated: true,
  address: "Test client address",
  planGroups: {
    threshold: [normal, cheap, fast],
    byProvider: { duplicate: [cheap] },
  },
  serviceGroups: {
    within1: [],
    within5: [service],
    within10: [],
    national: [],
  },
};

test("internet shortlist is deterministic, deduplicated, and lower-cost first", () => {
  const resources = resourcesFromLookup(lookup);
  const plans = resources.filter(
    (resource) => resource.category === "internet",
  );
  assert.deepEqual(
    plans.map((resource) => resource.plan.planName),
    ["Lower cost", "Faster", "Middle"],
  );
  assert.equal(
    new Set(resources.map((resource) => resource.id)).size,
    resources.length,
  );
  const selected = defaultShortlist(resources);
  assert.equal(selected.size, 3);
  assert.deepEqual(
    resources
      .filter((resource) => selected.has(resource.id))
      .map((resource) => resource.category),
    ["internet", "devices", "skills"],
  );
});

test("combined programs appear under both relevant categories", () => {
  const resources = resourcesFromLookup(lookup).filter(
    (resource) => resource.service,
  );
  assert.deepEqual(
    resources.map((resource) => resource.category),
    ["devices", "skills"],
  );
  assert.notEqual(resources[0].id, resources[1].id);
});

test("no matching record never invents plans or carries earlier address data", () => {
  const resources = resourcesFromLookup({
    found: false,
    planGroups: null,
    serviceGroups: null,
  });
  assert.deepEqual(resources, []);
  assert.equal(defaultShortlist(resources).size, 0);
});

test("client handout only includes selected resources, excludes client address by default, and disclaims receipt", () => {
  const resources = resourcesFromLookup(lookup);
  const selected = resources.slice(0, 1);
  const text = recommendationsText(selected, t);
  assert.match(text, /Lower cost/);
  assert.doesNotMatch(
    text,
    /Faster|Middle|Test client address|Chat transcript/,
  );
  assert.match(text, /Service receipt is not confirmed/);
  assert.match(
    recommendationsText(selected, t, "Test client address"),
    /Current address: Test client address/,
  );
});

test("service descriptions and labels retain Spanish support", () => {
  const resource = resourcesFromLookup(lookup).find(
    (resource) => resource.service,
  );
  const text = resourceText(resource, (key, values) =>
    translate("es", key, values),
  );
  assert.match(text, /Teléfono|Idiomas/);
  assert.doesNotMatch(text, /Open to Clark County residents/);
  assert.match(text, /1.2 millas/);
});

test("all three category counts remain visible with empty categories last", () => {
  const resources = resourcesFromLookup(lookup);
  assert.deepEqual(categoryCounts(resources), [
    { category: "internet", count: 3 }, { category: "devices", count: 1 }, { category: "skills", count: 1 },
  ]);
  assert.deepEqual(categoryCounts(resources.filter((resource) => resource.category === "skills")), [
    { category: "skills", count: 1 }, { category: "internet", count: 0 }, { category: "devices", count: 0 },
  ]);
  assert.deepEqual(categoryCounts([]).map(({ count }) => count), [0, 0, 0]);
});

test("case note includes every selected resource, not unselected options, and keeps address opt-in", () => {
  const resources = resourcesFromLookup(lookup);
  const selected = resources.filter((resource) => resource.plan?.planName === "Lower cost" || resource.service);
  const note = resourceCaseNote(selected, t);
  assert.match(note, /Search query: Internet, device access, and digital skills resources/);
  assert.match(note, /Lower cost/);
  assert.match(note, /Test library · Devices & computer access/);
  assert.match(note, /Test library · Digital skills training/);
  assert.doesNotMatch(note, /Faster|Middle|Test client address|Select a matched resource/);
  assert.match(note, /unconfirmed/);
  assert.match(resourceCaseNote(selected, t, "Test client address"), /Current address: Test client address/);
  assert.match(resourceCaseNote(selected, (key) => translate("es", key)), /Recursos seleccionados/);
  assert.doesNotMatch(resourceCaseNote([], t), /Test library|Lower cost/);
});

test("website links reject unsafe schemes", () => {
  assert.equal(safeWebsite("javascript:alert(1)"), undefined);
  assert.equal(safeWebsite("data:text/html,test"), undefined);
  assert.equal(safeWebsite("invalid URL"), undefined);
  assert.equal(safeWebsite("https://example.org"), "https://example.org/");
});
