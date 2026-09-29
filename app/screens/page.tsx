'use client';
// Internal capture harness (not linked in the app): renders the real Clark County
// chatbot components at a fixed mobile size so the presentation can embed authentic
// app screens inside iPhone frames. Real components + real service data, no live APIs.
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { House, MapPin, MessageSquarePlus } from 'lucide-react';
import { LanguageProvider, LanguageToggle } from '@/components/chat/LanguageProvider';
import PromptSuggestions from '@/components/chat/PromptSuggestions';
import ServiceCard from '@/components/chat/ServiceCard';
import ChatInput from '@/components/chat/ChatInput';
import { getServicesNearAddress, getTopServices, type ServiceWithDistance } from '@/lib/services-lookup';

// Downtown Las Vegas (the app's own Clark County proximity anchor) so the matches
// are real, distance-sorted resources from the production dataset.
const ANCHOR = { lat: 36.1699, lon: -115.1398 };
const CONFIRMED_ADDRESS = '600 S Grand Central Pkwy, Las Vegas, NV 89106';
const groups = getServicesNearAddress(ANCHOR.lat, ANCHOR.lon);
const topServices = getTopServices(groups, 3);
const detailService: ServiceWithDistance =
  topServices.find(s => s.description) ?? topServices[0];

function AppHeader({ withNav }: { withNav: boolean }) {
  return (
    <header className="bg-primary text-primary-foreground shrink-0 shadow-sm ring-1 ring-black/5 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-3 py-3.5 text-sm">
        {withNav && (
          <nav aria-label="Client navigation" className="order-2 flex basis-full shrink-0 items-center gap-1 sm:order-first sm:basis-auto">
            <span className="flex size-11 items-center justify-center rounded-xl"><House aria-hidden="true" className="size-5" strokeWidth={2.25} /></span>
            <span className="flex size-11 items-center justify-center rounded-xl"><MessageSquarePlus aria-hidden="true" className="size-5" strokeWidth={2.25} /></span>
          </nav>
        )}
        <div className="min-w-0 flex-1 basis-0">
          <h1 className="text-xl sm:text-xl font-semibold tracking-tight text-balance leading-tight">Clark County Digital Equity Assistant</h1>
        </div>
        <div className="order-1 ml-auto shrink-0 sm:order-3"><LanguageToggle /></div>
      </div>
    </header>
  );
}

function AddressRow() {
  return (
    <div className="border-b border-border bg-card/70 backdrop-blur-sm text-foreground px-4 py-2.5 sm:px-6">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm min-w-0">
          <MapPin aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span className="text-muted-foreground shrink-0">Current address</span>
          <span className="font-medium truncate">{CONFIRMED_ADDRESS}</span>
        </p>
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] px-4 py-3 text-[0.95rem] leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm">{children}</div>
    </div>
  );
}

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] px-4 py-3 text-[0.95rem] leading-relaxed whitespace-pre-wrap bg-card border border-border text-card-foreground rounded-2xl rounded-bl-md shadow-sm">{children}</div>
    </div>
  );
}

function Transcript({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">{children}</div>
      </div>
    </main>
  );
}

function Screen() {
  const s = useSearchParams().get('s') ?? 'need';

  if (s === 'need') {
    return (
      <div className="flex flex-col h-dvh bg-background">
        <AppHeader withNav={false} />
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <PromptSuggestions onSelect={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  if (s === 'place') {
    return (
      <div className="flex flex-col h-dvh bg-background">
        <AppHeader withNav />
        <Transcript>
          <UserBubble>Find internet plans at my client&apos;s address</UserBubble>
          <AssistantBubble>Happy to help. What is the client&apos;s address? Include the city and ZIP code so results match where they live.</AssistantBubble>
        </Transcript>
        <div className="bg-card border-t border-border px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={() => {}} placeholder="Type @ to search an address, or ask a question…" />
          </div>
        </div>
      </div>
    );
  }

  if (s === 'match') {
    return (
      <div className="flex flex-col h-dvh bg-background">
        <AppHeader withNav />
        <AddressRow />
        <Transcript>
          <UserBubble>{CONFIRMED_ADDRESS}</UserBubble>
          <AssistantBubble>Here are the digital-equity resources nearest to this address. Providers confirm availability and eligibility.</AssistantBubble>
          <ServiceCard services={topServices} title="Digital Equity Resources" />
        </Transcript>
      </div>
    );
  }

  // detail / referral
  return (
    <div className="flex flex-col h-dvh bg-background">
      <AppHeader withNav />
      <AddressRow />
      <Transcript>
        <AssistantBubble>Here are the details for this resource, including how to reach them and what they offer.</AssistantBubble>
        <ServiceCard services={[detailService]} title="Resource details" />
      </Transcript>
    </div>
  );
}

export default function ScreensHarness() {
  return (
    <LanguageProvider initialLocale="en">
      <Suspense fallback={null}>
        <Screen />
      </Suspense>
    </LanguageProvider>
  );
}
