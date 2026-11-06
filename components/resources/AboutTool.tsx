"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/chat/LanguageProvider";
import ResourceIntro from "./ResourceIntro";

export default function AboutTool({ onTour }: { onTour: () => void }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button variant="ghost" size="icon" />} aria-label={t("What is this tool?")} title={t("What is this tool?")}><CircleHelp aria-hidden="true" /></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="bace-panel-backdrop" />
        <Dialog.Viewport className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Popup className="resource-finder bace-about-popup flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card font-sans text-card-foreground shadow-lg">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
              <Dialog.Title className="text-base font-semibold">{t("About BACE Hub")}</Dialog.Title>
              <Dialog.Close render={<Button variant="ghost" size="icon" />} aria-label={t("Close introduction")}><X aria-hidden="true" /></Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">{t("Find local support and learn how to use BACE Hub.")}</Dialog.Description>
            <div className="min-h-0 overflow-y-auto"><ResourceIntro onTour={() => { setOpen(false); requestAnimationFrame(onTour); }} /></div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
