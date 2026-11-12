"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Check, ListChecks } from "lucide-react";
import { useLanguage } from "@/components/chat/LanguageProvider";

const STARTERS = [
  { label: "Internet plans near me", prompt: "What low-cost internet plans are available near the resident?" },
  { label: "Devices near me", prompt: "Where can the resident get a free or low-cost computer nearby?" },
  { label: "Training near me", prompt: "Where can the resident take free computer classes nearby?" },
] as const;

export default function ResourceHome({ input, feedback, needsApplied, onNeeds, onTour, onStarter, returnAction }: {
  input: ReactNode; feedback: ReactNode; needsApplied: boolean; onNeeds: () => void; onTour: () => void; onStarter: (prompt: string) => void; returnAction?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <section aria-labelledby="finder-title" className="bace-home-content">
      <h1 id="finder-title" className="bace-home-title text-balance">{t("What can we help your resident find?")}</h1>
      <div className="flex w-full flex-col gap-2">
        {input}
        <p className="bace-home-helper">{t("Type an address to see nearby resources, or ask the assistant a question.")}</p>
        {feedback}
      </div>
      <div className="flex flex-col items-center gap-2">
        <button type="button" className="bace-needs-entry" onClick={onNeeds} aria-haspopup="dialog">
          {needsApplied ? <Check className="size-4 shrink-0" aria-hidden="true" /> : <ListChecks className="size-4 shrink-0" aria-hidden="true" />}
          {t("Search by resident needs")}
        </button>
        {returnAction}
      </div>
      <article className="bace-tool-panel" aria-labelledby="tool-panel-title">
        <div className="bace-tool-photo"><Image src="/images/senior-woman-learning-on-computer.jpg" alt={t("A helper and a resident looking at a laptop together.")} fill loading="eager" sizes="(max-width: 767px) 100vw, 280px" className="object-cover" /></div>
        <div className="flex flex-1 flex-col gap-2 p-5">
          <h2 id="tool-panel-title" className="text-base font-semibold text-foreground">{t("What this tool does")}</h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{t("BACE Hub helps you find internet plans, low-cost devices, and digital skills training for a Clark County resident, then hand them a list they can keep.")}</p>
          <button type="button" className="bace-text-link self-start" onClick={onTour}>{t("Take a tour")}</button>
          <nav aria-label={t("Start with a common question")} className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
            {STARTERS.map(({ label, prompt }) => (
              <button type="button" key={label} className="bace-text-link" onClick={() => onStarter(t(prompt))}>{t(label)}</button>
            ))}
          </nav>
        </div>
      </article>
    </section>
  );
}
