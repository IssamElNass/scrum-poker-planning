import { cn } from "@/lib/utils";
import { Check, Clock, Globe, Shield, Star, Users, Zap } from "lucide-react";

const coreFeatures = [
  {
    name: "Unlimited Team Size",
    description: "Invite as many team members as you need - no restrictions",
    icon: Users,
    available: true,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Real-time Voting",
    description: "See votes in real-time with lightning-fast synchronization",
    icon: Zap,
    available: true,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    name: "Global Access",
    description: "Works anywhere in the world with internet connection",
    icon: Globe,
    available: true,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Smart Timer",
    description: "Built-in timer to keep your estimation sessions focused",
    icon: Clock,
    available: false,
    comingSoon: true,
    gradient: "from-purple-500 to-pink-500",
  },
];

const additionalFeatures = [
  "No registration required",
  "Mobile responsive design",
  "Dark mode support",
  "Room settings & customization",
  "Observer role support",
  "Multiple voting scales",
  "Anonymous voting",
  "Session history & export",
];

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20 py-20 sm:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-[10%] w-6 h-6 bg-primary/30 rounded-full animate-bounce [animation-delay:1s]" />
        <div className="absolute top-32 right-[15%] w-4 h-4 bg-purple-500/30 rotate-45 animate-bounce [animation-delay:3s]" />
        <div className="absolute bottom-40 left-[20%] w-8 h-8 bg-cyan-500/30 rounded-full animate-bounce [animation-delay:5s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-2 ring-1 ring-primary/20 mb-6">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Premium Features, Zero Cost
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-gray-900 dark:text-white">Built for</span>
            <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h2>

          <p className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300">
            Everything you need to run effective planning sessions, completely
            free forever.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coreFeatures.map((feature, index) => (
            <div key={feature.name} className="group relative">
              <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                {/* Feature icon */}
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br mb-6 shadow-lg",
                    feature.gradient,
                    !feature.available && "grayscale opacity-50"
                  )}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3
                  className={cn(
                    "text-xl font-bold mb-3",
                    feature.available
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {feature.name}
                  {feature.comingSoon && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                      Coming Soon
                    </span>
                  )}
                </h3>

                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    feature.available
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {feature.description}
                </p>

                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      feature.available
                        ? "bg-green-500 shadow-lg shadow-green-500/50"
                        : "bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                </div>

                {/* Hover effect */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-5",
                    feature.gradient
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 lg:p-12 shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Features list */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Plus Everything You Expect
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {additionalFeatures.map((feature, index) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Pricing */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-2xl shadow-green-500/25">
                  <Shield className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Forever Free
                </h3>

                <div className="flex items-baseline justify-center lg:justify-start gap-2 mb-6">
                  <span className="text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    $0
                  </span>
                  <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                    /forever
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  No hidden fees, no premium tiers, no limitations. We believe
                  great tools should be accessible to everyone.
                </p>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
