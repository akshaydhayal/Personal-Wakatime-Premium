'use client';

import { useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  route: string;
}

const users: User[] = [
  { id: 'akshay', name: 'Akshay', route: '/akshay' },
  { id: 'monika', name: 'Monika', route: '/monika' },
  { id: 'himanshu', name: 'Himanshu', route: '/himanshu' },
];

export default function Home() {
  const [syncingUsers, setSyncingUsers] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Record<string, string>>({});

  const handleSyncUser = async (userId: string) => {
    setSyncingUsers((prev) => new Set(prev).add(userId));
    setMessages((prev) => ({ ...prev, [userId]: '' }));

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: userId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => ({
          ...prev,
          [userId]: `✅ Synced ${data.synced} days`,
        }));
      } else {
        setMessages((prev) => ({
          ...prev,
          [userId]: `❌ Error: ${data.error}`,
        }));
      }
    } catch (error: any) {
      setMessages((prev) => ({
        ...prev,
        [userId]: `❌ Error: ${error.message}`,
      }));
    } finally {
      setSyncingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleSyncAll = async () => {
    for (const user of users) {
      await handleSyncUser(user.id);
      // Small delay between syncs
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };


  return (
    <div className="wakatime-container min-h-screen py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={handleSyncAll}
          disabled={syncingUsers.size > 0}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {syncingUsers.size > 0 ? `Syncing ${syncingUsers.size} user(s)...` : 'Sync All Users'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {users.map((user) => (
          <div key={user.id} className="stat-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <Link
                href={user.route}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm rounded-lg font-medium transition-colors text-center"
              >
                View Dashboard
              </Link>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => handleSyncUser(user.id)}
                disabled={syncingUsers.has(user.id)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {syncingUsers.has(user.id) ? 'Syncing...' : 'Sync with WakaTime'}
              </button>

              {messages[user.id] && (
                <p
                  className={`text-sm ${
                    messages[user.id].includes('✅')
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {messages[user.id]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
