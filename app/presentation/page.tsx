import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import { Presentation } from "@/components/presentation/presentation";
import "./editorial.css";
import "./rebuilt.css";

const albert = Albert_Sans({ subsets: ["latin"], variable: "--font-presentation", display: "swap" });

export const metadata: Metadata = {
  title: "Custom products. Expertly built. | HR&A Tech & Society Studio",
  description: "HR&A Tech & Society Studio's 10-slide custom products presentation, rebuilt with native text and layouts for selectable-text PDF export, alongside the Clark County and Studio + tools editions.",
  robots: { index: false, follow: false },
};

export default async function PresentationPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const { draft } = await searchParams;
  const version = draft === "studio" ? "studio" : draft === "chatbot" ? "chatbot" : "original";
  return <div className={albert.variable}><Presentation key={version} version={version} /></div>;
}
