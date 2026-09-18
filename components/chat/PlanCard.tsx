'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import CopyButton from './CopyButton';
import TextButton from './TextButton';
import DownloadCsvButton from './DownloadCsvButton';
import { flattenPlans, getCheapestPlan, getFastestPlan, getProviderWebsite, type Plan, type PlanGroups } from '@/lib/plan-utils';

// CSV price strings already include a leading "$" (e.g. "$65.00 ") — strip
// it before re-adding our own to avoid rendering "$$65.00".
export const formatPrice = (price: string): string => `$${price.trim().replace(/^\$/, '')}`;

const PLAN_CSV_HEADER = ['Plan', 'Provider', 'Technology', 'Price/mo', 'Download Mbps', 'Upload Mbps', 'Low-Income Discount', 'Contract', 'Meets 100/25 Mbps'];

export const planCsvRows = (plans: Plan[]): Array<Array<string | number>> => [
  PLAN_CSV_HEADER,
  ...plans.map(p => [
    p.planName || p.provider,
    p.provider,
    p.technology,
    formatPrice(p.price),
    p.downloadMbps,
    p.uploadMbps,
    p.lowIncome === 'Y' ? `$${p.liDiscount}` : '',
    p.contract === 'Y' ? `${p.contractMonths} months` : 'No contract',
    p.meetsThreshold ? 'Yes' : 'No',
  ]),
];

export const formatPlanSms = (plan: Plan, address?: string): string => {
  const website = getProviderWebsite(plan.provider);
  const lines = [
    address ? `INTERNET AT ${address.toUpperCase()}` : 'INTERNET PLAN',
    '━━━━━━━━━━━━━━━━━━━━',
    `${plan.provider} (${plan.technology})`,
    `• Speed: ${plan.downloadMbps} Mbps down / ${plan.uploadMbps} Mbps up`,
    `• Price: ${formatPrice(plan.price)}/mo`,
  ];
  if (plan.introDiscount) lines.push(`• Intro: ${plan.introDiscount} for ${plan.introPeriod} mo`);
  if (plan.lowIncome === 'Y') lines.push(`• Low-income discount: $${plan.liDiscount} off`);
  if (plan.contract === 'Y') lines.push(`• Contract: ${plan.contractMonths} months`);
  if (plan.installFee) lines.push(`• Install: ${plan.installFee}`);
  if (website) lines.push(`• Sign up: ${website}`);
  lines.push('', 'Questions? clark.gov/broadband');
  return lines.join('\n');
};

export function PlanRow({ plan, address }: { plan: Plan; address?: string }) {
  const website = getProviderWebsite(plan.provider);
  return (
    <div className="border-b border-border last:border-0 py-3.5 px-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground truncate">{plan.planName || plan.provider}</p>
          <p className="text-sm text-muted-foreground">{plan.technology}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-semibold text-foreground tabular-nums">{formatPrice(plan.price)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          <p className="text-sm text-muted-foreground tabular-nums">{plan.downloadMbps}/{plan.uploadMbps} Mbps</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {plan.lowIncome === 'Y' && (
          <span className="text-xs font-medium bg-success-muted text-success-muted-foreground px-2 py-0.5 rounded-full">Low-income discount</span>
        )}
        {plan.contract === 'N' && (
          <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">No contract</span>
        )}
        {plan.meetsThreshold && (
          <span className="text-xs font-medium bg-brand-muted text-brand-muted-foreground px-2 py-0.5 rounded-full">100/25 Mbps+</span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2.5">
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Visit website <ExternalLink size={11} />
          </a>
        )}
        <CopyButton text={formatPlanSms(plan, address)} />
        <TextButton text={formatPlanSms(plan, address)} />
      </div>
    </div>
  );
}

interface Props {
  planGroups: PlanGroups;
  address?: string;
  mode?: 'top' | 'all';
}

