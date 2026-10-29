"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, BookOpen, ClipboardList, Download, Laptop, MapPin, RotateCcw, ShieldCheck, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ChatInput, { type SendOptions } from "@/components/chat/ChatInput";
import SessionTimeout from "@/components/chat/SessionTimeout";
import ResetConfirmation from "@/components/chat/ResetConfirmation";
import {
  LanguageToggle,
  useLanguage,
} from "@/components/chat/LanguageProvider";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  defaultShortlist,
  recommendationsText,
  resourcesFromLookup,
  type LookupResponse,
  type Resource,
} from "@/lib/resource-finder";
import ResourceSection from "./ResourceSection";
import ShareRecommendations from "./ShareRecommendations";
import ReportIssue from "./ReportIssue";

export default function ResourceFinder() {
  const { t } = useLanguage();
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [pending, setPending] = useState<LookupResponse | null>(null);
  const [address, setAddress] = useState("");
  const [editing, setEditing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [share, setShare] = useState<{
    resources: Resource[];
    note?: boolean;
  } | null>(null);
  const [report, setReport] = useState<Resource | "general" | null>(null);
  const [session, setSession] = useState(0);
  const [resetOpen, setResetOpen] = useState(false);
  const [skipResetPrompt, setSkipResetPrompt] = useState(false);
  const generation = useRef(0);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState("");
  const request = useRef<AbortController | null>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const downloadLock = useRef(false);
  const resources = result ? resourcesFromLookup(result) : [];
  const shortlist = resources.filter((resource) => selected.has(resource.id));

  useEffect(() => () => request.current?.abort(), []);

  const reset = useCallback(() => {
    generation.current += 1;
    setResetOpen(false);
    request.current?.abort();
    setResult(null);
    setPending(null);
    setAddress("");
    setSelected(new Set());
    setShare(null);
    setReport(null);
    setEditing(true);
    setBusy(false);
    setError("");
    setLastQuery("");
    setStatus("");
    setSession((value) => value + 1);
  }, []);

  function accept(data: LookupResponse, query: string) {
    generation.current += 1;
    setShare(null);
    setReport(null);
    setResult(data);
    setAddress(data.address || data.confirmAddress || query);
    setSelected(defaultShortlist(resourcesFromLookup(data)));
    setEditing(false);
    setPending(null);
    setError("");
    setStatus("");
    requestAnimationFrame(() => resultsHeading.current?.focus());
  }

  async function lookup(text: string, options?: SendOptions) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setPending(null);
    setLastQuery(text);
    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, exact: options?.exact }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Lookup unavailable");
      const data: LookupResponse = await response.json();
      if (controller.signal.aborted) return;
      if (!data.validated) {
        setError(
          "We could not locate that address. Include the street, city, state, and ZIP code.",
        );
        return;
      }
      if (!options?.addressConfirmed && !options?.exact && data.confirmAddress)
        setPending(data);
      else accept(data, text);
    } catch {
      if (!controller.signal.aborted)
        setError("The lookup is unavailable right now. Please try again.");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setStatus("");
  }

  async function download() {
    if (!shortlist.length || downloadLock.current) return;
    const activeGeneration = generation.current;
    downloadLock.current = true;
    setDownloading(true);
    setStatus("");
    try {
      const { createChatPdf, loadPdfFont } = await import("@/lib/chat-pdf");
      const pdf = createChatPdf(
        recommendationsText(shortlist, t),
        await loadPdfFont(),
        t("Client recommendations"),
      );
      if (activeGeneration !== generation.current) return;
      const url = URL.createObjectURL(pdf.output("blob"));
      const link = document.createElement("a");
      link.href = url;
      link.download = "clark-county-recommendations.pdf";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Recommendations PDF prepared.");
    } catch {
      setStatus("Download failed. Please try again.");
    } finally {
      setDownloading(false);
      downloadLock.current = false;
    }
  }

  return (
    <div className="resource-finder flex min-h-dvh flex-col bg-background font-sans text-foreground">
      <SessionTimeout key={session} onExpire={reset} />
      <header className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xl font-semibold tracking-tight">BACE<span className="font-normal text-muted-foreground"> Hub</span></span>
              <span className="hidden border-l border-border pl-4 text-sm text-muted-foreground sm:block">{t("Resource finder")}</span>
            </div>
            <LanguageToggle tone="neutral" />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:py-14">
        <div className="flex flex-col gap-8">
          <section
            aria-labelledby="finder-title"
            className="flex flex-col gap-7"
          >
            <div className={cn("flex items-start justify-between gap-4", !result && "justify-center")}>
              <div className={cn("flex flex-col gap-3", !result && "max-w-2xl items-center text-center")}>
                <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <MapPin className="size-4" aria-hidden="true" />
                  {t("Clark County, Nevada")}
                </p>
                <h1
                  id="finder-title"
                  className={cn("text-balance font-semibold tracking-tight", result ? "text-3xl" : "text-4xl leading-tight sm:text-5xl")}
                >
                  {t(result ? "Your resource overview" : "Connection starts here.")}
                </h1>
                {!result && (
                  <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
                    {t("Internet, devices, and digital skills. Find the right support for your client, all in one place.")}
                  </p>
                )}
              </div>
              {result && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    skipResetPrompt ? reset() : setResetOpen(true)
                  }
                >
                  <RotateCcw data-icon="inline-start" aria-hidden="true" />
                  {t("New client")}
                </Button>
              )}
            </div>
            {result && (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-card-foreground">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <MapPin
                      className="size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        {t("Current address")}
                      </span>
                      <p className="break-words text-base font-medium">
                        {address}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      request.current?.abort();
                      setBusy(false);
                      setEditing((value) => !value);
                      setPending(null);
                      setError("");
                    }}
                  >
                    {t(editing ? "Cancel" : "Change address")}
                  </Button>
                </div>
              </div>
            )}
            {editing && (
              <div className="finder-search-panel p-5 sm:p-7">
                <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold tracking-tight">{t(result ? "Client address" : "Start with an address")}</h2>
                <ChatInput
                  key={session}
                  addressOnly
                  disabled={busy}
                  onSend={lookup}
                  placeholder={t("Street address, city, NV ZIP")}
                />
                <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {t(result ? "Changing the address starts a new shortlist." : "No client name or personal details needed.")}
                </p>
                {busy && (
                  <p role="status" className="text-sm text-primary">
                    {t("Checking internet plans and nearby programs…")}
                  </p>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>{t("Address lookup")}</AlertTitle>
                    <AlertDescription>
                      <p>{t(error)}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void lookup(lastQuery)}
                      >
                        {t("Retry")}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                {pending && (
                  <Alert>
                    <AlertTitle>{t("Confirm this address")}</AlertTitle>
                    <AlertDescription>
                      <p>{pending.address || pending.confirmAddress}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => accept(pending, lastQuery)}
                        >
                          {t("Use this address")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPending(null)}
                        >
                          {t("Edit address")}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                </div>
              </div>
            )}
          </section>
          {!result ? (
            <section aria-label={t("Explore together")}>
              <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
                {CATEGORIES.map((category) => {
                  const Icon = { internet: Wifi, devices: Laptop, skills: BookOpen }[category];
                  return (
                    <div key={category} className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.7} aria-hidden="true" />
                      <div className="flex flex-col gap-1.5">
                        <h2 className="text-base font-semibold tracking-tight">
                          {t(category === "internet" ? "Internet plans" : category === "devices" ? "Devices & access" : "Digital skills")}
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {t(category === "internet" ? "Compare costs and connection speeds." : category === "devices" ? "Find device programs and computer access." : "Find classes and help using technology.")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <div key={address} className="flex flex-col gap-8">
              {!result.found && (
                <Alert>
                  <AlertTitle>{t("No exact broadband record")}</AlertTitle>
                  <AlertDescription>
                    <p>
                      {t(
                        "We located the address, but could not match an internet record. Only national programs are shown. Try a complete address or a nearby dataset address below.",
                      )}
                    </p>
                    {!!result.nearbyAddresses?.length && (
                      <div className="flex flex-col gap-2">
                        {result.nearbyAddresses.slice(0, 3).map((pick) => (
                          <Button
                            key={JSON.stringify(pick)}
                            variant="outline"
                            className="h-auto min-h-9 justify-start whitespace-normal text-left"
                            disabled={busy}
                            onClick={() =>
                              void lookup(
                                `${pick.addr}, ${pick.city}, ${pick.state} ${pick.zip}`,
                                { exact: pick },
                              )
                            }
                          >{`${pick.addr}, ${pick.city}, ${pick.state} ${pick.zip}`}</Button>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <section
                aria-labelledby="shortlist-title"
                className="rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"><ClipboardList className="size-5" aria-hidden="true" /></span>
                    <div className="flex flex-col gap-1">
                      <h2
                        id="shortlist-title"
                        ref={resultsHeading}
                        tabIndex={-1}
                        className="text-lg font-semibold tracking-tight focus:outline-none"
                      >
                        {t("Client shortlist")} <span className="font-normal text-muted-foreground">({shortlist.length})</span>
                      </h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t("Review your selections below, then share a single handoff.")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={
                        !shortlist.length || downloading || editing || busy
                      }
                      onClick={() => void download()}
                    >
                      <Download data-icon="inline-start" aria-hidden="true" />
                      {t(
                        downloading
                          ? "Preparing PDF…"
                          : "Download PDF",
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!shortlist.length || editing || busy}
                      onClick={() => setShare({ resources: shortlist })}
                    >
                      {t("Send or copy")}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={!shortlist.length || editing || busy}
                      onClick={() =>
                        setShare({ resources: shortlist, note: true })
                      }
                    >
                      {t("Copy case note")}
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(
                      "Confirm availability, pricing, and eligibility with each provider. A match does not confirm service.",
                    )}
                  </p>
                  <div role="status" className={cn("text-sm text-primary", !status && "sr-only")}>
                    {t(status)}
                  </div>
                </div>
              </section>
              <nav
                aria-label={t("Resource categories")}
                className="flex flex-wrap gap-2"
              >
                {CATEGORIES.map((category) => (
                  <a
                    key={category}
                    href={`#${category}`}
                    className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-card-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                  >
                    {t(CATEGORY_LABELS[category])}{" "}
                    <span className="text-muted-foreground">
                      {
                        resources.filter(
                          (resource) => resource.category === category,
                        ).length
                      }
                    </span>
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </a>
                ))}
              </nav>
              {CATEGORIES.map((category) => (
                <ResourceSection
                  key={category}
                  category={category}
                  resources={resources.filter(
                    (resource) => resource.category === category,
                  )}
                  selected={selected}
                  onToggle={toggle}
                  onShare={(resource) => setShare({ resources: [resource] })}
                  onReport={setReport}
                />
              ))}
            </div>
          )}
          <footer className="border-t border-dashed border-border pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {t("Helping Clark County get connected.")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReport("general")}
              >
                {t("Give feedback")}
              </Button>
            </div>
          </footer>
        </div>
      </main>
      <ResetConfirmation
        addressFirst
        open={resetOpen}
        dontShowAgain={skipResetPrompt}
        onDontShowAgainChange={setSkipResetPrompt}
        onCancel={() => setResetOpen(false)}
        onConfirm={reset}
        onClosed={() => {}}
      />
      {share && (
        <ShareRecommendations
          resources={share.resources}
          address={address}
          note={share.note}
          onClose={() => setShare(null)}
        />
      )}
      {report && (
        <ReportIssue
          resource={report === "general" ? undefined : report}
          onClose={() => setReport(null)}
        />
      )}
    </div>
  );
}
