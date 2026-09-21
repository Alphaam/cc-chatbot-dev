import Image from "next/image";
import { Accessibility, ArrowDown, ArrowRight, BarChart3, Check, Code2, Database, FileText, Globe2, GraduationCap, Laptop, LockKeyhole, Monitor, Network, RefreshCw, Search, Settings2, Shield, ShieldCheck, SlidersHorizontal, Target, Users, Wrench, type LucideIcon } from "lucide-react";
import type { SlideContent } from "./content";

function Icon({ icon: Glyph }: { icon: LucideIcon }) {
  return <span className="rebuilt-icon"><Glyph aria-hidden="true" strokeWidth={1.7} /></span>;
}

function Artwork({ name, alt }: { name: string; alt: string }) {
  return <Image className="rebuilt-artwork" src={`/presentation/artwork-${name}.png`} alt={alt} width={1100} height={750} loading="eager" unoptimized />;
}

function Heading({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return <div className="rebuilt-heading"><p className="eyebrow">{label}</p><h2>{children}</h2>{description && <p className="rebuilt-description">{description}</p>}</div>;
}

function Item({ title, text, icon }: { title: string; text: string; icon: LucideIcon }) {
  return <div className="rebuilt-item"><Icon icon={icon} /><div><h3>{title}</h3><p>{text}</p></div></div>;
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

function Clark() {
  return <div className="rebuilt-split rebuilt-case-layout"><div className="rebuilt-copy"><Heading label="Case study">A clearer<br />way to<br /><span>connect.</span></Heading><p className="rebuilt-case-label">Guided service navigation <span>|</span> Clark County Digital Equity Assistant</p><p className="rebuilt-description">The assistant helps county staff and partners find internet, training, and device resources for residents.</p><div className="rebuilt-services">{[{ title: "Internet", icon: Globe2 }, { title: "Skills", icon: GraduationCap }, { title: "Devices", icon: Laptop }].map(item => <div key={item.title}><Icon icon={item.icon} /><span>{item.title}</span></div>)}</div><div className="rebuilt-badges"><span><Monitor aria-hidden="true" />Responsive web product</span><span><Globe2 aria-hidden="true" />English / Español interface</span></div></div><Artwork name="clark" alt="Original Clark County Digital Equity Assistant illustrations on desktop, tablet, and phone. Internet plans, digital skills training, and free or low-cost devices." /></div>;
}

function Ecosystem() {
  return <div className="rebuilt-split rebuilt-network-layout"><div className="rebuilt-copy"><Heading label="Case study">See the network.<br /><span>See the opportunity.</span></Heading><p className="rebuilt-case-label">Ecosystem intelligence <span>|</span> Regional grantee & organization network</p><p className="rebuilt-description">An interactive network tool helps foundations, intermediaries, and partners understand organizations, relationships, and areas of service.</p><div className="rebuilt-network-benefits">{[{ title: "Explore organizations", icon: Search }, { title: "Understand connections", icon: Network }, { title: "Inform coordination and investment", icon: BarChart3 }].map(item => <div key={item.title}><Icon icon={item.icon} /><span>{item.title}</span></div>)}</div></div><Artwork name="network" alt="Original MHM Regional Grantee & Organization Network illustrations showing Region D, Bexar County / San Antonio, network filters, and an organization detail panel." /></div>;
}

function Offering() {
  const items = [
    { title: "Your people", text: "Tasks · language · access", icon: Users },
    { title: "Your evidence", text: "Data · geography · rules", icon: Database },
    { title: "Your operation", text: "Workflow · ownership · updates", icon: Settings2 },
  ];
  return <><Heading label="Our offering" description="We scope the data model, interface, and operating workflow around your organization, rather than asking your team to adapt to a generic product.">Your context.<br /><span>Not a template.</span></Heading><div className="rebuilt-offering-grid">{items.map(item => <Item {...item} key={item.title} />)}</div><p className="rebuilt-offering-note">Customized by experts for public agencies, nonprofits, and mission-driven networks.</p></>;
}

function Closing() {
  return <div className="rebuilt-split rebuilt-closing-layout"><div className="rebuilt-copy"><Heading label="Let’s build">Custom<br />products.<br /><span>Expertly built.</span></Heading><h3>What should your expertise make possible?</h3><p className="rebuilt-description">Bring a user need and a decision. Together, we scope the data, product, and quality criteria.</p><p className="rebuilt-callout"><ArrowRight aria-hidden="true" />Get this customized by experts for your need.</p></div><Artwork name="closing" alt="Original laptop, tablet, and phone illustrations: Turn expertise into impact; Better tools for brighter futures; Build what’s next." /></div>;
}

const bodies = [Cover, Mission, Expertise, Method, Quality, Solutions, Clark, Ecosystem, Offering, Closing];

export function RebuiltSlide({ slide, index }: { slide: SlideContent; index: number }) {
  const Body = bodies[index];
  return <article className={`deck-slide rebuilt rebuilt-${slide.kind}`} aria-label={`Slide ${index + 1}: ${slide.title}`}>
    <header className="rebuilt-top"><span>HR&A <span className="brand-divider">/</span> Tech & Society Studio</span>{slide.kind === "method" && <span>Our methodology</span>}</header>
    <div className="rebuilt-body"><Body /></div>
    <footer className="rebuilt-bottom"><span>{index === 0 ? "Studio + Product Systems" : index === 9 ? <a href="/" target="_blank" rel="noreferrer">Explore the chatbot</a> : "Expertise × Customization × Quality"}</span><span>{String(index + 1).padStart(2, "0")} / 10</span></footer>
  </article>;
}
