import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import { Presentation } from "@/components/presentation/presentation";
import "./editorial.css";
import "./rebuilt.css";

const albert = Albert_Sans({ subsets: ["latin"], variable: "--font-presentation", display: "swap" });

export const metadata: Metadata = {
  title: "Custom products. Expertly built. | HR&A Tech & Society Studio",
  description: "HR&A Tech & Society Studio's merged custom products presentation (Part 1 + Part 2), rebuilt with native text and layouts for selectable-text PDF and editable PowerPoint export.",
  robots: { index: false, follow: false },
};

export default async function PresentationPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const { draft } = await searchParams;
  const version = draft === "studio" ? "studio" : draft === "chatbot" ? "chatbot" : draft === "grantee" ? "grantee" : "original";
  return <div className={albert.variable}><Presentation key={version} version={version} /></div>;
}
