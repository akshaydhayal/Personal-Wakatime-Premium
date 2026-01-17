'use client';

import { useState } from 'react';

export default function ActionButtons() {
  const [syncing, setSyncing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
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

  const handleAddHistorical = async () => {
    setAdding(true);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch('/api/add-historical-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Added ${data.added} days`);
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
      setAdding(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={syncing || adding}
        className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {syncing ? 'Syncing...' : 'Sync'}
      </button>
      <button
        onClick={handleAddHistorical}
        disabled={syncing || adding}
        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {adding ? 'Adding...' : 'Add Historical'}
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
