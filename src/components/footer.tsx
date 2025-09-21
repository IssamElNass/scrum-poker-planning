"use client";

import Image from "next/image";
import Link from "next/link";
import { SVGProps } from "react";

const navigation = {
  product: [
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Use Cases", href: "/#use-cases" },
    { name: "FAQ", href: "/#faq" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Open Source", href: "https://github.com/INQTR/poker-planning" },
    {
      name: "Contribute",
      href: "https://github.com/INQTR/poker-planning/blob/main/CONTRIBUTING.md",
    },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    {
      name: "License",
      href: "https://github.com/INQTR/poker-planning/blob/main/LICENSE",
    },
  ],
  social: [
    {
      name: "X",
      href: "https://x.com/spok_vulkan",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/INQTR/poker-planning",
      icon: (props: SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
};

export const Footer = () => {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-black dark:via-blue-950 dark:to-purple-950"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </div>

      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link
              href="/"
              className="group flex items-center transition-transform duration-300 hover:scale-105"
            >
              <div className="relative mr-3">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-lg"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Scrum Planning Poker
              </span>
            </Link>
            <p className="text-base leading-7 text-gray-300 max-w-md">
              The free, open-source Scrum Planning Poker tool for Agile teams.
              Improve your sprint planning and estimation accuracy with
              real-time collaboration.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group relative p-2 rounded-lg bg-white/5 backdrop-blur-sm ring-1 ring-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="h-5 w-5" />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-bold leading-6 text-white mb-2">
                  Product
                </h3>
                <div className="h-px w-12 bg-gradient-to-r from-primary to-purple-500 mb-6" />
                <ul className="space-y-3">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      {item.href.startsWith("http") ? (
                        <a
                          href={item.href}
                          className="group inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-primary transition-colors duration-300 mr-3" />
                          {item.name}
                        </a>
                      ) : item.href.startsWith("/#") ? (
                        <a
                          href={item.href}
                          className="group inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-primary transition-colors duration-300 mr-3" />
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="group inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-300"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-primary transition-colors duration-300 mr-3" />
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-bold leading-6 text-white mb-2">
                  Company
                </h3>
                <div className="h-px w-12 bg-gradient-to-r from-primary to-purple-500 mb-6" />
                <ul className="space-y-3">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      {item.href.startsWith("http") ? (
                        <a
                          href={item.href}
                          className="group inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-primary transition-colors duration-300 mr-3" />
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="group inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-300"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-primary transition-colors duration-300 mr-3" />
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold leading-6 text-white mb-2">
                Legal
              </h3>
              <div className="h-px w-12 bg-gradient-to-r from-primary to-purple-500 mb-6" />
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    {item.href.startsWith("http") ? (
                      <a
                        href={item.href}
                        className="group inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-primary transition-colors duration-300 mr-3" />
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="group inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-300"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-500 group-hover:bg-primary transition-colors duration-300 mr-3" />
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Scrum Planning Poker. Open
              source under MIT License.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>Made with</span>
              <span className="text-red-400 animate-pulse">❤️</span>
              <span>by the community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
