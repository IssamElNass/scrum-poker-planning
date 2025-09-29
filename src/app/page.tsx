"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { GithubIcon } from "@/components/icons";
import { api } from "@/convex/_generated/api";
import { useCopyRoomUrlToClipboard } from "@/hooks/use-copy-room-url-to-clipboard";
import { toast } from "@/lib/toast";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function HomePage() {
  const router = useRouter();
  const createRoom = useMutation(api.rooms.create);
  const { copyRoomUrlToClipboard } = useCopyRoomUrlToClipboard();
  const [isCreating, setIsCreating] = useState(false);
  const [lastRoomId, setLastRoomId] = useState<Id<"rooms"> | null>(null);

  // Query to check if the last room exists
  const lastRoomData = useQuery(
    api.rooms.get,
    lastRoomId ? { roomId: lastRoomId } : "skip"
  );

  const version = "1.0.2";

  // Load last room from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("poker-user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user?.roomId) {
            setLastRoomId(user.roomId);
          }
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }
    }
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const newRoomId = await createRoom({
        name: `Room ${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
        roomType: "canvas",
      });

      // Try to copy to clipboard, but don't block room creation if it fails
      copyRoomUrlToClipboard(newRoomId);

      router.push(`/room/${newRoomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLastRoom = async () => {
    if (!lastRoomId) return;

    setIsCreating(true);
    try {
      router.push(`/room/${lastRoomId}`);
    } catch (error) {
      console.error("Failed to join last room:", error);
      toast.error("Failed to join last room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const showLastRoomButton = lastRoomId && lastRoomData !== null;

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
            <p className="mt-6 text-sm sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
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
                100% free forever.
              </span>
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                data-testid="hero-start-button"
                className="group cursor-pointer relative overflow-hidden rounded-lg bg-primary px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isCreating ? "Creating Room..." : "Start Planning Now"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </button>

              {showLastRoomButton && (
                <button
                  onClick={handleJoinLastRoom}
                  disabled={isCreating}
                  data-testid="hero-rejoin-button"
                  className="group cursor-pointer relative overflow-hidden rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-bold text-white shadow-lg shadow-green-600/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-600/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Last Room
                    <Users className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </button>
              )}

              <a
                href="https://github.com/IssamElNass/scrum-poker-planning"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-github-link"
                className="group hidden sm:inline-flex items-center gap-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 px-4 py-2 text-sm sm:px-5 sm:py-3 sm:text-base font-semibold text-gray-900 dark:text-white backdrop-blur-sm ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
              >
                <GithubIcon className="h-4 w-4" />
                View Source
              </a>
            </div>
          </div>
        </div>
        <Footer absolute />
      </main>
    </div>
  );
}
