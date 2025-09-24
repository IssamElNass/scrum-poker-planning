"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { GithubIcon } from "@/components/icons";
import { api } from "@/convex/_generated/api";
import { useCopyRoomUrlToClipboard } from "@/hooks/use-copy-room-url-to-clipboard";
import { toast } from "@/lib/toast";
import { useMutation } from "convex/react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const createRoom = useMutation(api.rooms.create);
  const { copyRoomUrlToClipboard } = useCopyRoomUrlToClipboard();
  const [isCreating, setIsCreating] = useState(false);

  const version = "1.0.1";

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const roomId = await createRoom({
        name: `Room ${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
        roomType: "canvas",
      });

      await copyRoomUrlToClipboard(roomId);
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

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
                id="hero-pattern"
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
              fill="url(#hero-pattern)"
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

        <div className="mx-auto max-w-7xl px-6 py-8 sm:py-16 lg:px-8 lg:py-20 min-h-screen flex items-center">
          {/* Main Hero Content */}
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-2 ring-1 ring-primary/20 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <a
                href={`https://github.com/IssamElNass/scrum-poker-planning/releases/tag/v${version}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                New v{version} Release
              </a>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              <span className="block">Scrum</span>
              <span className="relative block">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Poker Planning
                </span>
              </span>
              <span className="block text-3xl sm:text-5xl lg:text-6xl font-bold mt-2">
                Made Easy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-sm sm:text-2xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The fastest way to estimate user stories with your team,
              completely free forever.
              <span className="hidden sm:inline font-semibold text-gray-900 dark:text-white">
                {" "}
                No account required.
              </span>
              <span className="hidden sm:inline font-semibold text-gray-900 dark:text-white">
                {" "}
                No limits.
              </span>
              <span className="hidden sm:inline font-semibold text-gray-900 dark:text-white">
                {" "}
                Just results.
              </span>
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                data-testid="hero-start-button"
                className="group cursor-pointer relative overflow-hidden rounded-2xl bg-primary px-8 py-4 text-base sm:px-10 sm:py-5 sm:text-lg font-bold text-white shadow-2xl shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {isCreating ? "Creating Room..." : "Start Planning Now"}
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1" />
                </span>
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>

              <a
                href="https://github.com/IssamElNass/scrum-poker-planning"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-github-link"
                className="group hidden sm:inline-flex items-center gap-3 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 px-6 py-4 text-base sm:px-8 sm:py-5 sm:text-lg font-semibold text-gray-900 dark:text-white backdrop-blur-sm ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
              >
                <GithubIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                View Source
              </a>
            </div>

            {/* Stats Row */}
            <div className="mt-12 hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="group">
                <div className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50 transition-all duration-300 group-hover:scale-105">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">
                    100% Free forever
                  </span>
                </div>
              </div>
              <div className="group">
                <div className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-800/50 transition-all duration-300 group-hover:scale-105">
                  <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    No account required
                  </span>
                </div>
              </div>
              <div className="group">
                <div className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50 transition-all duration-300 group-hover:scale-105">
                  <div className="h-3 w-3 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    Open source
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
