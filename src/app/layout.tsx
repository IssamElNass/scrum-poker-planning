import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scrum Poker Planning for Teams | ScrumPokerPlanning.org",
  description:
    "Free online scrum poker planning tool for agile teams. Real-time collaboration, no registration required.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "scrum-poker-planning.org",
    title: "Scrum Poker Planning for Teams",
    description: "Free online scrum poker planning tool.",
    images: "/og-image.png",
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
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
