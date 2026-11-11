import { Providers } from "@/components/providers";
import { ServiceAnnouncement } from "@/components/service-announcement";
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
    "Scrum Poker Planning will shut down on December 1, 2026 due to rising hosting costs. Continue planning at agilekit.app.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "scrum-poker-planning.org",
    title: "Free & Open Source Scrum Poker Planning for Teams",
    description:
      "Scrum Poker Planning will shut down on December 1, 2026 due to rising hosting costs. Continue planning at agilekit.app.",
    images: "/og_image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free & Open Source Scrum Poker Planning",
    description:
      "Scrum Poker Planning will shut down on December 1, 2026 due to rising hosting costs. Continue planning at agilekit.app.",
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
      <body className={`${inter.className} flex h-dvh flex-col`}>
        <ServiceAnnouncement />
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <Providers>
            {children}
            <Toaster richColors />
          </Providers>
        </div>
      </body>
      <script
        async
        src="https://scripts.simpleanalyticscdn.com/latest.js"
      ></script>
    </html>
  );
}
