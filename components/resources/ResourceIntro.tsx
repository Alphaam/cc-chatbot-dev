"use client";

import Image from "next/image";
import { useLanguage } from "@/components/chat/LanguageProvider";

export default function ResourceIntro() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="finder-intro-title" className="border-t border-dashed border-border pt-8">
      <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:gap-10">
        <div className="flex flex-1 flex-col items-start gap-4">
          <h2 id="finder-intro-title" className="text-balance text-2xl font-semibold tracking-tight">{t("Local help. Wider possibilities.")}</h2>
          <dl className="flex max-w-lg flex-col gap-5 text-sm leading-relaxed">
            <div className="flex flex-col gap-1">
              <dt className="font-semibold text-foreground">{t("Nearby programs")}</dt>
              <dd className="text-muted-foreground">{t("Libraries and community organizations can offer computer access, device support, and hands-on learning close to home.")}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-semibold text-foreground">{t("Online or nationwide")}</dt>
              <dd className="text-muted-foreground">{t("Explore remote learning and programs with a wider reach. Delivery, eligibility, and in-person requirements vary by provider.")}</dd>
            </div>
          </dl>
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
