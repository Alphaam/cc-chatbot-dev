export const sources = {
  studio: { label: "HR&A · Tech & Society", url: "https://hraadvisors.com/how-we-work/expertise/tech-society/" },
  labs: { label: "HR&A · Labs", url: "https://hraadvisors.com/how-we-work/labs/" },
  tools: { label: "HR&A · Digital Tools", url: "https://hraadvisors.com/how-we-work/our-services/digital-tools/" },
};

export const slides = [
  {
    chapter: "The practice", title: "Public purpose. Product thinking.", kind: "cover",
    notes: "Position the practice at the intersection of public-interest strategy and product development, not as a generic software vendor. HR&A publicly describes Tech & Society as working with government agencies, philanthropies, institutions, and businesses, and HR&A Labs as building and deploying digital products grounded in analysis. This deck uses the public website's Albert Sans, blue (#3C4ED6), and official logo. It is a draft interpretation, not a certification against an internal brand manual. Public sources reviewed September 21, 2026.",
    sources: [sources.studio, sources.labs],
  },
  {
    chapter: "The practice", title: "Technology in service of people.", kind: "studio",
    notes: "HR&A's Tech & Society practice covers tech policy and enablement, broadband and digital opportunity, workforce development, and innovation districts and economies. HR&A Labs is described separately as a digital product and data capability. Present the combination as complementary expertise; do not imply an unverified reporting structure. The studio's published clients include state and local governments, philanthropies, universities, healthcare institutions, and innovative businesses.",
    sources: [sources.studio, sources.labs],
  },
  {
    chapter: "Why we build", title: "Close to the challenge. Built for the work.", kind: "why",
    notes: "These are verified advisory and data-project examples, not claims that the Clark County chatbot was deployed in these places. HR&A is lead strategic advisor and program manager to New York's ConnectALL Office. HR&A collaborated with the Texas Broadband Development Office on its first statewide Digital Opportunity Plan. HR&A and Go Consulting Services worked with Rhode Island's Division of Statewide Planning to standardize zoning and land use data across 39 municipalities. These examples support domain and data expertise, not measured chatbot outcomes.",
    sources: [sources.studio, sources.labs],
  },
  {
    chapter: "Our approach", title: "Simple on the surface. Rigorous underneath.", kind: "framework",
    notes: "This is a proposed, reusable delivery framework for the product development offering. Experience means understanding user tasks, plain language, device contexts, and accessibility testing. Intelligence means explicit service rules and bounded AI assistance, with escalation when evidence is incomplete. Evidence means a fit-for-purpose data model and a managed source inventory. Agree acceptance criteria, security and privacy requirements, accessibility requirements, and ownership with each client. Do not present this framework as a verified firmwide SOP.",
    sources: [sources.tools, sources.labs],
  },
  {
    chapter: "Our approach", title: "The expertise behind the answer.", kind: "data",
    notes: "HR&A Labs publicly describes rigorous data analysis, data science, sourcing new inputs, and custom data solutions. Highlight the analytical team through that verified expertise rather than unsupported superlatives or invented staff credentials. The source, structure, check, and steward sequence is a recommended engagement model. A scoped QA plan should include source provenance, field definitions, completeness and duplication checks, sample verification with program owners, reviewer sign-off, and an update cadence. No evidence in this repository establishes that every resource has completed those steps. Dataset presence is not certification of current availability.",
    sources: [sources.labs],
  },
  {
    chapter: "Our approach", title: "A product. And a path to adoption.", kind: "delivery",
    notes: "Recommended engagement sequence, not a promise of an existing maintenance contract. Discover: interview frontline users and establish a measurable baseline. Build: prepare data, prototype workflows, and integrate approved systems. Validate: test with users, review content, assess privacy/security and accessibility, and document limitations. Sustain: train staff, assign data owners, agree support and update responsibilities, and monitor feedback. Candidate success measures include task completion, time to a useful referral, referral follow-through, and data freshness. Do not invent results or imply savings have been measured.",
    sources: [sources.tools],
  },
  {
    chapter: "Clark County", title: "A clearer path to getting connected.", kind: "product",
    notes: "The current build is the Clark County Digital Equity Assistant for Clark County, Nevada, a county government context rather than a state agency. The interface is addressed to county staff and partners assisting residents. It offers paths for internet plans, digital skills training, and free or low-cost devices. The proposed reusable product-category name is Public Service Navigator; it is working positioning, not an established HR&A product trademark. Screenshots are actual captures of this repository's interface, not fabricated outcomes or a claim of production deployment.",
    sources: [],
  },
  {
    chapter: "Clark County", title: "At the desk. In the community. On the move.", kind: "devices",
    notes: "Actual browser captures at desktop (1440 × 1000), tablet (820 × 1100), and phone (390 × 844) viewports, shown in illustrative device frames. Intended use contexts are office-based assistance, a shared tablet conversation, and mobile outreach. These are responsive browser layouts, not native iOS apps or evidence of offline operation or cross-device session synchronization. Do not claim WCAG conformance without a formal audit.",
    sources: [],
  },
  {
    chapter: "Clark County", title: "Less interface. More assistance.", kind: "features",
    notes: "Visible features in the captured interface: a choice of three concrete starting tasks, English/Spanish language selection, and short instructions that explain the address-based journey. The intent is to reduce the burden of inventing a prompt, make the next step predictable, and support frontline staff. The current build also contains guided household questions and result browsing. Language support does not establish complete translation of every external program record. Describe accessibility as an explicit design and validation priority, not a certified result.",
    sources: [],
  },
  {
    chapter: "Clark County", title: "Local evidence. Useful direction.", kind: "logic",
    notes: "Repository evidence: app/api/lookup/route.ts geocodes the supplied address, searches address records, parses technology rules, matches broadband plans, and finds nearby services. lib/services.ts contains structured resource records with names, categories, contacts, URLs, locations, descriptions, and languages. The architecture separates structured lookup from conversational presentation. Address-level dataset matching is not a provider's serviceability guarantee. Price, eligibility, enrollment, and program availability require confirmation with the provider. The build does not establish a fully automated source refresh, audited accuracy rate, or live eligibility determination.",
    sources: [],
  },
  {
    chapter: "What transfers", title: "A reusable foundation. A local answer.", kind: "adapt",
    notes: "Potential adaptations, not shipped modules or existing client deployments: housing resource navigation, workforce and training referrals, and small-business support. Reuse the guided experience and structured resource model; tailor geography, program rules, source data, terminology, integrations, accessibility, and language needs. Each adaptation requires discovery, legal/privacy review, content validation, staff training, and a scoped operating model. A navigator can support referrals but must not represent itself as making a binding benefit or eligibility decision.",
    sources: [],
  },
  {
    chapter: "Live demonstration", title: "From a question to a next step.", kind: "closing",
    notes: "End at the Clark County chatbot. Suggested demonstration: select a real task, use an approved public test address, confirm the location, and review the available options and provider contact information. Avoid personal resident information during presentations. The link opens the current build in a new tab so the deck remains available. Network services and connected data must be available for live lookups. This is a product demonstration, not evidence of deployment scale, cost savings, or guaranteed outcomes.",
    sources: [],
  },
] as const;
