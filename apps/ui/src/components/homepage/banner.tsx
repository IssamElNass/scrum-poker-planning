import { Sparkles } from "lucide-react";

export const Banner = () => {
  return (
    <aside
      aria-label="Latest features announcement"
      className="relative isolate flex items-center justify-center gap-x-6 overflow-hidden bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 dark:from-primary/10 dark:via-purple-500/10 dark:to-pink-500/10 px-6 py-3 border-b border-primary/10 dark:border-primary/20 z-50"
    >
      {/* Animated background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="absolute -top-2 right-8 w-6 h-6 bg-purple-500/20 rounded-full animate-bounce [animation-delay:-0.1s]" />
        <div className="absolute -bottom-3 left-16 w-7 h-7 bg-pink-500/20 rounded-full animate-bounce [animation-delay:-0.7s]" />
        <div className="absolute -bottom-4 -right-2 w-5 h-5 bg-primary/20 rounded-full animate-bounce [animation-delay:-0.5s]" />
      </div>

      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles
              className="h-5 w-5 text-primary animate-pulse"
              aria-hidden="true"
            />
            <div className="absolute inset-0 h-5 w-5 text-primary/50 animate-ping">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="h-4 w-px bg-primary/30" />
        </div>

        <p className="text-sm leading-6 text-gray-900 dark:text-gray-100 font-medium">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-bold">
            🚀 v1.0.0 Launch Special
          </span>
          <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
          <span>
            Complete redesign with enhanced features.{" "}
            <a
              href="https://github.com/INQTR/poker-planning/releases"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors group"
            >
              Explore now
              <span
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </span>
        </p>
      </div>
    </aside>
  );
};
