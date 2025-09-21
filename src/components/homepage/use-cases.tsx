import { BarChart3, Globe, Users, Zap } from "lucide-react";

const useCases = [
  {
    title: "Distributed Teams",
    description:
      "Perfect for remote and hybrid teams across different time zones",
    icon: Globe,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      "Multi-timezone support",
      "Low bandwidth optimized",
      "24/7 availability",
    ],
    bgPattern:
      "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
  },
  {
    title: "Lightning Speed",
    description: "Start estimating in seconds, not minutes",
    icon: Zap,
    gradient: "from-yellow-500 to-orange-500",
    features: ["Instant room creation", "Real-time sync", "Zero loading time"],
    bgPattern:
      "radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
  },
  {
    title: "Smart Analytics",
    description: "Gain insights into team consensus and estimation patterns",
    icon: BarChart3,
    gradient: "from-green-500 to-emerald-500",
    features: ["Vote visualization", "Consensus tracking", "Historical data"],
    bgPattern:
      "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)",
  },
  {
    title: "Universal Access",
    description: "Works for teams of any size, from startups to enterprises",
    icon: Users,
    gradient: "from-purple-500 to-pink-500",
    features: ["Unlimited users", "No registration", "Cross-platform"],
    bgPattern:
      "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
  },
];

export function UseCases() {
  return (
    <div
      id="use-cases"
      className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 py-20 sm:py-32"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-[5%] w-4 h-4 bg-blue-400/30 rounded-full animate-float" />
        <div className="absolute top-40 right-[10%] w-6 h-6 bg-purple-400/30 rotate-45 animate-float [animation-delay:1s]" />
        <div className="absolute bottom-32 left-[15%] w-5 h-5 bg-green-400/30 rounded-full animate-float [animation-delay:2s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 ring-1 ring-blue-500/20 mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Perfect For Every Team
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            <span className="block mb-2">Built for</span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Modern Workflows
            </span>
          </h2>

          <p className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300">
            Whether you're a startup or enterprise, our tool adapts to your
            team's unique needs.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div key={useCase.title} className="group relative">
              <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-800/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                {/* Background pattern */}
                <div
                  className="absolute inset-0 opacity-50"
                  style={{ background: useCase.bgPattern }}
                />

                {/* Content */}
                <div className="relative p-8">
                  {/* Icon */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.gradient} shadow-lg`}
                    >
                      <useCase.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Text content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {useCase.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {useCase.description}
                  </p>

                  {/* Features list */}
                  <div className="space-y-3">
                    {useCase.features.map((feature, featureIndex) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 group/feature"
                      >
                        <div
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${useCase.gradient} group-hover/feature:scale-110 transition-transform`}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/feature:text-gray-900 dark:group-hover/feature:text-white transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${useCase.gradient} animate-pulse`}
                    />
                  </div>
                </div>

                {/* Animated border on hover */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats section */}
        <div className="mt-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-black dark:via-blue-950 dark:to-purple-950 p-8 lg:p-12 shadow-2xl">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl" />
            </div>

            <div className="relative">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Trusted by Teams Worldwide
                </h3>
                <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  Join thousands of teams who have transformed their sprint
                  planning experience
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    500K+
                  </div>
                  <div className="text-sm text-gray-300">Estimations Made</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    10K+
                  </div>
                  <div className="text-sm text-gray-300">Teams Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-300">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    24/7
                  </div>
                  <div className="text-sm text-gray-300">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
