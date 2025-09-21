import { ArrowRight, ChartBar, Users, Vote, Zap } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Create a Room",
    description:
      "Start a new planning session with one click. No registration required - just share the link with your team.",
    icon: Zap,
    gradient: "from-blue-500 to-cyan-500",
    shadowColor: "shadow-blue-500/25",
  },
  {
    id: 2,
    title: "Invite Your Team",
    description:
      "Share the room URL with your team members. They can join instantly from any device, anywhere in the world.",
    icon: Users,
    gradient: "from-green-500 to-emerald-500",
    shadowColor: "shadow-green-500/25",
  },
  {
    id: 3,
    title: "Vote on Stories",
    description:
      "Present user stories and have everyone vote simultaneously. Cards remain hidden until everyone has voted.",
    icon: Vote,
    gradient: "from-purple-500 to-pink-500",
    shadowColor: "shadow-purple-500/25",
  },
  {
    id: 4,
    title: "Reach Consensus",
    description:
      "Reveal all votes at once, discuss differences, and quickly reach team consensus on story point estimates.",
    icon: ChartBar,
    gradient: "from-orange-500 to-red-500",
    shadowColor: "shadow-orange-500/25",
  },
];

export function HowItWorks() {
  return (
    <div
      id="how-it-works"
      className="relative isolate overflow-hidden bg-white dark:bg-gray-950"
    >
      {/* Modern background pattern */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
              linear-gradient(to right, rgb(99 102 241 / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(99 102 241 / 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-[10%] w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-32 right-[15%] w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse [animation-delay:2s]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 ring-1 ring-blue-500/20 mb-8">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              4 Simple Steps
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            <span className="block mb-2">How</span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Scrum Planning Poker
            </span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl mt-2 text-gray-700 dark:text-gray-300">
              Works
            </span>
          </h2>

          <p className="mt-8 text-xl leading-8 text-gray-600 dark:text-gray-300">
            From zero to estimation in under 60 seconds. No complexity, just
            results.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto mt-20 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.id} className="group relative">
                {/* Connection arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full z-10 pointer-events-none overflow-visible">
                    <div className="relative w-6 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-6 border-t-2 border-dashed border-blue-200 dark:border-blue-800" />
                      </div>
                      <div className="bg-white dark:bg-gray-950 px-1">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                          <ArrowRight className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step card */}
                <div className="relative">
                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-800/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    {/* Step number badge */}
                    <div className="absolute -top-4 -left-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg text-white font-bold text-lg`}
                      >
                        {step.id}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="mb-4 mt-2">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} shadow-xl transition-transform duration-300 group-hover:scale-110`}
                      >
                        <step.icon
                          className="h-8 w-8 text-white"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                      {step.description}
                    </p>

                    {/* Animated border */}
                    <div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />

                    {/* Progress indicator */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${step.gradient} shadow-lg animate-pulse`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 ring-1 ring-blue-200/50 dark:ring-blue-800/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                Ready to get started?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create your first room and see the magic happen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
