import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { type DeckVersion, type SlideContent } from "./content";

function Photo({ name = "people-working", className = "" }: { name?: string; className?: string }) {
  return <Image className={`human-photo ${className}`} src={`/presentation/${name}.jpg`} width={1800} height={1200} alt={name === "people-assistance" ? "Colleagues helping one another at computers, illustrative stock photography" : "People collaborating around laptops, illustrative stock photography"} unoptimized />;
}

export function Device({ type = "desktop", image }: { type?: "desktop" | "tablet" | "phone"; image?: string }) {
  return <div className={`device device-${type}`}><div className="device-screen"><Image src={image || `/presentation/clark-${type}.png`} alt={image ? "Actual MHM ecosystem interface capture" : `Actual Clark County assistant ${type} interface`} width={type === "desktop" ? 1440 : type === "tablet" ? 820 : 390} height={type === "desktop" ? 1000 : type === "tablet" ? 1100 : 844} unoptimized /></div>{type === "desktop" && <div className="device-foot" />}</div>;
}

function Title({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="editorial-heading"><p className="eyebrow">{label}</p><h2>{children}</h2></div>;
}

function Tags({ items }: { items: string[] }) {
  return <div className="editorial-tags">{items.map(item => <span key={item}>{item}</span>)}</div>;
}

function HumanProduct({ mhm = false }: { mhm?: boolean }) {
  return <div className="human-product"><Photo name={mhm ? "people-working" : "people-assistance"} /><div className="human-product-device"><Device image={mhm ? "/presentation/mhm-network.png" : undefined} /></div><span className="photo-disclosure">Illustrative photo + actual product screen</span></div>;
}

export function Slide({ slide, index, version }: { slide: SlideContent; index: number; version: DeckVersion }) {
  const dual = version === "studio";
  return <article className={`deck-slide editorial editorial-${slide.kind}`} aria-label={`Slide ${index + 1}: ${slide.title}`}>
    <div className="slide-top"><span>HR&A <span className="brand-divider">/</span> Tech & Society Studio</span><span>{slide.chapter}</span></div>

    {slide.kind === "cover" && <div className="studio-cover"><div className="studio-cover-copy"><p className="eyebrow">Custom digital products</p><h1>Tech &<br />Society<br /><span>Studio.</span></h1><p>Public purpose. Expertly built.</p></div><div className="studio-cover-photo"><Photo /><div className="cover-label">Built around people.<ArrowUpRight aria-hidden="true" /></div></div></div>}

    {slide.kind === "mission" && <div className="mission-composition"><div><Title label="Our mission">Make expertise<br /><span>useful.</span></Title><p className="mission-line">Complex public challenges.<br />Tools people can use.</p><div className="mission-promises"><span>Custom fit.</span><span>Expert-led.</span><span>Quality built in.</span></div></div><Photo name="people-assistance" /></div>}

    {slide.kind === "expertise" && <><Title label="The HR&A advantage">Expertise<br /><span>before code.</span></Title><div className="expertise-proof"><div><span>New York</span><h3>Broadband<br />implementation.</h3><p>ConnectALL</p></div><div><span>Texas</span><h3>Digital<br />opportunity.</h3><p>Statewide planning</p></div><div><span>Rhode Island</span><h3>Shared<br />data foundations.</h3><p>Land use & zoning</p></div></div></>}

    {slide.kind === "method" && <><Title label="An expert-led delivery approach">Understand. Build. <span>Prove.</span></Title><div className="method-sequence">{[{ title: "Understand", text: "People + purpose", sub: "Define the right problem." }, { title: "Build", text: "Data + design", sub: "Tailor the whole experience." }, { title: "Prove", text: "Experts + users", sub: "Test. Refine. Steward." }].map((step, i) => <div key={step.title}><span className="method-number">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p><span>{step.sub}</span></div>)}</div><div className="qa-ribbon"><strong>QA throughout</strong><span>Accuracy</span><span>Accessibility</span><span>Privacy</span><span>Usability</span></div></>}

    {slide.kind === "quality" && <div className="quality-composition"><Title label="Quality assurance">Quality is a<br /><span>design decision.</span></Title><div className="quality-checks">{[{ title: "Accurate", text: "Source checks. Expert review." }, { title: "Accessible", text: "Keyboard. Screen reader. Contrast." }, { title: "Responsible", text: "Privacy. Security. Clear limits." }, { title: "Useful", text: "Real tasks. User testing." }].map(item => <div key={item.title}><Check aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.text}</p></div></div>)}</div><p className="quality-caption">Agreed criteria. Documented checks. Retesting.</p></div>}

    {slide.kind === "evidence" && <><Title label="Expert-led data design">Useful answers<br /><span>start here.</span></Title><div className="evidence-pipeline">{[{ title: "Source", text: "The right evidence" }, { title: "Structure", text: "A usable model" }, { title: "Validate", text: "Expert judgment" }, { title: "Steward", text: "Named ownership" }].map((item, i) => <div key={item.title}><div className="evidence-sheets" aria-hidden="true">{i === 0 ? "Sources" : i === 1 ? "Definitions" : i === 2 ? "Review" : "Updates"}</div><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></>}

    {slide.kind === "clark-intro" && <div className="case-intro"><div className="case-intro-copy"><p className="eyebrow">Clark County, Nevada</p><h2>A clearer<br />way to<br /><span>connect.</span></h2><p>Digital Equity Assistant</p><Tags items={["Internet", "Skills", "Devices"]} /></div><div className="case-intro-visual"><Photo name="people-assistance" /><div className="case-intro-screen"><Device type="tablet" /></div></div></div>}

    {slide.kind === "clark-features" && <><Title label="Clark County / The experience">A task. A place. <span>A next step.</span></Title><div className="product-feature-stage"><div className="large-product-capture"><Image src="/presentation/clark-desktop.png" width={1440} height={1000} alt="Clark County assistant with three starting tasks, English/Spanish selection, and a short guide" unoptimized /></div><div className="feature-rail"><div><h3>Start simply.</h3><p>Three clear tasks.</p></div><div><h3>Make it local.</h3><p>Address-based lookup.</p></div><div><h3>Move forward.</h3><p>Relevant resources.</p></div><span className="language-label">English / Español</span></div></div></>}

    {slide.kind === "clark-people" && <><div className="context-heading"><Title label="Clark County / The human context">Support the <span>conversation.</span></Title><p>Built for staff.<br />In service of residents.</p></div><HumanProduct /><Tags items={["Local programs", "Guided questions", "Human judgment"]} /></>}

    {slide.kind === "devices" && <><Title label="One responsive product">Where the <span>work happens.</span></Title><div className="device-lineup"><figure><Device /><figcaption>At the desk</figcaption></figure><figure><Device type="tablet" /><figcaption>Side by side</figcaption></figure><figure><Device type="phone" /><figcaption>In the community</figcaption></figure></div></>}

    {slide.kind === "custom" && <><Title label="Customization is the offering">Your context.<br /><span>Not a template.</span></Title><div className="custom-grid">{[{ title: "Your people", text: "Tasks · language · access" }, { title: "Your evidence", text: "Data · geography · rules" }, { title: "Your operation", text: "Workflow · ownership · updates" }].map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></>}

    {slide.kind === "mhm-intro" && <div className="mhm-intro-layout"><div><p className="eyebrow">MHM / Regional ecosystem mapping</p><h2>See the network.<br /><span>See the<br />opportunity.</span></h2><p>Organizations. Relationships. Regions.</p></div><div className="network-hero"><Image src="/presentation/mhm-network.png" width={1440} height={1000} alt="Actual MHM network in Bexar County, showing connected grantees and partner organizations" unoptimized /></div></div>}

    {slide.kind === "mhm-detail" && <><Title label="MHM / The experience">From the ecosystem<br /><span>to the organization.</span></Title><div className="mhm-detail-layout"><div className="mhm-detail-capture"><Image src="/presentation/mhm-detail.png" width={1440} height={1000} alt="Actual MHM Community Tech Network detail panel with grant information, KPI reporting, and regional connections" unoptimized /></div><div className="feature-rail"><div><h3>Explore.</h3><p>Regions & relationships.</p></div><div><h3>Focus.</h3><p>Services & grantee status.</p></div><div><h3>Understand.</h3><p>Funding & reported reach.</p></div></div></div></>}

    {slide.kind === "mhm-people" && <><div className="context-heading"><Title label="MHM / The human context">A shared picture.<br /><span>A better discussion.</span></Title><p>For program teams<br />and their partners.</p></div><HumanProduct mhm /><Tags items={["Regional context", "Connected organizations", "Reported evidence"]} /></>}

    {slide.kind === "closing" && <div className="editorial-closing"><p className="eyebrow">Custom products. Expertly built.</p><h2>What should<br />your expertise<br /><span>make possible?</span></h2><div className="closing-links"><a href="/" target="_blank" rel="noreferrer">Explore the chatbot <ArrowUpRight size={20} /></a>{dual && <a href="https://mhm-ecosystem-mapping.vercel.app" target="_blank" rel="noreferrer">Explore MHM <ArrowUpRight size={20} /></a>}</div><p>Start with the people. Build for the purpose.<ArrowRight aria-hidden="true" /></p></div>}

    <div className="slide-bottom"><span>{slide.kind === "cover" ? dual ? "Studio + two product stories" : "Studio + Clark County" : "Expertise × Customization × Quality"}</span><span>{String(index + 1).padStart(2, "0")}</span></div>
  </article>;
}
