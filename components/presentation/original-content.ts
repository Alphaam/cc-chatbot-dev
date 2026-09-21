import type { SlideContent, SlideKind } from "./content";

const originalPages: { kind: SlideKind; chapter: string; title: string; transcript: string }[] = [
  {
    kind: "cover",
    chapter: "The studio",
    title: "Tech & Society Studio.",
    transcript: "Custom digital products. Expertly built. We turn public-interest expertise into custom digital tools for the people who put it to work. Built around people. Studio + Product Systems. Laptop, tablet, and phone artwork presents public-interest digital products under the themes People, Places, and Progress.",
  },
  {
    kind: "mission",
    chapter: "Our mission",
    title: "Make expertise useful.",
    transcript: "We pair policy and program expertise with data, design, and development to build tools around your decisions, users, and operating realities. Custom fit. Not off the shelf. Expert-led. From discovery onward. Quality. Tested against agreed criteria. $1.5B+ New York ConnectALL: Investment supported by HR&A as lead strategic advisor and program manager. 39 Rhode Island municipalities: Land-use datasets standardized with state planners and Go Consulting Services. >35% U.S. population: Served by HR&A’s broadband and digital-opportunity clients. Program scale, not product impact.",
  },
  {
    kind: "expertise",
    chapter: "Our advantage",
    title: "Expertise before code.",
    transcript: "We design digital tools from the realities of policy, service delivery, and public-interest operations. Public-interest fluency: Broadband, digital equity, policy, and service systems. Product thinking: Decisions, workflows, and user tasks. Data design: Definitions, stewardship, validation, and updates. Technical delivery: Modern frontend, accessibility, QA, and secure implementation. Working digital products for real-world use.",
  },
  {
    kind: "method",
    chapter: "Our methodology",
    title: "Understand. Build. Prove.",
    transcript: "An expert-led delivery approach: agree the problem, build with domain experts, and validate before handoff. 01 Understand. People + purpose. Map user tasks, source data, and constraints. 02 Build. Data + design. Prototype a workflow around your program. 03 Prove. Experts + users. Test priority tasks; assign update ownership. Frontend. Data model. QA. Accessibility. Privacy. Usability.",
  },
  {
    kind: "quality",
    chapter: "How we build",
    title: "Quality is a design decision.",
    transcript: "Useful tools depend on strong data design, careful QA, and accessible, responsible implementation. The data foundation: Records, source the right evidence. Definitions, structure a usable model. Checks, validate with expert judgment. Updates, assign named ownership. The build standard: Accurate, source checks and expert review. Accessible, keyboard, screen reader, contrast. Responsible, privacy, security, clear limits. Useful, real tasks and user testing. Responsive, works across desktop, tablet, and phone. Maintainable, clear ownership and update paths. Accessibility is tested, not assumed.",
  },
  {
    kind: "evidence",
    chapter: "Our solutions",
    title: "Proven product patterns. Adapted to your context.",
    transcript: "Guided service navigation: Connect residents or staff to the right local resource. Ecosystem intelligence: Understand organizations, relationships, and service networks. Decision-support dashboards: Organize evidence for planning, coordination, and action. Not a template. A starting pattern customized to your people, evidence, and operating model. Three device illustrations show community resource navigation, an organization network, and a regional impact dashboard.",
  },
  {
    kind: "clark-intro",
    chapter: "Case study 01 · Clark County",
    title: "A clearer way to connect.",
    transcript: "Guided service navigation | Clark County Digital Equity Assistant. The assistant helps county staff and partners find internet, training, and device resources for residents in Clark County, Nevada. Internet. Skills. Devices. Responsive web product. English / Español interface. A phone, tablet, and desktop show the assistant asking what it can help this client find, with starting points for internet plans, digital skills training, and free or low-cost devices.",
  },
  {
    kind: "clark-logic",
    chapter: "Clark County · Why this solution",
    title: "From a resident’s need to relevant support.",
    transcript: "The assistant turns a broad service problem into a short, legible path staff can use in real time. 1 Need: internet, skills, or devices. 2 Place: confirm the resident’s location. 3 Match: surface relevant local options. 4 Referral: review providers and next steps. Why it works: it reduces the search burden. Staff start with the person’s need and place, then move toward a practical referral. Guardrail: the tool supports referrals; providers confirm availability and eligibility, and staff retain judgment.",
  },
  {
    kind: "clark-features",
    chapter: "Clark County · Product experience",
    title: "A task. A place. A next step.",
    transcript: "The interface is organized around the work staff need to do, rather than around the structure of the underlying data. 1 Start simply: three clear entry points, internet, skills, or devices. 2 Make it local: an address guides the search toward relevant local resources. 3 Move forward: show options and provider contacts that support a referral. 4 Design for access: English / Español plus one responsive web experience. Product principle: make the next action obvious without pretending the tool can make the final decision.",
  },
  {
    kind: "clark-people",
    chapter: "Clark County · In context",
    title: "Support the conversation.",
    transcript: "A product designed around the service conversation. Staff can guide a resident through focused questions, discuss relevant options, and make the next step clearer. The product supports human judgment rather than replacing it. Local programs: surface relevant resources. Guided questions: turn a need into a usable pathway. Human judgment: keep staff in control of the referral.",
  },
  {
    kind: "devices",
    chapter: "Clark County · Responsive by design",
    title: "Where the work happens.",
    transcript: "One responsive web product. The same web product is designed to work across desktop, tablet, and phone so staff can use it at a desk, side by side with a resident, or in the field. At the desk: desktop, detailed search and referral work. Side by side: tablet, shared conversation with a resident. In the community: phone, portable access during outreach. Build standard: responsive layout, keyboard usability, readable contrast, English / Español interface.",
  },
  {
    kind: "clark-data",
    chapter: "Clark County · Data foundation",
    title: "A living service directory needs governance.",
    transcript: "A useful interface depends on maintained evidence. The product is only as useful as the information behind it. The operating model has to define what gets stored, who validates it, and how it stays current. Source: program records, service categories, provider details, geography. Structure: common fields and definitions so resources can be compared. Validate: providers confirm availability and eligibility; staff can flag issues. Steward: named ownership and update paths keep the directory usable. The principle: the tool supports referrals. It does not assert that a resident is eligible or that a provider has current availability.",
  },
  {
    kind: "mhm-intro",
    chapter: "Case study 02 · MHM ecosystem",
    title: "See the network. See the opportunity.",
    transcript: "Ecosystem intelligence | Regional grantee & organization network. MHM’s ecosystem tool turns a regional set of organizations, grants, services, and relationships into an interactive view that program teams can explore. Organizations. Connections. Services. Funding. The goal is a shared operating picture: understand who is active, how organizations connect, and where coordination may be useful. Actual network view, Region D, Bexar County / San Antonio.",
  },
  {
    kind: "mhm-rationale",
    chapter: "MHM · Why this solution",
    title: "See the relationships, not just the records.",
    transcript: "The problem: understanding a regional ecosystem means seeing who provides which services, where they work, how funding flows, and how organizations connect. Why this solution: an interactive network makes those relationships visible. Filters and organization details connect the wider picture to funding, reported reach, and service focus. Supports exploration. Available data is a partial operating picture, not audited impact.",
  },
  {
    kind: "mhm-model",
    chapter: "MHM · Data model",
    title: "A data model built for ecosystem questions.",
    transcript: "The interface sits on a relational model. The tool connects different kinds of evidence so users can move from a regional pattern to the organizations and records behind it. Organization connects to: Region, where it operates. Service type, what it provides. Grant, funding and period. Relationship, who it connects to. Reported reach, what is reported. This structure supports regional filters, organization detail views, and relationship analysis.",
  },
  {
    kind: "mhm-detail",
    chapter: "MHM · Product experience",
    title: "Explore. Focus. Understand.",
    transcript: "From ecosystem to organization. Users can filter the network, select an organization, and review grant context, reported reach, and connections without leaving the workflow. Explore: compare regional relationships. Focus: filter by service type and grantee status. Understand: open an organization to see the records behind the node.",
  },
  {
    kind: "mhm-people",
    chapter: "MHM · In context",
    title: "Designed for exploration, not automated decisions.",
    transcript: "A shared picture for better discussion. The network helps teams ask better questions about an ecosystem. It should inform discussion, coordination, and follow-up rather than automate funding or performance judgments. Find partners: identify organizations connected to the same service area or network. See concentration: spot where services, grantees, or relationships cluster. Investigate gaps: use the map to frame questions about missing or weakly connected capacity. Ground discussion: move from an abstract regional picture to specific organizations and records.",
  },
  {
    kind: "closing",
    chapter: "Our offering",
    title: "Two tools. A broader capability.",
    transcript: "From proven product patterns to your context. Clark County and MHM show different product patterns built from the same studio capability: domain expertise, data design, frontend delivery, QA, and responsible implementation. Guided service navigation: useful when people need to move from a need and place to a practical next step across fragmented programs or services. Adapt for public agencies, service networks, and digital opportunity programs. Ecosystem intelligence: useful when teams need a shared view of organizations, relationships, funding, services, or regional capacity. Adapt for intermediaries, foundations, regional collaboratives, and networks. Bring us the user, the decision, and the operating context. We will scope the product around your need. Custom products. Expertly built.",
  },
];

export const originalSlides: SlideContent[] = originalPages.map((page) => ({
  kind: page.kind,
  chapter: page.chapter,
  title: page.title,
  transcript: page.transcript,
  notes: `${page.transcript}\n\nMerged and rebuilt from the Part 1 and Part 2 source decks with native text, shapes, and layout elements. Product screenshots are actual captures placed in illustrative device frames; photography is illustrative stock, not photographs of specific staff, residents, or endorsements. Figures describe broader HR&A advisory and data experience, not outcomes attributable to Clark County or MHM. Download the rebuilt PDF for selectable text; edit the slide components to change the source.`,
  sources: [{ label: "Merged source decks (Part 1 + Part 2)", url: "/presentation/source-part1.pdf" }],
}));
