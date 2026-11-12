"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, MapPin, RotateCcw, SlidersHorizontal, Table2, UsersRound } from "lucide-react";
import ResourceCategories from "./ResourceCategories";
import ResourceHome from "./ResourceHome";
import ResourceConversation from "./ResourceConversation";
import { useResourceChat } from "./useResourceChat";
import { SharePanel } from "./SharePanel";
import ShareActions from "./ShareActions";
import ResidentNeeds from "./ResidentNeeds";
import ResultsTable from "./ResultsTable";
import PrintDialog from "./PrintDialog";
import WorkspacePanel, { ActionRail, type PanelView } from "./WorkspacePanel";
import HowToUse from "./HowToUse";
import ResourceMapLink from "./ResourceMapLink";
import WorkspaceMenu from "./WorkspaceMenu";
import { useResourceMapSession } from "./useResourceMapSession";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ChatInput, { type SendOptions } from "@/components/chat/ChatInput";
import SessionTimeout from "@/components/chat/SessionTimeout";
import ResetConfirmation from "@/components/chat/ResetConfirmation";
import { LanguageToggle, useLanguage } from "@/components/chat/LanguageProvider";
import { CATEGORIES, CATEGORY_LABELS, isAddressQuery, defaultShortlist, recommendationsText, resourcesFromLookup, type LookupResponse, type Resource, type ResourceCategory } from "@/lib/resource-finder";
import { EMPTY_NEEDS, hasNeeds, inferResourceFocus, sanitizeNeeds, splitResourceRequest, type ResidentNeeds as Needs, type ResourceFocus } from "@/lib/resident-needs";
import { printHtml, qrPayload, residentListDocument, shortenAnswer, type PrintedExchange } from "@/lib/resource-print";
import ResourceSection from "./ResourceSection";
import ReportIssue from "./ReportIssue";

type View = "chat" | "table";

function mentionedIn(text: string, resources: Resource[]) {
  const lower = text.toLowerCase();
  return resources.filter((resource) => {
    const names = [resource.name, resource.plan?.planName, resource.plan ? `${resource.plan.provider} ${resource.plan.planName}` : ""].filter((name): name is string => !!name && name.trim().length > 3);
    return names.some((name) => lower.includes(name.toLowerCase()));
  });
}

