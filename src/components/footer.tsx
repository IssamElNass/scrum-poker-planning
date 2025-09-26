"use client";

export const Footer = () => {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="absolute bottom-0 left-0 right-0 z-50 w-full bg-transparent"
    >
      <div className="px-6 py-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} Scrum Poker Planning.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>Made with</span>
            <span className="text-red-400 animate-pulse">❤️</span>
            <span>by the community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
