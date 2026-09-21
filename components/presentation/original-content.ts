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
    chapter: "Case study · Clark County",
    title: "A clearer way to connect.",
    transcript: "Guided service navigation | Clark County Digital Equity Assistant. The assistant helps county staff and partners find internet, training, and device resources for residents. Internet. Skills. Devices. Responsive web product. English / Español interface. Desktop, tablet, and phone artwork shows the Clark County, Nevada assistant. What can I help this client find? Internet plans: Find broadband options at your client’s address. Digital skills training: Locate classes and coaching near your client. Free or low-cost devices: Find computers and tablets for your client. More opportunities for a connected Clark County.",
  },
  {
    kind: "mhm-intro",
    chapter: "Case study · Ecosystem intelligence",
    title: "See the network. See the opportunity.",
    transcript: "Ecosystem intelligence | Regional grantee & organization network. An interactive network tool helps foundations, intermediaries, and partners understand organizations, relationships, and areas of service. Explore organizations. Understand connections. Inform coordination and investment. Two device illustrations show the MHM Regional Grantee & Organization Network in Region D, Bexar County / San Antonio, with network filters and an organization detail panel.",
  },
  {
    kind: "custom",
    chapter: "Our offering",
    title: "Your context. Not a template.",
    transcript: "We scope the data model, interface, and operating workflow around your organization, rather than asking your team to adapt to a generic product. Your people: Tasks · language · access. Your evidence: Data · geography · rules. Your operation: Workflow · ownership · updates. Customized by experts for public agencies, nonprofits, and mission-driven networks.",
  },
  {
    kind: "closing",
    chapter: "Let’s build",
    title: "Custom products. Expertly built.",
    transcript: "What should your expertise make possible? Bring a user need and a decision. Together, we scope the data, product, and quality criteria. Get this customized by experts for your need. People. Places. Progress. Explore the chatbot. Device artwork shows an assistant headed Turn expertise into impact, with Analyze a need, Scope a product, Explore data, and Draft a plan options. Better tools for brighter futures. Build what’s next.",
  },
];

export const originalSlides: SlideContent[] = originalPages.map((page) => ({
  kind: page.kind,
  chapter: page.chapter,
  title: page.title,
  transcript: page.transcript,
  notes: `${page.transcript}\n\nRebuilt from the original PDF with native text, shapes, and layout elements. Device illustrations remain separate images from the source. Figures and illustrative interfaces are reproduced as supplied, not independently verified. Download the rebuilt PDF for selectable text; edit the slide components to change the source.`,
  sources: [{ label: "Original 10-slide PDF", url: "/presentation/studio-original.pdf" }],
}));
