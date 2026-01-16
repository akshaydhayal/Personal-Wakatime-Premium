'use client';

import { useState } from 'react';

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Successfully synced ${data.synced} days of data!`);
        // Refresh the page after a short delay to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {syncing ? 'Syncing...' : 'Sync with WakaTime'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
