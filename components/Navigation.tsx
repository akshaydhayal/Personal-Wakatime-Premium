'use client';

export default function Navigation() {

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10 backdrop-blur-sm bg-opacity-95">
      <div className="wakatime-container">
        <div className="flex items-center justify-between py-2 sm:py-3">
          <div className="flex items-center gap-3 sm:gap-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">WakaTime Premium</h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
