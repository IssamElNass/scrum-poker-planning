import { ArrowRight } from "lucide-react";

interface CallToActionProps {
  onStartGame: () => void;
  loading?: boolean;
}

export const CallToAction = ({ onStartGame, loading }: CallToActionProps) => {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-black dark:via-blue-950 dark:to-purple-950">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
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

        {/* Floating particles */}
        <div className="absolute top-32 left-[10%] w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60" />
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60 [animation-delay:1s]" />
        <div className="absolute bottom-40 left-[20%] w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-60 [animation-delay:2s]" />
        <div className="absolute bottom-32 right-[25%] w-3 h-3 bg-cyan-400 rounded-full animate-bounce opacity-60 [animation-delay:3s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 ring-1 ring-white/20">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-green-300">
              Ready in 30 seconds
            </span>
          </div>

          {/* Main heading */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8">
            <span className="block mb-2">Transform Your</span>
            <span className="relative block">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Sprint Planning
              </span>
              {/* Decorative underline */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-blue-400/0 via-purple-400/60 to-pink-400/0 rounded-full" />
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl mt-4 text-gray-300">
              Today
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl leading-relaxed text-gray-300 max-w-3xl mx-auto mb-12">
            Join thousands of teams who&apos;ve already discovered the joy of
            <span className="text-white font-semibold">
              {" "}
              effortless estimation
            </span>
            . No setup, no limits, just results.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button
              onClick={onStartGame}
              disabled={loading}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-12 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center gap-3">
                {loading ? "Creating..." : "Start Planning Now"}
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-gradient-to-r from-blue-500/50 to-purple-600/50 blur-xl" />
            </button>

            <a
              href="https://github.com/INQTR/poker-planning"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-8 py-5 text-lg font-semibold text-white ring-1 ring-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-white transition-colors" />
              Explore Source Code
            </a>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="group">
              <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-bold text-green-300">
                  Free Forever
                </span>
              </div>
            </div>
            <div className="group">
              <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-sm font-bold text-blue-300">
                  No Registration
                </span>
              </div>
            </div>
            <div className="group">
              <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                <div className="h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-sm font-bold text-purple-300">
                  Instant Setup
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-900 dark:from-black to-transparent" />
    </div>
  );
};
