import { Shield, TrendingUp, Zap } from "lucide-react";
import Image from "next/image";

const features = [
  {
    name: "Instant collaboration.",
    description:
      "Join rooms with a simple link, no sign-up required. Start estimating in seconds.",
    icon: Zap,
  },
  {
    name: "Anonymous voting.",
    description:
      "Prevent anchoring bias with simultaneous reveal. Everyone votes independently.",
    icon: Shield,
  },
  {
    name: "Team analytics.",
    description:
      "Track estimation patterns and improve accuracy over time with built-in insights.",
    icon: TrendingUp,
  },
];

export function AppPreview() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/30 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-black dark:via-blue-950 dark:to-purple-950 rounded-3xl shadow-2xl">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                  backgroundSize: "40px 40px",
                }}
              />
            </div>
          </div>

          <div className="relative px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
              {/* Left content */}
              <div className="lg:pr-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                    Live Demo
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  See it in
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Real Action
                  </span>
                </h2>

                <p className="mt-6 text-lg leading-8 text-gray-300">
                  Watch how teams collaborate in real-time. Our intuitive
                  interface makes sprint planning feel like magic, not work.
                </p>

                {/* Features list */}
                <div className="mt-10 space-y-6">
                  {features.map((feature) => (
                    <div
                      key={feature.name}
                      className="group flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-blue-400/30 group-hover:scale-110 transition-transform">
                        <feature.icon className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <dt className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {feature.name}
                        </dt>
                        <dd className="text-sm text-gray-400 leading-relaxed">
                          {feature.description}
                        </dd>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-10">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-6 py-3 ring-1 ring-white/20 hover:bg-white/20 transition-colors cursor-pointer group">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-white group-hover:text-blue-200">
                      Try the live demo →
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side - Screenshot */}
              <div className="relative lg:row-span-2">
                <div className="relative">
                  {/* Screenshot container with enhanced styling */}
                  <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 shadow-2xl">
                    <Image
                      alt="Planning Poker app interface showing real-time collaboration with modern design"
                      src="/poker-planning-screenshot.png"
                      width={2432}
                      height={1442}
                      className="w-full h-auto object-cover"
                    />

                    {/* Overlay gradient for better integration */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent" />
                  </div>

                  {/* Floating UI elements to show interactivity */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>

                  <div className="absolute top-1/2 -left-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce [animation-delay:0.5s]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>

                  <div className="absolute -bottom-2 right-8 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce [animation-delay:1s]">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>

                {/* Stats overlay */}
                <div className="absolute -bottom-6 left-4 right-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-white/20">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          99.9%
                        </div>
                        <div className="text-xs text-gray-300">Uptime</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          &lt;100ms
                        </div>
                        <div className="text-xs text-gray-300">Latency</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">∞</div>
                        <div className="text-xs text-gray-300">Users</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
