"use client";

import { Dialog } from "@base-ui/react/dialog";
import { CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/chat/LanguageProvider";

const steps = [
  {
    title: "Enter an address",
    body: "Type the street, city, and ZIP. Choose a suggestion or select Find resources, then confirm the address if asked.",
  },
  {
    title: "Review the matches",
    body: "Compare internet plans, device programs, and digital skills support. Open Details & sharing for more information.",
  },
  {
    title: "Choose your shortlist",
    body: "One option per available category starts selected. Check or uncheck resources to choose what to share.",
  },
  {
    title: "Share with your client",
    body: "Choose Download PDF or Send or copy. Use Copy case note for your records. Choose New client to start over.",
  },
];

export default function HowToUse() {
  const { t } = useLanguage();

  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="ghost" size="sm" />}>
        <CircleHelp data-icon="inline-start" aria-hidden="true" />
        {t("How to use")}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-foreground/40" />
        <Dialog.Viewport className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Popup className="resource-finder flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card font-sans text-left text-card-foreground shadow-lg">
            <div className="shrink-0 border-b border-border p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Dialog.Title className="text-xl font-semibold tracking-tight">{t("How to use")}</Dialog.Title>
                  <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">{t("From address to client shortlist.")}</Dialog.Description>
                </div>
                <Dialog.Close render={<Button variant="ghost" size="icon" />} aria-label={t("Close guide")}>
                  <X aria-hidden="true" />
                </Dialog.Close>
              </div>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">
              <ol className="flex list-decimal flex-col gap-5 pl-5 marker:font-semibold marker:text-primary">
                {steps.map((step) => (
                  <li key={step.title} className="pl-2">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-semibold">{t(step.title)}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{t(step.body)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="shrink-0 border-t border-border bg-muted p-5 text-muted-foreground sm:px-6">
              <p className="text-sm leading-relaxed">{t("Confirm cost, eligibility, and availability with each provider before referring.")}</p>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
