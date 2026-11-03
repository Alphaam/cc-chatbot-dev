"use client";

import { ArrowDown, GraduationCap, Laptop, Wifi } from "lucide-react";
import { useLanguage } from "@/components/chat/LanguageProvider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { categoryCounts, CATEGORIES, CATEGORY_LABELS, type Resource, type ResourceCategory } from "@/lib/resource-finder";

const icons = { internet: Wifi, devices: Laptop, skills: GraduationCap };
const SHORT_LABELS: Record<ResourceCategory, string> = { internet: "Internet", devices: "Devices", skills: "Digital skills" };

export type ResourceFocus = ResourceCategory | "all";

export default function ResourceCategories({
  resources,
  focus,
  onFocusChange,
}: {
  resources: Resource[];
  focus: ResourceFocus;
  onFocusChange: (focus: ResourceFocus) => void;
}) {
  const { t } = useLanguage();
  const categories = categoryCounts(resources);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span id="focus-label" className="text-sm font-medium text-muted-foreground">{t("Show")}</span>
        <ToggleGroup
          aria-labelledby="focus-label"
          variant="outline"
          size="sm"
          spacing={0}
          value={[focus]}
          onValueChange={(value) => onFocusChange((value[0] as ResourceFocus | undefined) ?? "all")}
          className="finder-focus"
        >
          <ToggleGroupItem value="all">{t("All types")}</ToggleGroupItem>
          {CATEGORIES.map((category) => (
            <ToggleGroupItem key={category} value={category} data-category={category}>
              {t(SHORT_LABELS[category])}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <nav aria-label={t("Resource categories")} className="finder-categories">
        {categories.map(({ category, count }) => {
          const Icon = icons[category];
          const hidden = focus !== "all" && focus !== category;
          return (
            <a
              key={category}
              href={`#${category}`}
              className="finder-category"
              data-category={category}
              data-empty={count === 0}
              data-dimmed={hidden}
              onClick={(event) => {
                if (!hidden) return;
                event.preventDefault();
                onFocusChange(category);
                requestAnimationFrame(() => document.getElementById(category)?.scrollIntoView({ block: "start" }));
              }}
            >
              <div className="finder-category-top">
                <Icon className="size-5" aria-hidden="true" />
                <span className="finder-category-count">{count}<span className="sr-only"> {t("results")}</span></span>
              </div>
              <div className="finder-category-label"><span>{t(CATEGORY_LABELS[category])}</span><ArrowDown className="size-4 shrink-0" aria-hidden="true" /></div>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
