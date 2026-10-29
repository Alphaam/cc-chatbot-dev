"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, Download, MapPin, RotateCcw } from "lucide-react";
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
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <SessionTimeout key={session} onExpire={reset} />
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold">BACE Hub</span>
            <span className="text-sm">
              {t("Clark County digital resources")}
            </span>
          </div>
          <LanguageToggle />
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-8">
          <section
            aria-labelledby="finder-title"
            className="flex flex-col gap-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-primary">
                  {t("One client. One place to start.")}
                </p>
                <h1
                  id="finder-title"
                  className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  {t(
                    result
                      ? "Your resource overview"
                      : "Find a path to getting connected.",
                  )}
                </h1>
                {!result && (
                  <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
                    {t(
                      "Enter a Clark County address to find internet plans, device programs, and digital skills support together.",
                    )}
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
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">{t("Client address")}</p>
                <ChatInput
                  key={session}
                  addressOnly
                  disabled={busy}
                  onSend={lookup}
                  placeholder={t("Street address, city, NV ZIP")}
                />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(
                    "No client name needed. Changing the address starts a new shortlist.",
                  )}
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
            )}
          </section>
          {!result ? (
            <div className="border-t border-dashed border-border pt-6">
              <div className="grid gap-6 sm:grid-cols-3">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex flex-col gap-2">
                    <h2 className="text-base font-semibold">
                      {t(CATEGORY_LABELS[category])}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(
                        category === "internet"
                          ? "Compare costs and connection speeds."
                          : category === "devices"
                            ? "Find device programs and computer access."
                            : "Find classes and help using technology.",
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
                className="rounded-xl border border-border bg-card p-5 text-card-foreground"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h2
                      id="shortlist-title"
                      ref={resultsHeading}
                      tabIndex={-1}
                      className="text-xl font-semibold focus:outline-none"
                    >
                      {t("Client shortlist")}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({shortlist.length})
                      </span>
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(
                        "A starting option from each category is selected. Review the matches and choose what to share.",
                      )}
                    </p>
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
                          : "Download recommendations PDF",
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
                      {t("Copy Case Note")}
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(
                      "Directory matches only. Contact each provider to confirm availability, cost, and eligibility. Service receipt is not confirmed.",
                    )}
                  </p>
                  <p role="status" className="text-sm text-primary">
                    {t(status)}
                  </p>
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
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
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
