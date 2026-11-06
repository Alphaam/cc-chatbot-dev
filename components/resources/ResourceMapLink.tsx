"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Map as MapIcon } from "lucide-react";
import { useLanguage } from "@/components/chat/LanguageProvider";
import { useResourceMapSession, type ResourceMapSession } from "./useResourceMapSession";
import { resourcesFromLookup } from "@/lib/resource-finder";
import { mappedIdsFromResources } from "@/lib/resource-map";

export default function ResourceMapLink({ snapshot, compact = false, disabled = false }: { snapshot: ResourceMapSession; compact?: boolean; disabled?: boolean }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { mutate } = useResourceMapSession();
  const resources = snapshot.result ? resourcesFromLookup(snapshot.result) : [];
  const selectedCount = mappedIdsFromResources(resources.filter((resource) => snapshot.selected.includes(resource.id))).size;
  const count = selectedCount || mappedIdsFromResources(resources).size;
  return (
    <Link href="/map" className={compact ? "bace-mobile-map-link lg:hidden" : "bace-rail-action"} aria-label={count ? t("Open resource map ({count} resources)", { count }) : t("Open resource map")} title={count ? t("Resource map ({count} resources)", { count }) : t("Resource map")} aria-disabled={disabled || undefined}
      onNavigate={(event) => {
        event.preventDefault();
        if (disabled) return;
        void mutate(snapshot, { revalidate: false }).then(() => router.push("/map"));
      }}>
      <span className="relative flex size-6 items-center justify-center"><MapIcon className="size-5" aria-hidden="true" />{count > 0 && <span className="bace-selection-count" aria-hidden="true">{count}</span>}</span>
      {!compact && <span>{t("Map")}</span>}
    </Link>
  );
}
