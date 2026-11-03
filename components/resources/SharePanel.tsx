"use client";

import { ClipboardList, Download, FileText, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/chat/LanguageProvider";

interface ShareActionsProps {
  count: number;
  disabled: boolean;
  downloading: boolean;
  status?: string;
  onDownload: () => void;
  onShareList: () => void;
  onShareNote: () => void;
}

export function SharePanel({ count, disabled, downloading, status, onDownload, onShareList, onShareNote }: ShareActionsProps) {
  const { t } = useLanguage();
  const off = disabled || !count;

  return (
    <section aria-labelledby="shortlist-title" className="finder-handoff p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
            <ClipboardList className="size-5" aria-hidden="true" />
          </span>
          <h2 id="shortlist-title" className="text-base font-semibold tracking-tight">
            {t("Resources to share")} <span className="font-normal text-muted-foreground">({count})</span>
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          <Button disabled={off || downloading} onClick={onDownload}>
            <Download data-icon="inline-start" aria-hidden="true" />
            {t(downloading ? "Preparing PDF…" : "Download resource list (PDF)")}
          </Button>
          <Button variant="outline" disabled={off} onClick={onShareList}>
            <Send data-icon="inline-start" aria-hidden="true" />
            {t("Share resource list")}
          </Button>
          <Button variant="ghost" disabled={off} onClick={onShareNote}>
            <FileText data-icon="inline-start" aria-hidden="true" />
            {t("Share case note")}
          </Button>
        </div>
        {status && <p className="text-sm text-primary">{t(status)}</p>}
      </div>
    </section>
  );
}

export function ShareMenu({ count, disabled, downloading, onDownload, onShareList, onShareNote }: ShareActionsProps) {
  const { t } = useLanguage();
  const off = disabled || !count;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="finder-share-trigger" />}
        aria-label={`${t("Resources to share")} (${count})`}
      >
        <Share2 data-icon="inline-start" aria-hidden="true" />
        <span className="finder-share-count" aria-hidden="true">{count}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t("Resources to share")} ({count})
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={off || downloading} onClick={onDownload}>
            <Download aria-hidden="true" />
            {t(downloading ? "Preparing PDF…" : "Download resource list (PDF)")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={off} onClick={onShareList}>
            <Send aria-hidden="true" />
            {t("Share resource list")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={off} onClick={onShareNote}>
            <FileText aria-hidden="true" />
            {t("Share case note")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
