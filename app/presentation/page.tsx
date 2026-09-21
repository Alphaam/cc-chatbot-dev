import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import { Presentation } from "@/components/presentation/presentation";

const albert = Albert_Sans({ subsets: ["latin"], variable: "--font-presentation", display: "swap" });

export const metadata: Metadata = {
  title: "Public purpose. Product thinking. | HR&A Tech & Society",
  description: "A product development presentation exploring HR&A's public-interest expertise and the Clark County Digital Equity Assistant.",
  robots: { index: false, follow: false },
};

export default function PresentationPage() {
  return <div className={albert.variable}><Presentation /></div>;
}
