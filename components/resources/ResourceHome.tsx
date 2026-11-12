"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, GraduationCap, Laptop, ListChecks, MapPin, PlayCircle, Wifi } from "lucide-react";
import { useLanguage } from "@/components/chat/LanguageProvider";

const STARTERS = [
  { icon: Wifi, category: "internet", label: "Internet plans near me", prompt: "What low-cost internet plans are available near the resident?" },
  { icon: Laptop, category: "devices", label: "Devices near me", prompt: "Where can the resident get a free or low-cost computer nearby?" },
  { icon: GraduationCap, category: "skills", label: "Training near me", prompt: "Where can the resident take free computer classes nearby?" },
] as const;

export default function ResourceHome({ input, feedback, needsApplied, onNeeds, onTour, onStarter, returnAction }: {
  input: ReactNode; feedback: ReactNode; needsApplied: boolean; onNeeds: () => void; onTour: () => void; onStarter: (prompt: string) => void; returnAction?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <section aria-labelledby="finder-title" className="bace-home-content">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bace-location"><MapPin className="size-4" aria-hidden="true" />{t("Clark County, Nevada")}</span>
        <h1 id="finder-title" className="bace-home-title text-balance">{t("What can we help your resident find?")}</h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">{t("Type an address to see nearby resources, or ask the assistant a question.")}</p>
      </div>
      <div className="flex w-full flex-col gap-4">{input}{feedback}</div>
      <div className="flex flex-col items-center gap-3">
        <button type="button" className="bace-needs-entry" onClick={onNeeds} aria-haspopup="dialog">
          <ListChecks className="size-5 shrink-0" aria-hidden="true" />
          <span className="flex flex-col text-left">
            <span className="font-semibold">{t("Search by resident needs")}</span>
            <span className="text-sm text-muted-foreground">{t(needsApplied ? "Needs applied. Edit or show resources." : "Answer a short checklist and get a printable list.")}</span>
          </span>
          {needsApplied ? <Check className="size-4 shrink-0" aria-hidden="true" /> : <ArrowRight className="size-4 shrink-0" aria-hidden="true" />}
        </button>
        {returnAction}
      </div>
      <article className="bace-tool-panel" aria-labelledby="tool-panel-title">
        <div className="bace-tool-photo"><Image src="/images/senior-woman-learning-on-computer.jpg" alt={t("A helper and a resident looking at a laptop together.")} fill loading="eager" sizes="(max-width: 767px) 100vw, 320px" className="object-cover" /></div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <h2 id="tool-panel-title" className="text-lg font-semibold tracking-tight text-primary">{t("What this tool does")}</h2>
            <p className="text-pretty text-sm leading-relaxed">{t("BACE Hub helps you find internet plans, low-cost devices, and digital skills training for a Clark County resident, then hand them a list they can keep.")}</p>
            <button type="button" className="bace-inline-link self-start" onClick={onTour}><PlayCircle className="size-4" aria-hidden="true" />{t("Take a tour")}</button>
          </div>
          <nav aria-label={t("Start with a common question")} className="flex flex-col">
            {STARTERS.map(({ icon: Icon, category, label, prompt }) => (
              <button type="button" key={label} data-category={category} className="bace-starter" onClick={() => onStarter(t(prompt))}>
                <span className="bace-starter-icon"><Icon className="size-4" aria-hidden="true" /></span>
                <span className="flex-1 text-left">{t(label)}</span>
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </button>
            ))}
          </nav>
        </div>
      </article>
    </section>
  );
}
