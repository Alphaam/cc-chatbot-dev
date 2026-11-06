"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/chat/LanguageProvider";
import ResourceIntro from "./ResourceIntro";
import ResourceWalkthrough from "./ResourceWalkthrough";

export default function HowToUse() {
  const { t } = useLanguage();
  const [tourStarted, setTourStarted] = useState(false);
  if (!tourStarted) return <ResourceIntro compact onTour={() => setTourStarted(true)} />;
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <Button variant="ghost" className="self-start" onClick={() => setTourStarted(false)}><ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("Back to introduction")}</Button>
      <p className="text-sm leading-relaxed text-muted-foreground">{t("Try it with example data. Your search stays unchanged.")}</p>
      <ResourceWalkthrough />
    </div>
  );
}
