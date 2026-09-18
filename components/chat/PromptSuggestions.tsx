'use client';
import { Globe, GraduationCap, Laptop, ArrowRight, type LucideIcon } from 'lucide-react';

export type PromptIntent = 'plans' | 'services';

const PROMPTS: Array<{ label: string; description: string; prompt: string; Icon: LucideIcon; intent: PromptIntent }> = [
  { label: 'Internet plans', description: "Find broadband options at your client's address", prompt: "Find internet plans at my client's address", Icon: Globe, intent: 'plans' },
  { label: 'Digital skills training', description: 'Locate classes and coaching near your client', prompt: 'Find digital skills training near my client', Icon: GraduationCap, intent: 'services' },
  { label: 'Free or low-cost devices', description: 'Find computers and tablets for your client', prompt: 'Find free or low-cost devices for my client', Icon: Laptop, intent: 'services' },
];

interface Props {
  onSelect: (prompt: string, intent: PromptIntent) => void;
}

export default function PromptSuggestions({ onSelect }: Props) {
  return (
    <div className="flex flex-col gap-7 py-6 sm:py-10">
      <div className="text-center max-w-xl mx-auto">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Clark County, Nevada
        </span>
        <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance">
          What can I help this client find?
        </h2>
        <p className="mt-2.5 text-base leading-relaxed text-muted-foreground text-pretty">
          Choose a starting point below, or type a question. I&apos;ll use the client&apos;s address to
          show the internet plans and digital-equity resources available to them.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {PROMPTS.map(({ label, description, prompt, Icon, intent }) => (
          <button
            key={label}
            onClick={() => onSelect(prompt, intent)}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon aria-hidden="true" className="size-5" strokeWidth={2.25} />
            </span>
            <span className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-base font-semibold text-foreground">
                {label}
                <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none" />
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">{description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
