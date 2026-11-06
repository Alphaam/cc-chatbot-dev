"use client";

import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/chat/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function ResourceIntro({ onTour, compact = false }: { onTour: () => void; compact?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className={compact ? "bace-about-content bace-intro-compact" : "bace-about-content"}>
      <div className="bace-about-image"><Image src="/images/clark-county-valley.png" alt={t("A view of the Las Vegas Valley and surrounding mountains.")} fill sizes="(max-width: 639px) 100vw, 400px" className="object-cover" /></div>
      <div className="flex flex-1 flex-col items-start justify-center gap-5 p-6 sm:p-8">
        <span className="bace-location"><MapPin className="size-4" aria-hidden="true" />{t("Clark County, Nevada")}</span>
        <h3 className="text-balance text-3xl font-medium tracking-tight">{t("Local help. Wider possibilities.")}</h3>
        <p className={compact ? "text-pretty text-sm leading-relaxed" : "text-pretty text-base leading-relaxed"}>{t(compact ? "Find internet plans, device access, and digital skills support for Clark County residents. Search, compare, and share resources in one place." : "BACE Hub helps staff and community partners connect Clark County residents with internet plans, free or low-cost device access, and digital skills training.")}</p>
        {!compact && <p className="text-sm leading-relaxed text-muted-foreground">{t("Start with an address or a question. Compare options, add resident needs, and share a resource list. Providers confirm cost, availability, and eligibility.")}</p>}
        <Button onClick={onTour}>{t("Start tour")}<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
      </div>
    </div>
  );
}
