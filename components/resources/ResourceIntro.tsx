"use client";

import Image from "next/image";
import { useLanguage } from "@/components/chat/LanguageProvider";
import HowToUse from "./HowToUse";

export default function ResourceIntro() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="finder-intro-title" className="border-t border-dashed border-border pt-8">
      <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:gap-10">
        <div className="flex flex-1 flex-col items-start gap-4">
          <h2 id="finder-intro-title" className="text-balance text-2xl font-semibold tracking-tight">{t("Connection starts here.")}</h2>
          <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">{t("Find internet plans, device programs, and digital skills training for Clark County clients, then share the resources that fit.")}</p>
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm leading-relaxed text-muted-foreground">{t("Select How to use this tool for a full tour.")}</p>
            <HowToUse variant="outline" />
          </div>
        </div>
        <Image
          src="/images/clark-county-valley.png"
          alt={t("A view of the Las Vegas Valley and surrounding mountains.")}
          width={1024}
          height={1024}
          sizes="(max-width: 639px) calc(100vw - 40px), 288px"
          className="h-44 w-full rounded-2xl object-cover object-center sm:h-52 sm:w-72 sm:shrink-0"
        />
      </div>
    </section>
  );
}
