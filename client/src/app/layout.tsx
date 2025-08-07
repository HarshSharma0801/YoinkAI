import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yoink AI - AI-Powered Content Creation",
  description:
    "Create scripts, generate images, and produce videos with AI assistance. Powered by OpenAI GPT-4 and DALL-E 3.",
  keywords: [
    "AI",
    "content creation",
    "script writing",
    "image generation",
    "video production",
    "OpenAI",
    "GPT-4",
    "DALL-E",
  ],
  authors: [{ name: "Yoink AI Team" }],
  creator: "Yoink AI",
  publisher: "Yoink AI",
  openGraph: {
    title: "Yoink AI - AI-Powered Content Creation",
    description:
      "Create scripts, generate images, and produce videos with AI assistance.",
    siteName: "Yoink AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yoink AI - AI-Powered Content Creation",
    description:
      "Create scripts, generate images, and produce videos with AI assistance.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