export function RecommendedPlanCard({ plan, address, note }: { plan: Plan; address?: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-card shadow-sm overflow-hidden mt-3 ring-1 ring-primary/10">
      <div className="px-4 py-3 bg-primary">
        <p className="text-base font-semibold text-primary-foreground">Recommended plan</p>
        {address && <p className="text-sm text-primary-foreground/80 mt-0.5">{address}</p>}
      </div>
      {note && <p className="px-4 pt-3 text-sm text-muted-foreground">{note}</p>}
      <PlanRow plan={plan} address={address} />
    </div>
  );
}

export default function PlanCard({ planGroups, address, mode = 'all' }: Props) {
  const [openProviders, setOpenProviders] = useState<Set<string>>(
    () => (mode === 'top' ? new Set(['__cheapest', '__fastest']) : new Set())
  );

  const toggle = (key: string) => {
    setOpenProviders(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (mode === 'top') {
    const all = flattenPlans(planGroups);
    const cheapest = getCheapestPlan(all);
    const fastest = getFastestPlan(all);
    const same = !!cheapest && !!fastest && cheapest === fastest;
    const shown = same ? [cheapest!] : [cheapest, fastest].filter((p): p is Plan => !!p);

    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-3">
        <div className="px-4 py-3 bg-brand-muted border-b border-border flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-brand-muted-foreground">Internet plans available</p>
            {address && <p className="text-sm text-brand-muted-foreground/80 mt-0.5">{address}</p>}
          </div>
          {shown.length > 0 && <DownloadCsvButton filename="internet-plans.csv" rows={planCsvRows(shown)} className="shrink-0 mt-0.5" />}
        </div>

        {cheapest && (
          <div>
            <button
              onClick={() => toggle('__cheapest')}
            className="w-full flex items-center justify-between px-4 py-3 text-[0.95rem] font-medium text-foreground hover:bg-muted transition-colors"
          >
            <span>Lowest-cost plan</span>
              {openProviders.has('__cheapest') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openProviders.has('__cheapest') && <PlanRow plan={cheapest} address={address} />}
          </div>
        )}

        {same ? (
          <p className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
            This is also the fastest plan available at this address.
          </p>
        ) : fastest && (
          <div className="border-t border-border">
            <button
              onClick={() => toggle('__fastest')}
              className="w-full flex items-center justify-between px-4 py-3 text-[0.95rem] font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span>Fastest plan</span>
              {openProviders.has('__fastest') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openProviders.has('__fastest') && <PlanRow plan={fastest} address={address} />}
          </div>
        )}
      </div>
    );
  }

  const hasThreshold = planGroups.threshold.length > 0;
  const otherProviders = Object.entries(planGroups.byProvider);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-3">
      <div className="px-4 py-3 bg-brand-muted border-b border-border">
        <p className="text-base font-semibold text-brand-muted-foreground">Internet plans available</p>
        {address && <p className="text-sm text-brand-muted-foreground/80 mt-0.5">{address}</p>}
      </div>

      {hasThreshold && (
        <div>
          <button
            onClick={() => toggle('__threshold')}
            className="w-full flex items-center justify-between px-4 py-3 text-[0.95rem] font-medium text-foreground hover:bg-muted transition-colors"
          >
            <span>High-speed plans (100/25 Mbps+)</span>
            {openProviders.has('__threshold') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openProviders.has('__threshold') && planGroups.threshold.map((p, i) => (
            <PlanRow key={i} plan={p} address={address} />
          ))}
        </div>
      )}

      {otherProviders.map(([provider, plans]) => (
        <div key={provider} className="border-t border-border">
          <button
            onClick={() => toggle(provider)}
            className="w-full flex items-center justify-between px-4 py-3 text-[0.95rem] font-medium text-foreground hover:bg-muted transition-colors"
          >
            <span>{provider}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{plans.length} plan{plans.length !== 1 ? 's' : ''}</span>
              {openProviders.has(provider) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
          {openProviders.has(provider) && plans.map((p, i) => (
            <PlanRow key={i} plan={p} address={address} />
          ))}
        </div>
      ))}
    </div>
  );
}
