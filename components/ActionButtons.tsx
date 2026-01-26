'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ActionButtons() {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  // Determine user from pathname
  const getUserId = () => {
    if (pathname.includes('/monika')) return 'monika';
    if (pathname.includes('/himanshu')) return 'himanshu';
    if (pathname.includes('/me')) return 'akshay';
    return 'akshay'; // default
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: getUserId() }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Synced ${data.synced} days`);
        setMessageType('success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage(`Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setSyncing(false);
    }
  };


  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {syncing ? 'Syncing...' : 'Sync'}
      </button>
      {message && (
        <span className={`text-xs font-medium ${
          messageType === 'error' ? 'text-red-500' : 'text-green-500'
        }`}>
          {message}
        </span>
      )}
    </div>
  );
}
