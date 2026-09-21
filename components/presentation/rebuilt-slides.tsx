import Image from "next/image";
import { Accessibility, ArrowDown, ArrowRight, BarChart3, Building2, Check, Code2, Coins, Compass, Database, Eye, FileText, Filter, Globe2, GraduationCap, Handshake, Laptop, Layers, Link2, LockKeyhole, MapPin, MessageSquare, Monitor, Network, PieChart, RefreshCw, Route, Search, Settings2, Shield, ShieldCheck, SlidersHorizontal, Target, Users, Wrench, type LucideIcon } from "lucide-react";
import type { SlideContent } from "./content";

function Icon({ icon: Glyph }: { icon: LucideIcon }) {
  return <span className="rebuilt-icon"><Glyph aria-hidden="true" strokeWidth={1.7} /></span>;
}

function Artwork({ name, alt }: { name: string; alt: string }) {
  return <Image className="rebuilt-artwork" src={`/presentation/artwork-${name}.png`} alt={alt} width={1100} height={750} loading="eager" unoptimized />;
}

const frameDims: Record<string, [number, number]> = { phone: [390, 844], tablet: [820, 1100], desktop: [1440, 1000] };

function Frame({ type, image, alt }: { type: "phone" | "tablet" | "desktop"; image: string; alt: string }) {
  const [w, h] = frameDims[type];
  return <figure className={`rframe rframe-${type}`}>
    <div className="rframe-screen">{type === "phone" && <span className="rframe-island" aria-hidden="true" />}<Image src={image} alt={alt} width={w} height={h} loading="eager" unoptimized /></div>
    {type === "desktop" && <div className="rframe-stand" aria-hidden="true"><span /><i /></div>}
  </figure>;
}

function Photo({ name, alt }: { name: string; alt: string }) {
  return <Image className="rebuilt-photo" src={`/presentation/${name}.jpg`} alt={alt} width={1500} height={1000} loading="eager" unoptimized />;
}

