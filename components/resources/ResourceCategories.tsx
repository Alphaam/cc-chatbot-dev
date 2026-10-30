"use client";

import { ArrowDown, GraduationCap, Laptop, Wifi } from "lucide-react";
import { useLanguage } from "@/components/chat/LanguageProvider";
import { categoryCounts, CATEGORY_LABELS, type Resource } from "@/lib/resource-finder";

const icons = { internet: Wifi, devices: Laptop, skills: GraduationCap };

export default function ResourceCategories({ resources }: { resources?: Resource[] }) {
  const { t } = useLanguage();
  const categories = categoryCounts(resources ?? []);
  if (!resources) {
    return (
      <ul aria-label={t("Resource categories")} className="finder-coverage">
        {categories.map(({ category }) => {
          const Icon = icons[category];
          return <li key={category} data-category={category}><span className="finder-coverage-icon"><Icon className="size-5 shrink-0" aria-hidden="true" /></span><span>{t(CATEGORY_LABELS[category])}</span></li>;
        })}
      </ul>
    );
  }
  return (
    <nav aria-label={t("Resource categories")} className="finder-categories">
      {categories.map(({ category, count }) => {
        const Icon = icons[category];
        return (
          <a key={category} href={`#${category}`} className="finder-category" data-category={category} data-empty={count === 0}>
            <div className="finder-category-top">
              <Icon className="size-5" aria-hidden="true" />
              <span className="finder-category-count">{count}<span className="sr-only"> {t("results")}</span></span>
            </div>
            <div className="finder-category-label"><span>{t(CATEGORY_LABELS[category])}</span><ArrowDown className="size-4 shrink-0" aria-hidden="true" /></div>
          </a>
        );
      })}
    </nav>
  );
}
