"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, GraduationCap, Laptop, ListChecks, MapPin, RotateCcw, Wifi, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/chat/LanguageProvider";
import { CATEGORIES, CATEGORY_LABELS, type Resource, type ResourceCategory } from "@/lib/resource-finder";
import { ResourceRow, SortSelect, defaultSort, sortResources, type ResourceSort } from "./ResourceSection";
import ShareActions from "./ShareActions";

const ICONS = { internet: Wifi, devices: Laptop, skills: GraduationCap } as const;

export default function ResultsTable({ resources, address, selected, shortlist, hiddenCategories, dismissed, hasConversation, needsSummary, onToggle, onShare, onReport, onDismiss, onRemoveCategory, onRestore, onPrint, onBack, onChangeAddress }: {
  resources: Resource[]; address: string; selected: Set<string>; shortlist: Resource[]; hiddenCategories: Set<ResourceCategory>; dismissed: Set<string>;
  hasConversation: boolean; needsSummary?: ReactNode;
  onToggle: (id: string) => void; onShare: (resource: Resource) => void; onReport: (resource: Resource) => void; onDismiss: (id: string) => void;
  onRemoveCategory: (category: ResourceCategory) => void; onRestore: () => void; onPrint: () => void; onBack?: () => void; onChangeAddress: () => void;
}) {
  const { t } = useLanguage();
  const [sorts, setSorts] = useState<Record<ResourceCategory, ResourceSort>>({ internet: defaultSort("internet"), devices: defaultSort("devices"), skills: defaultSort("skills") });
  const [expanded, setExpanded] = useState<Set<ResourceCategory>>(new Set());
  const visible = CATEGORIES.filter((category) => !hiddenCategories.has(category));
  const removedCount = hiddenCategories.size + dismissed.size;
  return (
    <section className="flex flex-col gap-6" aria-labelledby="table-title">
      <div className="bace-table-sharebar">
        <div className="flex min-w-0 items-center gap-3">
          <ListChecks className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm font-medium"><span>{t("Resident's list")}</span> <span className="bace-count-pill">{shortlist.length}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {removedCount > 0 && <Button size="sm" variant="ghost" onClick={onRestore}><RotateCcw data-icon="inline-start" aria-hidden="true" />{t("Restore removed ({count})", { count: removedCount })}</Button>}
          <ShareActions resources={shortlist} onPrint={onPrint} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {onBack && <Button variant="link" size="sm" className="self-start px-0" onClick={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" />{t(hasConversation ? "Back to conversation" : "Back")}</Button>}
        <h1 id="table-title" tabIndex={-1} className="text-balance text-2xl font-semibold tracking-tight text-primary focus:outline-none">{t("Resources for this resident")}</h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"><MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 break-words">{address}</span><Button variant="link" size="sm" onClick={onChangeAddress}>{t("Change address")}</Button></div>
        {needsSummary}
      </div>
      {!visible.length ? <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border p-6">
        <p className="text-sm text-muted-foreground">{t("All categories were removed.")}</p>
        <Button variant="outline" onClick={onRestore}>{t("Restore removed ({count})", { count: removedCount })}</Button>
      </div> : <div className="bace-table-columns" data-count={visible.length}>
        {visible.map((category) => {
          const Icon = ICONS[category];
          const items = sortResources(resources.filter((resource) => resource.category === category && !dismissed.has(resource.id)), sorts[category]);
          const open = expanded.has(category);
          const shown = open ? items : items.slice(0, 5);
          return <section key={category} data-category={category} className="bace-table-column" aria-labelledby={`table-${category}`}>
            <header className="bace-table-column-head">
              <h2 id={`table-${category}`} className="flex items-center gap-2 text-base font-semibold text-primary"><Icon className="size-5 shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1">{t(CATEGORY_LABELS[category])}</span><span className="bace-column-count">{items.length}</span></h2>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {items.length > 1 ? <SortSelect category={category} value={sorts[category]} onChange={(sort) => setSorts((current) => ({ ...current, [category]: sort }))} /> : <span />}
                <Button size="sm" variant="ghost" className="bace-column-remove" onClick={() => onRemoveCategory(category)} aria-label={t("Remove {category} from the list", { category: t(CATEGORY_LABELS[category]) })}><X data-icon="inline-start" aria-hidden="true" />{t("Remove")}</Button>
              </div>
            </header>
            {!items.length ? <p className="px-1 text-sm leading-relaxed text-muted-foreground">{t(category === "internet" ? "No plans were confirmed for this address. Check with a provider." : "No matches in this category.")}</p>
              : <ul className="flex flex-col gap-3">{shown.map((resource) => <ResourceRow key={resource.id} resource={resource} selected={selected.has(resource.id)} onToggle={() => onToggle(resource.id)} onShare={() => onShare(resource)} onReport={() => onReport(resource)} onDismiss={() => onDismiss(resource.id)} />)}</ul>}
            {items.length > 5 && <Button variant="outline" size="sm" aria-expanded={open} onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(category)) next.delete(category); else next.add(category); return next; })}>{open ? t("Show fewer") : t("Show all {count} options", { count: items.length })}</Button>}
          </section>;
        })}
      </div>}
    </section>
  );
}