function Heading({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return <div className="rebuilt-heading"><p className="eyebrow">{label}</p><h2>{children}</h2>{description && <p className="rebuilt-description">{description}</p>}</div>;
}

function Item({ title, text, icon }: { title: string; text: string; icon: LucideIcon }) {
  return <div className="rebuilt-item"><Icon icon={icon} /><div><h3>{title}</h3><p>{text}</p></div></div>;
}

function Rail({ items }: { items: { title: string; text: string }[] }) {
  return <ol className="rebuilt-rail">{items.map((item, i) => <li key={item.title}><span className="rebuilt-rail-number">{i + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>;
}

function Cover() {
  return <div className="rebuilt-split rebuilt-cover-layout"><div className="rebuilt-copy"><p className="eyebrow">The studio</p><h1>Tech &<br />Society<br /><span>Studio.</span></h1><div><p className="rebuilt-subtitle">Custom digital products. Expertly built.</p><p className="rebuilt-description">We turn public-interest expertise into custom digital tools for the people who put it to work.</p></div><p className="rebuilt-callout"><ArrowRight aria-hidden="true" />Built around people.</p></div><Artwork name="cover" alt="Original laptop, tablet, and phone illustrations of public-interest digital products, with People, Places, and Progress books." /></div>;
}

function Mission() {
  const promises = [
    { title: "Custom fit.", text: "Not off the shelf.", icon: SlidersHorizontal },
    { title: "Expert-led.", text: "From discovery onward.", icon: Users },
    { title: "Quality.", text: "Tested against agreed criteria.", icon: ShieldCheck },
  ];
  const metrics = [
    { value: "$1.5B+", title: "New York ConnectALL", text: "Investment supported by HR&A as lead strategic advisor and program manager." },
    { value: "39", title: "Rhode Island municipalities", text: "Land-use datasets standardized with state planners and Go Consulting Services." },
    { value: ">35%", title: "U.S. population", text: "Served by HR&A’s broadband and digital-opportunity clients." },
  ];
  return <div className="rebuilt-mission-layout"><Heading label="Our mission" description="We pair policy and program expertise with data, design, and development to build tools around your decisions, users, and operating realities.">Make<br />expertise<br /><span>useful.</span></Heading><div className="rebuilt-mission-evidence"><div className="rebuilt-promises">{promises.map(item => <section className="rebuilt-card" key={item.title}><Icon icon={item.icon} /><h3>{item.title}</h3><p>{item.text}</p></section>)}</div><div className="rebuilt-metrics">{metrics.map(item => <section className="rebuilt-card" key={item.value}><strong>{item.value}</strong><h3>{item.title}</h3><p>{item.text}</p></section>)}</div><p className="rebuilt-fineprint">Program scale, not product impact.</p></div></div>;
}

function Expertise() {
  const items = [
    { title: "Public-interest fluency", text: "Broadband, digital equity, policy, and service systems.", icon: Users },
    { title: "Product thinking", text: "Decisions, workflows, and user tasks.", icon: FileText },
    { title: "Data design", text: "Definitions, stewardship, validation, and updates.", icon: BarChart3 },
    { title: "Technical delivery", text: "Modern frontend, accessibility, QA, and secure implementation.", icon: Code2 },
  ];
  return <><Heading label="Our advantage" description="We design digital tools from the realities of policy, service delivery, and public-interest operations.">Expertise <span>before code.</span></Heading><div className="rebuilt-expertise-grid">{items.map(item => <section className="rebuilt-card" key={item.title}><Icon icon={item.icon} /><h3>{item.title}</h3><p>{item.text}</p></section>)}</div><div className="rebuilt-convergence" aria-hidden="true"><span /><span /><span /><span /></div><ArrowDown className="rebuilt-down" aria-hidden="true" /><p className="rebuilt-result"><Check aria-hidden="true" />Working digital products for real-world use.</p></>;
}

function Method() {
  const steps = [
    { title: "Understand", subtitle: "People + purpose", text: "Map user tasks, source data, and constraints." },
    { title: "Build", subtitle: "Data + design", text: "Prototype a workflow around your program." },
    { title: "Prove", subtitle: "Experts + users", text: "Test priority tasks; assign update ownership." },
  ];
  const checks = [{ title: "Frontend", icon: Monitor }, { title: "Data model", icon: Database }, { title: "QA", icon: Search }, { title: "Accessibility", icon: Accessibility }, { title: "Privacy", icon: Shield }, { title: "Usability", icon: BarChart3 }];
  return <><Heading label="Our methodology" description="An expert-led delivery approach: agree the problem, build with domain experts, and validate before handoff.">Understand. Build. <span>Prove.</span></Heading><div className="rebuilt-method-grid">{steps.map((item, i) => <section key={item.title}><span className="rebuilt-step-number">0{i + 1}</span><h3>{item.title}</h3><h4>{item.subtitle}</h4><p>{item.text}</p></section>)}</div><div className="rebuilt-check-ribbon">{checks.map(({ title, icon: Glyph }) => <span key={title}><Glyph aria-hidden="true" />{title}</span>)}</div></>;
}

function Quality() {
  const foundation = [
    { title: "Records", text: "source the right evidence", icon: FileText },
    { title: "Definitions", text: "structure a usable model", icon: Database },
    { title: "Checks", text: "validate with expert judgment", icon: ShieldCheck },
    { title: "Updates", text: "assign named ownership", icon: RefreshCw },
  ];
  const standards = [
    { title: "Accurate", text: "source checks and expert review", icon: Target },
    { title: "Accessible", text: "keyboard, screen reader, contrast", icon: Accessibility },
    { title: "Responsible", text: "privacy, security, clear limits", icon: LockKeyhole },
    { title: "Useful", text: "real tasks and user testing", icon: Users },
    { title: "Responsive", text: "works across desktop, tablet, and phone", icon: Monitor },
    { title: "Maintainable", text: "clear ownership and update paths", icon: Wrench },
  ];
  return <div className="rebuilt-quality-layout"><Heading label="How we build" description="Useful tools depend on strong data design, careful QA, and accessible, responsible implementation.">Quality is a<br /><span>design decision.</span></Heading><section className="rebuilt-foundation"><h3>The data foundation</h3><div>{foundation.map(item => <Item {...item} key={item.title} />)}</div></section><section className="rebuilt-standards"><h3>The build standard</h3><div>{standards.map(item => <Item {...item} key={item.title} />)}</div><p className="rebuilt-fineprint">Accessibility is tested, not assumed.</p></section></div>;
}

function Solutions() {
  const patterns = [
    { title: "Guided service navigation", text: "Connect residents or staff to the right local resource.", icon: Users, image: "navigation", alt: "Original resource navigation device illustration." },
    { title: "Ecosystem intelligence", text: "Understand organizations, relationships, and service networks.", icon: Network, image: "ecosystem", alt: "Original organization network device illustration." },
    { title: "Decision-support dashboards", text: "Organize evidence for planning, coordination, and action.", icon: BarChart3, image: "dashboard", alt: "Original regional impact dashboard device illustration." },
  ];
  return <><Heading label="Our solutions">Proven product patterns.<br /><span>Adapted to your context.</span></Heading><div className="rebuilt-solutions-grid">{patterns.map(item => <section className="rebuilt-card" key={item.title}><Artwork name={item.image} alt={item.alt} /><Item {...item} /></section>)}</div><p className="rebuilt-pattern-note"><strong>Not a template.</strong> A starting pattern customized to your people, evidence, and operating model.</p></>;
}

function ClarkIntro() {
  return <div className="rebuilt-split rebuilt-caseintro-layout"><div className="rebuilt-copy"><Heading label="Case study 01 · Clark County">A clearer<br />way to<br /><span>connect.</span></Heading><p className="rebuilt-case-label">Guided service navigation <span>|</span> Clark County Digital Equity Assistant</p><p className="rebuilt-description">The assistant helps county staff and partners find internet, training, and device resources for residents.</p><div className="rebuilt-services">{[{ title: "Internet", icon: Globe2 }, { title: "Skills", icon: GraduationCap }, { title: "Devices", icon: Laptop }].map(item => <div key={item.title}><Icon icon={item.icon} /><span>{item.title}</span></div>)}</div><div className="rebuilt-badges"><span><Monitor aria-hidden="true" />Responsive web product</span><span><Globe2 aria-hidden="true" />English / Español interface</span></div></div><div className="rebuilt-devicestage rebuilt-devicestage-clark"><Frame type="desktop" image="/presentation/clark-desktop.png" alt="Clark County Digital Equity Assistant on a desktop browser, actual application screenshot." /><Frame type="phone" image="/presentation/clark-phone.png" alt="Clark County Digital Equity Assistant on a phone, actual application screenshot." /></div></div>;
}

function ClarkLogic() {
  const steps = [
    { title: "Need", text: "Internet, skills, or devices", icon: MessageSquare },
    { title: "Place", text: "Confirm the resident’s location", icon: MapPin },
    { title: "Match", text: "Surface relevant local options", icon: Search },
    { title: "Referral", text: "Review providers and next steps", icon: Handshake },
  ];
  return <><Heading label="The product logic" description="The assistant turns a broad service problem into a short, legible path staff can use in real time.">From a resident’s need<br /><span>to relevant support.</span></Heading><div className="rebuilt-flow-layout"><ol className="rebuilt-flow">{steps.map((step, i) => <li key={step.title}><section className="rebuilt-card"><span className="rebuilt-flow-number">{i + 1}</span><Icon icon={step.icon} /><h3>{step.title}</h3><p>{step.text}</p></section>{i < steps.length - 1 && <ArrowRight className="rebuilt-flow-arrow" aria-hidden="true" />}</li>)}</ol><aside className="rebuilt-why"><p className="eyebrow">Why it works</p><h3>It reduces the search burden.</h3><p>Staff start with the person’s need and place, then move toward a practical referral.</p></aside></div><p className="rebuilt-guardrail"><strong>Guardrail</strong> The tool supports referrals. Providers confirm availability and eligibility; staff retain judgment.</p></>;
}

function ClarkFeatures() {
  const items = [
    { title: "Start simply", text: "Three clear entry points: internet, skills, or devices." },
    { title: "Make it local", text: "An address guides the search toward relevant local resources." },
    { title: "Move forward", text: "Show options and provider contacts that support a referral." },
    { title: "Design for access", text: "English / Español plus one responsive web experience." },
  ];
  return <><Heading label="The frontend experience" description="The interface is organized around the work staff need to do, rather than the structure of the underlying data.">A task. A place. <span>A next step.</span></Heading><div className="rebuilt-feature-layout"><div className="rebuilt-devicestage rebuilt-devicestage-feature"><Frame type="tablet" image="/presentation/clark-tablet.png" alt="Clark County assistant on a tablet, actual application screenshot." /><Frame type="phone" image="/presentation/clark-phone.png" alt="Clark County assistant on a phone, actual application screenshot." /></div><Rail items={items} /></div></>;
}

function ClarkPeople() {
  const items = [
    { title: "Local programs", text: "Surface relevant resources.", icon: Building2 },
    { title: "Guided questions", text: "Turn a need into a usable pathway.", icon: Compass },
    { title: "Human judgment", text: "Keep staff in control of the referral.", icon: Handshake },
  ];
  return <div className="rebuilt-split rebuilt-people-layout"><div className="rebuilt-copy"><Heading label="In context" description="Staff can guide a resident through focused questions, discuss relevant options, and make the next step clearer. The product supports human judgment rather than replacing it.">Support the<br /><span>conversation.</span></Heading><div className="rebuilt-people-items">{items.map(item => <Item {...item} key={item.title} />)}</div></div><div className="rebuilt-photostage"><Photo name="people-oneonone" alt="A county caseworker helping a resident look at a phone together, illustrative stock photography." /><div className="rebuilt-photostage-phone"><Frame type="phone" image="/presentation/clark-phone.png" alt="Clark County assistant on a phone, actual application screenshot." /></div><span className="rebuilt-photo-note">Illustrative stock photo · actual interface</span></div></div>;
}

function Devices() {
  const lineup = [
    { type: "desktop" as const, image: "clark-desktop", caption: "At the desk", sub: "Detailed search and referral work." },
    { type: "tablet" as const, image: "clark-tablet", caption: "Side by side", sub: "Shared conversation with a resident." },
    { type: "phone" as const, image: "clark-phone", caption: "In the community", sub: "Portable access during outreach." },
  ];
  return <><Heading label="One responsive web product" description="The same web product works across desktop, tablet, and phone so staff can use it at a desk, side by side with a resident, or in the field.">Where the <span>work happens.</span></Heading><div className="rebuilt-lineup">{lineup.map(item => <figure key={item.caption}><Frame type={item.type} image={`/presentation/${item.image}.png`} alt={`Clark County assistant on a ${item.type}, actual application screenshot.`} /><figcaption><strong>{item.caption}</strong><span>{item.sub}</span></figcaption></figure>)}</div><p className="rebuilt-fineprint">Build standard: responsive layout · keyboard usability · readable contrast · English / Español interface.</p></>;
}

function ClarkData() {
  const steps = [
    { title: "Source", text: "Program records, service categories, provider details, and geography.", icon: FileText },
    { title: "Structure", text: "Common fields and definitions so resources can be compared.", icon: Database },
    { title: "Validate", text: "Providers confirm availability and eligibility; staff can flag issues.", icon: ShieldCheck },
    { title: "Steward", text: "Named ownership and update paths keep the directory usable.", icon: RefreshCw },
  ];
  return <><Heading label="Data foundation" description="The product is only as useful as the information behind it. The operating model defines what gets stored, who validates it, and how it stays current.">A living service directory<br /><span>needs governance.</span></Heading><div className="rebuilt-data-grid">{steps.map((step, i) => <section className="rebuilt-card" key={step.title}><span className="rebuilt-step-number">0{i + 1}</span><Icon icon={step.icon} /><h3>{step.title}</h3><p>{step.text}</p></section>)}</div><p className="rebuilt-guardrail"><strong>The principle</strong> The tool supports referrals. It does not assert that a resident is eligible or that a provider has current availability.</p></>;
}

function MhmIntro() {
  return <div className="rebuilt-split rebuilt-network-layout"><div className="rebuilt-copy"><Heading label="Case study 02 · MHM ecosystem">See the network.<br /><span>See the opportunity.</span></Heading><p className="rebuilt-case-label">Ecosystem intelligence <span>|</span> Regional grantee & organization network</p><p className="rebuilt-description">MHM’s ecosystem tool turns a regional set of organizations, grants, services, and relationships into an interactive view program teams can explore.</p><div className="rebuilt-network-benefits">{[{ title: "Organizations", icon: Building2 }, { title: "Connections", icon: Network }, { title: "Services", icon: Layers }, { title: "Funding", icon: Coins }].map(item => <div key={item.title}><Icon icon={item.icon} /><span>{item.title}</span></div>)}</div></div><div className="rebuilt-devicestage rebuilt-devicestage-network"><Frame type="desktop" image="/presentation/mhm-network.png" alt="MHM Regional Grantee & Organization Network for Region D, Bexar County / San Antonio, actual application screenshot." /></div></div>;
}

function MhmRationale() {
  return <><Heading label="The problem & approach">See the relationships,<br /><span>not just the records.</span></Heading><div className="rebuilt-rationale-layout"><div className="rebuilt-rationale-copy"><section className="rebuilt-card"><h3>The problem</h3><p>Understanding a regional ecosystem means seeing who provides which services, where they work, how funding flows, and how organizations connect.</p></section><section className="rebuilt-card"><h3>Why this solution</h3><p>An interactive network makes those relationships visible. Filters and organization details connect the wider picture to funding, reported reach, and service focus.</p></section></div><div className="rebuilt-devicestage rebuilt-devicestage-rationale"><Frame type="desktop" image="/presentation/mhm-network.png" alt="MHM ecosystem network view, actual application screenshot." /></div></div><p className="rebuilt-fineprint">Supports exploration. Available data is a partial operating picture, not audited impact.</p></>;
}

function MhmModel() {
  const nodes = [
    { title: "Region", text: "Where it operates", icon: MapPin },
    { title: "Service type", text: "What it provides", icon: Layers },
    { title: "Grant", text: "Funding + period", icon: Coins },
    { title: "Relationship", text: "Who it connects to", icon: Link2 },
    { title: "Reported reach", text: "What is reported", icon: PieChart },
  ];
  return <><Heading label="The interface sits on a relational model" description="The tool connects different kinds of evidence so users can move from a regional pattern to the organizations and records behind it.">A data model built for<br /><span>ecosystem questions.</span></Heading><div className="rebuilt-model"><div className="rebuilt-model-hub"><Network aria-hidden="true" /><strong>Organization</strong><span>The record at the center</span></div><div className="rebuilt-model-grid">{nodes.map(node => <section className="rebuilt-card" key={node.title}><Icon icon={node.icon} /><h3>{node.title}</h3><p>{node.text}</p></section>)}</div></div><p className="rebuilt-fineprint">This structure supports regional filters, organization detail views, and relationship analysis.</p></>;
}

function MhmDetail() {
  const items = [
    { title: "Explore", text: "Compare regional relationships across the network." },
    { title: "Focus", text: "Filter by service type and grantee status." },
    { title: "Understand", text: "Open an organization to see the records behind the node." },
  ];
  return <><Heading label="From ecosystem to organization" description="Users can filter the network, select an organization, and review grant context, reported reach, and connections without leaving the workflow.">Explore. Focus. <span>Understand.</span></Heading><div className="rebuilt-feature-layout rebuilt-feature-layout-wide"><div className="rebuilt-devicestage rebuilt-devicestage-detail"><Frame type="desktop" image="/presentation/mhm-detail.png" alt="MHM organization detail panel with funding, reporting, and connections, actual application screenshot." /></div><Rail items={items} /></div></>;
}

function MhmPeople() {
  const items = [
    { title: "Find partners", text: "Identify organizations connected to the same service area or network.", icon: Handshake },
    { title: "See concentration", text: "Spot where services, grantees, or relationships cluster.", icon: Filter },
    { title: "Investigate gaps", text: "Frame questions about missing or weakly connected capacity.", icon: Route },
    { title: "Ground discussion", text: "Move from an abstract picture to specific organizations.", icon: Eye },
  ];
  return <div className="rebuilt-split rebuilt-people-layout"><div className="rebuilt-copy"><Heading label="A shared picture for better discussion" description="The network helps teams ask better questions. It should inform discussion, coordination, and follow-up rather than automate funding or performance judgments.">Designed for exploration,<br /><span>not automated decisions.</span></Heading><div className="rebuilt-people-grid">{items.map(item => <Item {...item} key={item.title} />)}</div></div><div className="rebuilt-photostage"><Photo name="people-planning" alt="A program team reviewing an ecosystem view together on a monitor, illustrative stock photography." /><span className="rebuilt-photo-note">Illustrative stock photo · shared exploration</span></div></div>;
}

function Closing() {
  const tools = [
    { title: "Guided service navigation", text: "When people need to move from a need and place to a practical next step across fragmented programs.", adapt: "Public agencies · service networks · digital opportunity programs", icon: Compass },
    { title: "Ecosystem intelligence", text: "When teams need a shared view of organizations, relationships, funding, services, or regional capacity.", adapt: "Intermediaries · foundations · regional collaboratives · networks", icon: Network },
  ];
  return <div className="rebuilt-closing-layout"><div className="rebuilt-copy"><Heading label="Our offering">Two tools.<br /><span>A broader capability.</span></Heading><p className="rebuilt-description">Clark County and MHM show different product patterns built from one studio capability: domain expertise, data design, frontend delivery, QA, and responsible implementation.</p><p className="rebuilt-callout"><ArrowRight aria-hidden="true" />Custom products. Expertly built.</p></div><div className="rebuilt-closing-tools">{tools.map(tool => <section className="rebuilt-card" key={tool.title}><Icon icon={tool.icon} /><h3>{tool.title}</h3><p>{tool.text}</p><span className="rebuilt-adapt">{tool.adapt}</span></section>)}<p className="rebuilt-closing-cta"><Settings2 aria-hidden="true" />Bring us the user, the decision, and the operating context. We will scope the product around your need.</p></div></div>;
}

const bodies = [Cover, Mission, Expertise, Method, Quality, Solutions, ClarkIntro, ClarkLogic, ClarkFeatures, ClarkPeople, Devices, ClarkData, MhmIntro, MhmRationale, MhmModel, MhmDetail, MhmPeople, Closing];

export function RebuiltSlide({ slide, index }: { slide: SlideContent; index: number }) {
  const Body = bodies[index];
  const total = bodies.length;
  const footer = index === 0 ? "Studio + Product Systems"
    : index === total - 1 ? <a href="/" target="_blank" rel="noreferrer">Explore the chatbot</a>
    : index >= 6 && index <= 11 ? "Case study 01 · Clark County Digital Equity Assistant"
    : index >= 12 && index <= 16 ? "Case study 02 · MHM ecosystem intelligence"
    : "Expertise × Customization × Quality";
  return <article className={`deck-slide rebuilt rebuilt-${slide.kind}`} aria-label={`Slide ${index + 1}: ${slide.title}`}>
    <header className="rebuilt-top"><span>HR&A <span className="brand-divider">/</span> Tech & Society Studio</span><span>{slide.chapter}</span></header>
    <div className="rebuilt-body"><Body /></div>
    <footer className="rebuilt-bottom"><span>{footer}</span><span>{String(index + 1).padStart(2, "0")} / {total}</span></footer>
  </article>;
}
