'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ActionButtons from './ActionButtons';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/history', label: 'History' },
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10 backdrop-blur-sm bg-opacity-95">
      <div className="wakatime-container">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WakaTime Premium</h1>
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <ActionButtons />
        </div>
      </div>
    </nav>
  );
}
