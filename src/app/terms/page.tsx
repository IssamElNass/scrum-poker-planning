"use client";

import {
  AlertCircle,
  Ban,
  Calendar,
  FileText,
  Globe,
  Scale,
  Shield,
  Users,
} from "lucide-react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content:
      "By accessing and using Scrum Planning Poker, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. These terms apply to all users of the site, including without limitation users who are contributors of content.",
  },
  {
    id: "description",
    title: "2. Description of Service",
    content:
      "Scrum Planning Poker provides a free, web-based planning poker tool for Agile teams to estimate work items. The service includes real-time collaboration features, voting mechanisms, and session management. We reserve the right to modify, suspend, or discontinue the service at any time without notice.",
  },
  {
    id: "use-license",
    title: "3. Use License",
    content:
      "Scrum Planning Poker is open source software distributed under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions of the MIT License. The software is provided 'as is', without warranty of any kind.",
  },
  {
    id: "user-conduct",
    title: "4. User Conduct",
    content:
      "You agree not to use the service to: (a) upload or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable; (b) impersonate any person or entity; (c) interfere with or disrupt the service or servers; (d) attempt to gain unauthorized access to any portion of the service; (e) use the service for any illegal or unauthorized purpose.",
  },
  {
    id: "privacy",
    title: "5. Privacy",
    content:
      "Your use of our service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices. We do not sell, trade, or rent your personal identification information to others.",
  },
  {
    id: "content-ownership",
    title: "6. Content Ownership",
    content:
      "You retain ownership of any content you create or share through the service. By using the service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content solely for the purpose of providing and improving the service. Session data is temporary and automatically deleted after use.",
  },
  {
    id: "disclaimers",
    title: "7. Disclaimers and Limitations",
    content:
      "The service is provided on an 'as is' and 'as available' basis. We make no warranties, expressed or implied, and hereby disclaim all warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the service will be uninterrupted, secure, or error-free.",
  },
  {
    id: "liability",
    title: "8. Limitation of Liability",
    content:
      "In no event shall Scrum Planning Poker, its creators, contributors, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use or inability to use the service.",
  },
  {
    id: "indemnification",
    title: "9. Indemnification",
    content:
      "You agree to defend, indemnify, and hold harmless Scrum Planning Poker and its contributors from and against any claims, damages, obligations, losses, liabilities, costs, or expenses arising from: (a) your use of and access to the service; (b) your violation of any term of these Terms of Service; (c) your violation of any third party right.",
  },
  {
    id: "termination",
    title: "10. Termination",
    content:
      "We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service. Upon termination, your right to use the service will cease immediately.",
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    content:
      "These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of the jurisdiction in which the service operator is located, without regard to its conflict of law provisions. Any disputes shall be resolved through good faith negotiations.",
  },
  {
    id: "changes",
    title: "12. Changes to Terms",
    content:
      "We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. If a revision is material, we will provide notice prior to any new terms taking effect by posting the new Terms of Service on this page and updating the 'Last updated' date.",
  },
  {
    id: "contact",
    title: "13. Contact Information",
    content:
      "If you have any questions about these Terms of Service, please contact us through our GitHub repository at https://github.com/IssamElNass/scrum-poker-planning/issues or join the discussion at https://github.com/IssamElNass/scrum-poker-planning/discussions.",
  },
];

export default function TermsPage() {
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
                id="terms-pattern"
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
              fill="url(#terms-pattern)"
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
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Free & Open Source
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-8xl lg:text-9xl">
              <span className="block">Terms of</span>
              <span className="relative block">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Service
                </span>
                {/* Decorative underline */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 rounded-full" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-8 text-xl sm:text-2xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Please read these terms carefully before using
              <span className="font-semibold text-gray-900 dark:text-white">
                {" "}
                Scrum Planning Poker.
              </span>
            </p>

            {/* Last updated */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Last updated: January 1, 2024
            </div>
          </div>
        </div>

        {/* Notice section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <AlertCircle
                    className="h-5 w-5 text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Free and Open Source
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      Scrum Planning Poker is a free, open-source tool licensed
                      under MIT. These terms ensure fair use and protect both
                      users and contributors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms sections */}
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
                <Shield className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  MIT Licensed
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Free to use, modify, and distribute
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <Users className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Community Driven
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Built by and for Agile teams
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <Ban className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  No Warranties
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Provided &apos;as is&apos; under open source terms
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <Globe className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Global Access
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Available worldwide, forever free
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
                <Scale className="mx-auto h-12 w-12 text-primary" />
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Questions about our terms?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-300">
                  We believe in transparency and fairness. If you have any
                  questions about these terms, please reach out through GitHub.
                </p>
                <div className="mt-8 flex items-center justify-center gap-x-4">
                  <a
                    href="https://github.com/IssamElNass/scrum-poker-planning/issues"
                    className="inline-flex items-center text-base font-semibold text-primary hover:text-primary/80"
                  >
                    <FileText className="mr-2 h-4 w-4" />
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
                  Open Source License
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Scrum Planning Poker is licensed under the MIT License. You
                  can find the full license text in our GitHub repository.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Effective Date
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  These terms of service are effective as of January 1, 2024 and
                  apply to all users of the service.
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
