"use client";

import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useLanguage } from "@/components/chat/LanguageProvider";
import {
  CATEGORY_LABELS,
  priceLabel,
  resourceText,
  type Resource,
  type ResourceCategory,
} from "@/lib/resource-finder";
import { toNumber } from "@/lib/plan-utils";

export default function ResourceSection({
  category,
  resources,
  selected,
  onToggle,
  onShare,
  onReport,
}: {
  category: ResourceCategory;
  resources: Resource[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onShare: (resource: Resource) => void;
  onReport: (resource: Resource) => void;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [budget, setBudget] = useState("");
  const [noContract, setNoContract] = useState(false);
  const filtered = resources.filter(
    ({ plan }) =>
      !plan ||
      ((!budget ||
        (toNumber(plan.price) !== null &&
          toNumber(plan.price)! <= Number(budget))) &&
        (!noContract || plan.contract === "N")),
  );
  const shown = expanded ? filtered : filtered.slice(0, 2);
  return (
    <section
      id={category}
      aria-labelledby={`${category}-title`}
      className="scroll-mt-6 border-t border-dashed border-border pt-7"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2
            id={`${category}-title`}
            className="text-2xl font-semibold tracking-tight"
          >
            {t(CATEGORY_LABELS[category])}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(
              category === "internet"
                ? "Compare a lower-cost plan and a faster connection. Prices and availability need provider confirmation."
                : "Nearby programs first, followed by national and online options. Contact the program to check eligibility.",
            )}
          </p>
        </div>
        {category === "internet" && resources.length > 0 && (
          <details className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground">
            <summary className="cursor-pointer text-sm font-medium">
              {t("Refine internet plans (optional)")}
            </summary>
            <div className="pt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="plan-budget">
                    {t("Maximum monthly price")}
                  </FieldLabel>
                  <select
                    id="plan-budget"
                    value={budget}
                    onChange={(event) => {
                      setBudget(event.target.value);
                      setExpanded(false);
                    }}
                    className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                  >
                    <option value="">{t("Any price")}</option>
                    {[25, 50, 75, 100].map((value) => (
                      <option key={value} value={value}>
                        ${value}
                      </option>
                    ))}
                  </select>
                </Field>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={noContract}
                    onChange={(event) => {
                      setNoContract(event.target.checked);
                      setExpanded(false);
                    }}
                    className="size-4 accent-primary"
                  />
                  {t("Only plans without a contract")}
                </label>
              </FieldGroup>
            </div>
          </details>
        )}
        {!filtered.length ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("No matches to show")}</EmptyTitle>
              <EmptyDescription>
                {t(
                  resources.length
                    ? "Try removing your filters. Other categories are still available below."
                    : "No matching records were returned for this category. Try another address or contact a local provider.",
                )}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-4">
            {shown.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                selected={selected.has(resource.id)}
                onToggle={() => onToggle(resource.id)}
                onShare={() => onShare(resource)}
                onReport={() => onReport(resource)}
              />
            ))}
          </ul>
        )}
        {filtered.length > 2 && (
          <div>
            <Button
              variant="outline"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded
                ? t("Show fewer")
                : t("Show all {count} options", { count: filtered.length })}
            </Button>
          </div>
        )}
        {(budget || noContract) && (
          <p className="text-sm text-muted-foreground">
            {t("Filters change the list, not your selected shortlist.")}
          </p>
        )}
      </div>
    </section>
  );
}

function ResourceRow({
  resource,
  selected,
  onToggle,
  onShare,
  onReport,
}: {
  resource: Resource;
  selected: boolean;
  onToggle: () => void;
  onShare: () => void;
  onReport: () => void;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const plan = resource.plan;
  const service = resource.service;
  async function copy() {
    try {
      await navigator.clipboard.writeText(resourceText(resource, t));
      setCopied(true);
    } catch {
      onShare();
    }
  }
  return (
    <li className="rounded-xl border border-border bg-card p-5 text-card-foreground">
      <article className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-pretty text-lg font-semibold">
              {resource.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {plan
                ? t(plan.technology)
                : service?.distanceMiles != null
                  ? t("{distance} miles away", {
                      distance: service.distanceMiles.toFixed(1),
                    })
                  : t("National / Online")}
            </p>
          </div>
          {plan && (
            <div className="text-right">
              <p className="text-xl font-semibold">
                {priceLabel(plan.price) || t("Price not listed")}
                <span className="text-sm font-normal text-muted-foreground">
                  {plan.price.trim() ? t("/mo") : ""}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {plan.downloadMbps} Mbps {t("download")}
              </p>
            </div>
          )}
        </div>
        {service && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {service.address ? t(service.address) : t("Online resource")}
            {service.phone ? ` · ${service.phone}` : ""}
          </p>
        )}
        <p className="text-sm leading-relaxed">
          {plan
            ? t(
                plan.lowIncome === "Y"
                  ? "Income-based savings listed. Confirm qualification with the provider."
                  : "Confirm current pricing, fees, and service at this address.",
              )
            : t(
                "Ask about eligibility, cost, and current openings before referring.",
              )}
        </p>
        <details>
          <summary className="cursor-pointer text-sm font-medium text-primary">
            {t("View details")}
          </summary>
          <div className="pt-3">
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
              {resourceText(resource, t)}
            </p>
          </div>
        </details>
        <div className="flex flex-wrap items-center gap-2">
          {resource.url && (
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              {t(plan ? "Visit provider" : "Program website")}
              <ExternalLink data-icon="inline-end" aria-hidden="true" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => void copy()}>
            <Copy data-icon="inline-start" aria-hidden="true" />
            {t(copied ? "Copied" : "Copy details")}
          </Button>
          <Button size="sm" variant="ghost" onClick={onShare}>
            {t("Send details")}
          </Button>
          <Button size="sm" variant="ghost" onClick={onReport}>
            {t("Report an issue")}
          </Button>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="size-4 accent-primary"
          />
          {t("Include in client shortlist")}
          <span className="sr-only">: {resource.name}</span>
        </label>
        {copied && (
          <span role="status" className="sr-only">
            {t("Details copied.")}
          </span>
        )}
      </article>
    </li>
  );
}
