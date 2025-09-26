import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://scrumpokerplanning.org"
  ),
  title: "Free & Open Source Scrum Poker Planning | ScrumPokerPlanning.org",
  description:
    "100% free and open source scrum poker planning tool for agile teams. Real-time collaboration, no registration required, no limits. Forever free.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "scrum-poker-planning.org",
    title: "Free & Open Source Scrum Poker Planning for Teams",
    description:
      "100% free and open source scrum poker planning tool. No registration, no limits, forever free.",
    images: "/og_image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free & Open Source Scrum Poker Planning",
    description:
      "100% free and open source scrum poker planning tool for agile teams.",
    images: "/og_image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster richColors />
        </Providers>
      </body>
      <script
        async
        src="https://scripts.simpleanalyticscdn.com/latest.js"
      ></script>
    </html>
  );
}
