import { ArrowUpRight, Megaphone } from "lucide-react";

export function ServiceAnnouncement() {
  return (
    <aside
      aria-labelledby="service-announcement-title"
      className="relative z-40 shrink-0 border-b border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 sm:items-center sm:px-6 lg:px-8">
        <Megaphone aria-hidden="true" className="mt-0.5 hidden size-5 shrink-0 sm:block" />
        <div className="min-w-0 flex-1">
          <h2 id="service-announcement-title" className="text-sm font-bold">
            Scrum Poker Planning will shut down on December 1, 2026
          </h2>
          <p className="mt-1 text-sm leading-relaxed">
            Rising hosting costs mean we can no longer keep this service running.
            The original maintainer&apos;s app, AgileKit, is back online. Please use
            AgileKit for future planning sessions. Thank you for your support!
          </p>
          <a
            href="https://agilekit.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 rounded-sm text-sm font-bold underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          >
            Continue planning at agilekit.app
            <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
