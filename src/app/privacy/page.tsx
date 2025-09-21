"use client";

import {
  Calendar,
  Cookie,
  Database,
  Eye,
  Lock,
  Mail,
  Shield,
} from "lucide-react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content:
      "This Privacy Policy explains how Scrum Poker Planning collects, uses, and protects your information when you use our service. We are committed to ensuring that your privacy is protected and that we handle your data responsibly.",
  },
  {
    id: "information-collection",
    title: "2. Information We Collect",
    content:
      "We collect information to provide better services to our users. This includes: (a) Information you provide directly, such as your username when joining a planning session; (b) Information collected automatically, including IP addresses, browser type, and usage data through Google Analytics; (c) Session data, such as votes and participation in planning poker sessions.",
  },
  {
    id: "cookies",
    title: "3. Cookies and Tracking",
    content:
      "We use cookies and similar tracking technologies to improve your experience. This includes: essential cookies for site functionality, Google Analytics cookies for understanding usage patterns, and session cookies to maintain your login state. You can control cookie settings through your browser preferences.",
  },
  {
    id: "data-usage",
    title: "4. How We Use Your Information",
    content:
      "We use the collected information to: provide and maintain our planning poker service, improve user experience and site functionality, analyze usage patterns to enhance our features, and ensure the security and integrity of our service. We do not sell or rent your personal information to third parties.",
  },
  {
    id: "data-storage",
    title: "5. Data Storage and Security",
    content:
      "Your data is stored securely using industry-standard practices. Session data is temporary and automatically deleted after sessions end. We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.",
  },
  {
    id: "third-party",
    title: "6. Third-Party Services",
    content:
      "We use Google Analytics to analyze website usage and improve our service. Google Analytics may collect and process data according to their own privacy policies. We do not share your personal information with any other third-party services except as required by law.",
  },
  {
    id: "user-rights",
    title: "7. Your Rights",
    content:
      "You have the right to: access the information we hold about you, request correction of any inaccurate information, request deletion of your data, opt-out of analytics tracking, and withdraw consent for data processing. To exercise these rights, please contact us through our GitHub repository.",
  },
  {
    id: "data-retention",
    title: "8. Data Retention",
    content:
      "We retain your information only for as long as necessary to provide our services. Session data is automatically deleted after the planning session ends. Analytics data is retained according to Google Analytics' data retention policies. You can request deletion of your data at any time.",
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    content:
      "Scrum Poker Planning is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.",
  },
  {
    id: "changes",
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last updated' date. Your continued use of the service after changes constitutes acceptance of the updated policy.",
  },
  {
    id: "contact",
    title: "11. Contact Information",
    content:
      "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us through our GitHub repository at https://github.com/IssamElNass/scrum-poker-planning/issues or contribute to the discussion at https://github.com/IssamElNass/scrum-poker-planning/discussions.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      <Header />

      <main
        id="main-content"
        className="relative isolate overflow-hidden bg-white dark:bg-gray-900"
      >
        {/* Background gradient effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg
            className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 dark:stroke-gray-800 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="privacy-pattern"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <svg
              x="50%"
              y={-1}
              className="overflow-visible fill-gray-50 dark:fill-gray-900/20"
            >
              <path
                d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect
              width="100%"
              height="100%"
              strokeWidth={0}
              fill="url(#privacy-pattern)"
            />
          </svg>
          <div
            className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
            aria-hidden="true"
          >
            <div
              className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-primary/30 to-purple-600/30 opacity-20 dark:from-primary/20 dark:to-purple-600/20"
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
              }}
            />
          </div>
        </div>

        {/* Hero section */}
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-2 ring-1 ring-primary/20 backdrop-blur-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Your Privacy Matters
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-8xl lg:text-9xl">
              <span className="block">Privacy</span>
              <span className="relative block">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Policy
                </span>
                {/* Decorative underline */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 rounded-full" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-8 text-xl sm:text-2xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Learn how we collect, use, and protect your information at
              <span className="font-semibold text-gray-900 dark:text-white">
                {" "}
                Scrum Poker Planning.
              </span>
            </p>

            {/* Last updated */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Last updated: September 21, 2025
            </div>
          </div>
        </div>

        {/* Notice section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <Shield
                    className="h-5 w-5 text-green-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Your Privacy Matters
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>
                      We take your privacy seriously. This policy explains our
                      commitment to protecting your data and your rights as a
                      user of Scrum Poker Planning, our open-source planning
                      tool.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy sections */}
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-16">
              {sections.map((section) => (
                <div key={section.id} id={section.id}>
                  <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-base/7 text-gray-600 dark:text-gray-400">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key features section */}
        <div className="mx-auto mt-24 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <Cookie className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Cookie Control
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Manage your cookie preferences through your browser
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <Database className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Minimal Data
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  We only collect what&apos;s necessary for the service
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <Lock className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Secure Storage
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Industry-standard security measures protect your data
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <Eye className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Transparency
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Open source code means full transparency
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact section */}
        <div className="mx-auto mt-24 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 px-6 py-10 sm:px-10 sm:py-16 lg:px-12">
              <div className="mx-auto max-w-2xl text-center">
                <Lock className="mx-auto h-12 w-12 text-primary" />
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Questions about privacy?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-300">
                  We&apos;re committed to transparency. If you have any
                  questions about how we handle your data, please reach out
                  through GitHub.
                </p>
                <div className="mt-8 flex items-center justify-center gap-x-4">
                  <a
                    href="https://github.com/IssamElNass/scrum-poker-planning/issues"
                    className="inline-flex items-center text-base font-semibold text-primary hover:text-primary/80"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact via GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mx-auto mt-24 max-w-7xl px-6 lg:px-8 mb-24">
          <div className="mx-auto max-w-4xl border-t border-gray-200 dark:border-gray-800 pt-16 sm:pt-20">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Additional Information
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Effective Date
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  This privacy policy is effective as of September 21, 2025 and
                  will remain in effect except with respect to any changes in
                  its provisions in the future.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Open Source Commitment
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  As an open-source project, Scrum Poker Planning&apos;s code is
                  publicly available for review on GitHub, ensuring complete
                  transparency in how we handle data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
