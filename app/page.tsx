import { cookies } from 'next/headers';
import Chatbot from '@/components/chat/Chatbot';
import { LanguageProvider } from '@/components/chat/LanguageProvider';
import { translate } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get('cc-language')?.value === 'es' ? 'es' : 'en';
  return {
    title: translate(locale, 'Clark County Digital Equity Assistant'),
    description: translate(locale, 'Find internet plans and digital inclusion resources for Clark County, Nevada. Available in English and Spanish.'),
  };
}

export default async function Home() {
  const locale = (await cookies()).get('cc-language')?.value === 'es' ? 'es' : 'en';
  return <LanguageProvider initialLocale={locale}><Chatbot /></LanguageProvider>;
}