export default function ResourceFinder() {
  const { t, locale } = useLanguage();
  const { data: savedSession, mutate: saveMapSession } = useResourceMapSession();
  const [result, setResult] = useState<LookupResponse | null>(savedSession?.result ?? null);
  const [showHome, setShowHome] = useState(savedSession?.showHome ?? false);
  const [view, setView] = useState<View>(savedSession?.view ?? "chat");
  const [focus, setFocus] = useState<ResourceFocus>(savedSession?.focus ?? "all");
  const [needs, setNeeds] = useState<Needs>(savedSession?.needs ?? EMPTY_NEEDS);
  const [needsDraft, setNeedsDraft] = useState<Needs>(savedSession?.needsDraft ?? EMPTY_NEEDS);
  const chat = useResourceChat(result, focus, needs, savedSession?.messages);
  const clearChat = chat.clear;
  const [panel, setPanel] = useState<PanelView | null>(null);
  const [tourRequested, setTourRequested] = useState(false);
  const panelOpener = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const [pending, setPending] = useState<LookupResponse | null>(null);
  const [address, setAddress] = useState(savedSession?.address ?? "");
  const [needsAddress, setNeedsAddress] = useState(savedSession?.address ?? "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(savedSession?.selected ?? []));
  const [optOut, setOptOut] = useState<Set<string>>(new Set(savedSession?.optOut ?? []));
  const [hiddenCategories, setHiddenCategories] = useState<Set<ResourceCategory>>(new Set((savedSession?.hiddenCategories ?? []) as ResourceCategory[]));
  const [dismissed, setDismissed] = useState<Set<string>>(new Set(savedSession?.dismissed ?? []));
  const [report, setReport] = useState<Resource | "general" | null>(null);
  const [printing, setPrinting] = useState(false);
  const [session, setSession] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);
  const [skipResetPrompt, setSkipResetPrompt] = useState(false);
  const generation = useRef(0);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState({ text: "", revision: 0 });
  const request = useRef<AbortController | null>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const downloadLock = useRef(false);
  const lookupIntent = useRef({ question: "", scope: "all" as ResourceFocus, original: "", toTable: false });
  const [lastQuestion, setLastQuestion] = useState(savedSession?.lastQuestion ?? "");
  const [resultAnchor, setResultAnchor] = useState<string | null>(savedSession?.resultAnchor ?? null);
  const pendingAnchor = useRef<string | null>(null);
  const resources = useMemo(() => result ? resourcesFromLookup(result) : [], [result]);
  const autoSelected = useMemo(() => new Set(chat.messages.filter((message) => message.role === "assistant" && message.content && !message.incomplete).flatMap((message) => mentionedIn(message.content, resources).map((resource) => resource.id))), [chat.messages, resources]);
  const effectiveSelected = useMemo(() => new Set([...selected, ...[...autoSelected].filter((id) => !optOut.has(id))]), [selected, autoSelected, optOut]);
  const shortlist = resources.filter((resource) => effectiveSelected.has(resource.id) && !hiddenCategories.has(resource.category) && !dismissed.has(resource.id));
  const hasSession = !!result || chat.messages.length > 0;
  const home = showHome || !hasSession;
  const tableView = !home && view === "table" && !!result;
  const scopeLabel = focus === "all" ? "All resources" : CATEGORY_LABELS[focus];
  const categories = (focus === "all" ? CATEGORIES : CATEGORIES.filter((category) => category === focus)).slice().sort((a, b) => Number(!resources.some((resource) => resource.category === a)) - Number(!resources.some((resource) => resource.category === b)));
  const hasResidentNeeds = hasNeeds(needs);
  const hasConversation = chat.messages.some((message) => message.role === "assistant" && message.content);
  const mapSnapshot = { result, address, focus, needs, needsDraft, selected: [...effectiveSelected], messages: chat.messages, showHome, lastQuestion, resultAnchor, optOut: [...optOut], hiddenCategories: [...hiddenCategories], dismissed: [...dismissed], view };

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () => document.documentElement.style.setProperty("--bace-header-height", `${header.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty("--bace-header-height"); };
  }, []);

  const reset = useCallback(() => {
    clearChat();
    void saveMapSession(null, { revalidate: false });
    generation.current += 1;
    request.current?.abort();
    setResult(null); setPending(null); setAddress(""); setNeedsAddress(""); setFocus("all"); setShowHome(false); setView("chat");
    setNeeds(EMPTY_NEEDS); setNeedsDraft(EMPTY_NEEDS); setPanel(null);
    setSelected(new Set()); setOptOut(new Set()); setHiddenCategories(new Set()); setDismissed(new Set());
    setReport(null); setPrinting(false); setEditing(false); setBusy(false);
    setError(""); setLastQuery(""); setStatus(""); setResetOpen(false);
    setDraft({ text: "", revision: 0 });
    lookupIntent.current = { question: "", scope: "all", original: "", toTable: false };
    setLastQuestion("");
    pendingAnchor.current = null; setResultAnchor(null);
    setSession((value) => value + 1);
  }, [clearChat, saveMapSession]);

  function goHome() {
    setShowHome(true);
    setPanel(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function openPanel(view: PanelView, opener?: HTMLElement | null) {
    panelOpener.current = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    if (view !== "help") setTourRequested(false);
    setPanel(view);
  }

  function changeFocus(next: ResourceFocus) {
    if (chat.busy) chat.cancel();
    setFocus(next);
    setStatus(t("Now showing {type}. Previous replies are unchanged.", { type: t(next === "all" ? "All resources" : CATEGORY_LABELS[next]) }));
  }

  function jump(category: ResourceCategory) {
    setShowHome(false);
    setPanel(null);
    window.setTimeout(() => {
      const heading = document.getElementById(`${category}-title`) ?? document.getElementById(`table-${category}`);
      heading?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      heading?.focus({ preventScroll: true });
    }, 100);
  }

  function accept(data: LookupResponse, query: string) {
    generation.current += 1;
    const toTable = lookupIntent.current.toTable;
    setReport(null); setResult(data); setShowHome(false); setView(toTable ? "table" : "chat");
    const confirmed = data.address || data.confirmAddress || query;
    setAddress(confirmed); setNeedsAddress(confirmed);
    setFocus(lookupIntent.current.scope); setSelected(defaultShortlist(resourcesFromLookup(data)));
    setOptOut(new Set()); setHiddenCategories(new Set()); setDismissed(new Set());
    setEditing(false); setPending(null); setError(""); setStatus("");
    setResultAnchor(toTable ? null : pendingAnchor.current);
    requestAnimationFrame(() => {
      if (toTable) { window.scrollTo({ top: 0, behavior: "instant" }); document.getElementById("table-title")?.focus({ preventScroll: true }); }
      else resultsHeading.current?.focus({ preventScroll: true });
    });
    if (!toTable && lookupIntent.current.question) {
      void chat.send(lookupIntent.current.original || lookupIntent.current.question, { result: data, focus: lookupIntent.current.scope, replyOnly: !!pendingAnchor.current });
    }
    setLastQuestion("");
  }

  function send(text: string, options?: SendOptions) {
    if (busy || chat.busy) return;
    setShowHome(false);
    setDraft((value) => ({ text: "", revision: value.revision + 1 }));
    if (options?.addressSearch || options?.addressConfirmed || options?.exact || isAddressQuery(text)) {
      const parsed = splitResourceRequest(text);
      const question = parsed.question || lastQuestion;
      lookupIntent.current = { question, scope: question ? inferResourceFocus(question) : "all", original: parsed.question ? text : question ? `${question}\n${parsed.address}` : "", toTable: false };
      pendingAnchor.current = chat.addUserMessage(text.trim());
      void lookup(parsed.address, options);
      requestAnimationFrame(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    } else {
      setPending(null); setError("");
      if (!tableView) setView("chat");
      if (/find|help|near|available|resident|client|busc|ayud|cerca/i.test(text)) setLastQuestion(text);
      void chat.send(text);
      requestAnimationFrame(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    }
  }

  function sendFromInput(text: string, options: SendOptions | undefined, addressOnly: boolean) {
    if (addressOnly && tableView) {
      lookupIntent.current = { question: "", scope: "all", original: "", toTable: true };
      pendingAnchor.current = null;
      void lookup(splitResourceRequest(text).address || text, options);
      return;
    }
    send(text, addressOnly ? { ...options, addressSearch: true } : options);
  }

  function showNeedsResults() {
    if (chat.busy) chat.cancel();
    setNeeds(sanitizeNeeds(needsDraft));
    setPanel(null);
    const target = needsAddress.trim();
    if (result && target === address) { setShowHome(false); setView("table"); requestAnimationFrame(() => { window.scrollTo({ top: 0, behavior: "instant" }); document.getElementById("table-title")?.focus({ preventScroll: true }); }); return; }
    lookupIntent.current = { question: "", scope: "all", original: "", toTable: true };
    pendingAnchor.current = null;
    void lookup(target);
  }

  async function lookup(text: string, options?: SendOptions) {
    if (chat.busy) chat.cancel();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true); setError(""); setPending(null); setLastQuery(text);
    try {
      const response = await fetch("/api/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, exact: options?.exact }), signal: controller.signal });
      if (!response.ok) throw new Error("Lookup unavailable");
      const data: LookupResponse = await response.json();
      if (controller.signal.aborted) return;
      if (!data.validated) { setError("We could not locate that address. Include the street, city, state, and ZIP code."); return; }
      if (!options?.addressConfirmed && !options?.exact && data.confirmAddress) setPending(data);
      else accept(data, text);
    } catch {
      if (!controller.signal.aborted) setError("The lookup is unavailable right now. Please try again.");
    } finally { if (!controller.signal.aborted) setBusy(false); }
  }

  function toggle(id: string) {
    if (effectiveSelected.has(id)) {
      setSelected((current) => { const next = new Set(current); next.delete(id); return next; });
      if (autoSelected.has(id)) setOptOut((current) => new Set([...current, id]));
    } else {
      setSelected((current) => new Set([...current, id]));
      setOptOut((current) => { const next = new Set(current); next.delete(id); return next; });
      setDismissed((current) => { const next = new Set(current); next.delete(id); return next; });
    }
    setStatus("");
  }

  function shareResource(resource: Resource) {
    setSelected((current) => new Set([...current, resource.id]));
    openPanel("share");
  }

  function openTable() {
    setPanel(null); setShowHome(false); setView("table");
    requestAnimationFrame(() => { window.scrollTo({ top: 0, behavior: "instant" }); document.getElementById("table-title")?.focus({ preventScroll: true }); });
  }

  function removeCategory(category: ResourceCategory) {
    setHiddenCategories((current) => new Set([...current, category]));
    setStatus(t("{category} removed from the list.", { category: t(CATEGORY_LABELS[category]) }));
  }

  function restoreRemoved() {
    setHiddenCategories(new Set()); setDismissed(new Set());
    setStatus("Removed resources restored.");
  }

  async function download(includeAddress: boolean) {
    if (!shortlist.length || downloadLock.current) return;
    const activeGeneration = generation.current;
    downloadLock.current = true; setDownloading(true); setStatus("");
    try {
      const { createChatPdf, loadPdfFont } = await import("@/lib/chat-pdf");
      const pdf = createChatPdf(recommendationsText(shortlist, t, includeAddress ? address : undefined), await loadPdfFont(), t("Resident recommendations"));
      if (activeGeneration !== generation.current) return;
      const url = URL.createObjectURL(pdf.output("blob"));
      const link = document.createElement("a"); link.href = url; link.download = "bace-hub-resources.pdf"; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Recommendations PDF prepared.");
    } catch { if (activeGeneration === generation.current) setStatus("Download failed. Please try again."); }
    finally { setDownloading(false); downloadLock.current = false; }
  }

  function printArea() {
    const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join(", ") : t("Clark County");
  }

  async function printList({ includeConversation, preparedBy }: { includeConversation: boolean; preparedBy: string }) {
    if (!shortlist.length) return;
    let qrSvg: string | undefined;
    try {
      const QRCode = (await import("qrcode")).default;
      qrSvg = await QRCode.toString(qrPayload(shortlist, t), { type: "svg", margin: 0, errorCorrectionLevel: "L" });
    } catch { qrSvg = undefined; }
    const conversation: PrintedExchange[] = [];
    if (includeConversation) {
      chat.messages.forEach((message, index) => {
        const reply = chat.messages[index + 1];
        if (message.role !== "user" || reply?.role !== "assistant" || !reply.content) return;
        conversation.push({ question: message.content, answer: shortenAnswer(reply.content), mentioned: mentionedIn(reply.content, resources).map((resource) => resource.name) });
      });
    }
    const date = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", { dateStyle: "long" }).format(new Date());
    printHtml(t("Resident recommendations"), residentListDocument({ resources: shortlist, t, locale, area: printArea(), date, preparedBy, qrSvg, conversation }));
    setPrinting(false);
  }

  async function printCountywide() {
    const { SERVICES } = await import("@/lib/services");
    const directory = resourcesFromLookup({ planGroups: null, serviceGroups: { directory: SERVICES.map((service) => ({ ...service, distanceMiles: null })) } as unknown as LookupResponse["serviceGroups"], found: false });
    const date = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", { dateStyle: "long" }).format(new Date());
    printHtml(t("Countywide resource sheet"), residentListDocument({ resources: directory, t, locale, area: t("Clark County"), date }));
  }

  const input = (addressOnly = false) => <ChatInput key={`${session}:${draft.revision}:${addressOnly}`} initialValue={draft.text} autoFocus={draft.revision > 0} spacious={home || addressOnly} addressOnly={addressOnly} disabled={busy || chat.busy} onStop={chat.busy ? chat.cancel : undefined} onCancel={addressOnly ? () => { request.current?.abort(); setBusy(false); setEditing(false); setPending(null); setError(""); } : undefined} onSend={(text, options) => sendFromInput(text, options, addressOnly)} placeholder={t(addressOnly ? "Enter a new resident address…" : result ? "Ask a follow-up, or enter a new address…" : "Enter an address or ask a question…")} />;
  const lookupFeedback = <>
    {busy && <p role="status" className="text-sm text-muted-foreground">{t("Checking internet plans and nearby programs…")}</p>}
    {error && <Alert variant="destructive"><AlertTitle>{t("Address lookup")}</AlertTitle><AlertDescription><p>{t(error)}</p><Button variant="outline" size="sm" onClick={() => void lookup(lastQuery)}>{t("Retry")}</Button></AlertDescription></Alert>}
    {pending && <Alert><AlertTitle>{t("Confirm this address")}</AlertTitle><AlertDescription><p>{pending.address || pending.confirmAddress}</p><div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => accept(pending, lastQuery)}>{t("Use this address")}</Button><Button size="sm" variant="outline" onClick={() => { setPending(null); if (lookupIntent.current.toTable) openPanel("needs"); else setDraft((value) => ({ text: lastQuery, revision: value.revision + 1 })); }}>{t("Edit address")}</Button></div></AlertDescription></Alert>}
  </>;
  const needsSummary = <button type="button" onClick={() => openPanel("needs")} aria-haspopup="dialog" className="bace-context-action self-start"><UsersRound className="size-4" aria-hidden="true" />{t(hasResidentNeeds ? "Resident needs · Edit" : "Add resident needs")}{hasResidentNeeds && <Check className="size-4 text-primary" aria-hidden="true" />}</button>;
  const listPanel = <SharePanel resources={shortlist} address={address} focus={focus} downloading={downloading} disabled={editing || busy} status={status === "Recommendations PDF prepared." || status === "Download failed. Please try again." ? status : ""} onRemove={toggle} onDownload={(includeAddress) => void download(includeAddress)} onPrint={() => setPrinting(true)} onOpenTable={result && !tableView ? openTable : undefined} />;

  const resultsBlock = result ? <section className="flex flex-col gap-8" aria-labelledby="finder-title">
    <div className="flex flex-col gap-4">
      <p className="bace-assistant-label">BACE Hub</p>
      <h1 ref={resultsHeading} id="finder-title" tabIndex={-1} className="text-balance text-2xl font-semibold tracking-tight focus:outline-none">{t("Here's what's available near this address")}</h1>
      <p className="text-pretty text-base leading-relaxed text-muted-foreground">{t("Internet plans, devices, and digital skills training are below. Add anything useful to the resident's list, then print or share it.")}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"><MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 break-words">{address}</span><Button variant="link" size="sm" onClick={() => { setEditing(!editing); setPending(null); setError(""); setDraft((value) => ({ text: "", revision: value.revision + 1 })); }}>{t(editing ? "Cancel" : "Change address")}</Button></div>
      <div className="bace-context-bar">
        <button type="button" onClick={() => openPanel("browse")} aria-haspopup="dialog" className="bace-context-action"><SlidersHorizontal className="size-4" aria-hidden="true" /><span>{t("Showing:")} <strong className="font-medium">{t(scopeLabel)}</strong></span><ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only">{t("Change resource view")}</span></button>
        {needsSummary}
      </div>
      {!result.found && <p className="text-sm leading-relaxed text-muted-foreground">{t("We couldn't confirm internet plans for this address. This doesn't mean internet is unavailable; check with a provider. Device and training resources can still be explored.")}</p>}
    </div>
    <div key={address} className="flex flex-col gap-10">
      {categories.filter((category) => !hiddenCategories.has(category)).map((category) => <ResourceSection key={category} category={category} resources={resources.filter((resource) => resource.category === category && !dismissed.has(resource.id))} selected={effectiveSelected} onToggle={toggle} onShare={shareResource} onReport={setReport} />)}
      {!result.found && !!result.nearbyAddresses?.length && <details className="text-sm"><summary className="cursor-pointer font-medium text-primary">{t("Other address matches")}</summary><div className="flex flex-col gap-3 pt-3"><p className="text-muted-foreground">{t("Choosing a match changes the search address. Only use an address that is correct for the resident.")}</p>{result.nearbyAddresses.slice(0, 3).map((pick) => { const label = `${pick.addr}, ${pick.city}, ${pick.state} ${pick.zip}`; return <Button key={JSON.stringify(pick)} variant="outline" className="h-auto min-h-9 justify-start whitespace-normal text-left" disabled={busy || chat.busy} onClick={() => { pendingAnchor.current = chat.addUserMessage(label); void lookup(label, { exact: pick }); }}>{label}</Button>; })}</div></details>}
    </div>
    <div className="bace-response-share">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">{t("Resident's list")} <span className="bace-count-pill">{shortlist.length}</span></p>
        <Button variant="link" size="sm" className="px-0" onClick={openTable}><Table2 data-icon="inline-start" aria-hidden="true" />{t("Open full results")}</Button>
      </div>
      <ShareActions resources={shortlist} onPrint={() => setPrinting(true)} disabled={busy} />
    </div>
  </section> : null;

  const showAside = !!result && !home && !tableView;

  return (
    <div className={cn("resource-finder bace-app flex min-h-dvh flex-col bg-background font-sans text-foreground", !home && "finder-with-chat")} data-panel-open={panel !== null && panel !== "help"} data-list-aside={showAside || undefined}>
      <SessionTimeout key={session} onExpire={reset} />
        <header ref={headerRef} className="bace-header">
          <button type="button" aria-label={t("BACE Hub home")} onClick={goHome} className="text-left">
            <span className="bace-wordmark">BACE <span className="font-normal">Hub</span></span>
          </button>
          <div className="bace-header-utilities flex items-center gap-1 sm:gap-2">
            {hasSession && <>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("Start new chat")} title={t("Start new chat")} onClick={() => skipResetPrompt ? reset() : setResetOpen(true)}><RotateCcw aria-hidden="true" /></Button>
            </>}
            <WorkspaceMenu hasResults={!!result} shareCount={shortlist.length} snapshot={mapSnapshot} mapDisabled={busy || chat.busy} onOpen={openPanel} />
          </div>
          <div className="bace-header-help flex items-center gap-2">
            <LanguageToggle tone="inverse" />
          </div>
        </header>
      <div className="bace-main-shell">
        <main className={cn("bace-main", home && "bace-home", tableView && "bace-main-wide")}>
          {home ? <ResourceHome
            input={input()}
            feedback={lookupFeedback}
            needsApplied={hasResidentNeeds}
            onNeeds={() => openPanel("needs")}
            onTour={() => { openPanel("help"); setTourRequested(true); }}
            onStarter={(prompt) => send(prompt)}
            returnAction={hasSession ? <Button variant="link" onClick={() => setShowHome(false)}>{t("Return to current session")}<ArrowUpRight data-icon="inline-end" aria-hidden="true" /></Button> : undefined}
          /> : tableView ? <div className="flex flex-1 flex-col gap-8">
            {(editing || busy || error || pending) && <div className="flex flex-col gap-4">{editing && input(true)}{lookupFeedback}</div>}
            <ResultsTable resources={resources} address={address} selected={effectiveSelected} shortlist={shortlist} hiddenCategories={hiddenCategories} dismissed={dismissed} hasConversation={chat.messages.length > 0} needsSummary={needsSummary}
              onToggle={toggle} onShare={shareResource} onReport={setReport} onDismiss={(id) => setDismissed((current) => new Set([...current, id]))} onRemoveCategory={removeCategory} onRestore={restoreRemoved} onPrint={() => setPrinting(true)}
              onBack={chat.messages.length ? () => setView("chat") : undefined} onChangeAddress={() => { setEditing(!editing); setPending(null); setError(""); }} />
            {chat.messages.some((message) => message.id !== resultAnchor) && <div className="flex flex-col gap-3 border-t border-dashed border-border pt-6">
              <h2 className="text-base font-semibold">{t("Questions about these results")}</h2>
              <ResourceConversation key={`table-${session}`} chat={chat} />
            </div>}
          </div> : <div className="flex flex-1 flex-col gap-8">
            {!result && <section className="flex flex-col gap-2" aria-labelledby="finder-title">
              <p className="text-sm text-muted-foreground">{t("A clearer path to connection")}</p>
              <h1 id="finder-title" className="text-balance text-3xl font-medium tracking-tight">{t("Let’s find a good fit.")}</h1>
            </section>}
            <ResourceConversation key={session} chat={chat} anchorId={resultAnchor} anchorContent={resultsBlock} footer={<>{editing && <div className="flex flex-col gap-4">{input(true)}</div>}{lookupFeedback}</>} showFooter={editing || busy || !!error || !!pending} />
          </div>}
        </main>
        {home && <footer className="bace-home-footer">
          <Button variant="link" size="sm" onClick={() => setReport("general")}>{t("Report a problem")}</Button>
          <span aria-hidden="true" className="text-border">|</span>
          <Button variant="link" size="sm" onClick={() => void printCountywide()}>{t("Printable countywide sheet")}</Button>
        </footer>}
        {!home && editing && !tableView && <div className="bace-feedback pb-5"><Button variant="link" size="sm" onClick={() => setReport("general")}>{t("Report a problem")}</Button></div>}
        {!home && !editing && <div className="finder-chat-dock"><div className="finder-chat-composer"><p className="bace-composer-scope">{t("Answering about:")} {t(scopeLabel)}</p>{input()}<div className="bace-composer-note bace-feedback flex-wrap items-center gap-x-1 pb-0"><span>{t("Check eligibility and availability with the provider.")}</span><Button variant="link" size="sm" className="h-auto px-1 py-0" onClick={() => setReport("general")}>{t("Report a problem")}</Button></div></div></div>}
      </div>
      {showAside && <aside className="bace-list-aside" aria-labelledby="list-aside-title">
        <h2 id="list-aside-title" className="flex items-center justify-between text-lg font-semibold tracking-tight text-primary">{t("Resident's list")}<span className="bace-count-pill">{shortlist.length}</span></h2>
        {listPanel}
      </aside>}
      <ActionRail hasResults={!!result} count={shortlist.length} active={panel} onOpen={openPanel} mapAction={<ResourceMapLink snapshot={mapSnapshot} disabled={busy || chat.busy} />} />
      <WorkspacePanel view={panel} hasResults={!!result} onViewChange={setPanel} onClose={() => { setPanel(null); setTourRequested(false); }} opener={panelOpener}>
        {panel === "help" && <HowToUse key={tourRequested ? "tour" : "intro"} startTour={tourRequested} />}
        {panel === "browse" && <ResourceCategories resources={resources} focus={focus} onFocusChange={changeFocus} onJump={jump} onDone={() => { setShowHome(false); setPanel(null); }} />}
        {panel === "needs" && <ResidentNeeds draft={needsDraft} onChange={setNeedsDraft} address={needsAddress} onAddressChange={setNeedsAddress} onShowResources={showNeedsResults} busy={busy}
          onApply={() => { if (chat.busy) chat.cancel(); setNeeds(sanitizeNeeds(needsDraft)); setPanel(null); setStatus("Resident needs applied to future answers."); }}
          onClear={() => { if (chat.busy) chat.cancel(); setNeeds(EMPTY_NEEDS); setNeedsDraft(EMPTY_NEEDS); setStatus("Resident needs cleared."); }} />}
        {panel === "share" && listPanel}
      </WorkspacePanel>
      <span role="status" className="sr-only">{t(status)}</span>
      <ResetConfirmation addressFirst open={resetOpen} dontShowAgain={skipResetPrompt} onDontShowAgainChange={setSkipResetPrompt} onCancel={() => setResetOpen(false)} onConfirm={reset} onClosed={() => {}} />
      {printing && <PrintDialog count={shortlist.length} hasConversation={hasConversation} onClose={() => setPrinting(false)} onPrint={printList} />}
      {report && <ReportIssue resource={report === "general" ? undefined : report} onClose={() => setReport(null)} />}
    </div>
  );
}
