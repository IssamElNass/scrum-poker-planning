import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full bg-transparent">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <div className="-m-1.5 p-1.5 flex items-center">
            <span className="sr-only">Scrum Poker Planning</span>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Scrum Poker Planning
            </span>
          </div>
        </div>
        <div className="flex lg:flex-1 justify-end">
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}
