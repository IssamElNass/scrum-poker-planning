import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Scrum Poker Planning?",
    answer:
      "Scrum Poker Planning is an agile estimation technique where team members use cards to vote on the complexity of user stories. It helps teams reach consensus on effort estimates through discussion and collaboration, making sprint planning more accurate and engaging.",
  },
  {
    question: "How much does Scrum Poker Planning cost?",
    answer:
      "Scrum Poker Planning is completely free forever. There are no hidden costs, premium tiers, or limitations on team size or number of sessions. As an open-source project, we believe in making quality tools accessible to everyone.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is required! Simply click 'Start Planning Now' and share the room link with your team. We designed it this way to remove barriers and get your team estimating as quickly as possible.",
  },
  {
    question: "How many people can join a planning session?",
    answer:
      "There's no limit on the number of participants in a planning session. Whether you have 5 or 500 team members, everyone can join and participate seamlessly.",
  },
  {
    question: "What are the room settings available?",
    answer:
      "Room settings include customizing voting card sets (Fibonacci, T-shirt sizes, or custom values), enabling/disabling the timer, setting room visibility, and configuring whether votes are revealed automatically or manually.",
  },
  {
    question: "Can I join as an observer?",
    answer:
      "Yes! You can join any room as an observer. Observers can see the voting process and results but cannot vote themselves. This is perfect for stakeholders, product owners, or team members who want to follow along without participating in the estimation.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We don't store any of your planning data on our servers. Session data exists only in your browser's memory and is cleared when you close the room. We also don't track or collect any personal information.",
  },
  {
    question: "Can I use this tool offline or self-host it?",
    answer:
      "While the online version requires an internet connection, the entire codebase is open-source on GitHub. You can download and host your own instance for offline use or to meet specific security requirements.",
  },
  {
    question: "What browsers and devices are supported?",
    answer:
      "Scrum Poker Planning works on all modern browsers (Chrome, Firefox, Safari, Edge) and is fully responsive on desktop, tablet, and mobile devices. No app installation required - it works directly in your browser.",
  },
  {
    question: "How does it compare to other planning poker tools?",
    answer:
      "Unlike other tools that charge monthly fees or limit features, we offer everything for free with no restrictions. Our tool is open-source, requires no registration, and includes features like real-time voting, multiple card sets, room settings, observer mode, and team collaboration.",
  },
  {
    question: "Can I contribute to the project?",
    answer:
      "Yes! We welcome contributions. Visit our GitHub repository to report bugs, suggest features, or submit pull requests. You can also star the project to show your support.",
  },
];

export function FAQ() {
  return (
    <div
      id="faq"
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/30"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[10%] w-72 h-72 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
              linear-gradient(to right, rgb(99 102 241 / 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(99 102 241 / 0.05) 1px, transparent 1px)
            `,
              backgroundSize: "80px 80px",
            }}
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 ring-1 ring-blue-500/20 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Got Questions?
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              <span className="block mb-2">Frequently Asked</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>

            <p className="text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to know about planning poker and our platform
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`item-${index}`}
                  className="rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-800/50 border-0 mb-4"
                >
                  <AccordionTrigger className="px-6 py-6 text-left text-lg font-semibold text-gray-900 dark:text-white hover:no-underline">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </span>
                      <span className="flex-1 text-left">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 text-gray-600 dark:text-gray-300">
                    <div className="ml-12 pb-6 text-base leading-7">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="inline-flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-black dark:via-blue-950 dark:to-purple-950 p-8 shadow-2xl">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
                <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl" />
              </div>

              <div className="relative">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Still have questions?
                </h3>
                <p className="text-gray-300 mb-6 max-w-md">
                  Our community is here to help. Join the conversation or reach
                  out directly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <a
                    href="https://github.com/INQTR/poker-planning"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20 transition-colors group"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    View GitHub Repository
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </a>

                  <a
                    href="https://github.com/INQTR/poker-planning/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-500/20 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-blue-300 ring-1 ring-blue-400/30 hover:bg-blue-500/30 transition-colors group"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    Open an Issue
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
