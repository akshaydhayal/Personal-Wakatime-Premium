'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/history', label: 'History' },
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 mb-8">
      <div className="wakatime-container">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-4 px-2 border-b-2 transition-colors ${
                pathname === item.href
                  ? 'border-primary-600 text-primary-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
