'use client';

import { useState } from 'react';

export default function AddHistoricalDataButton() {
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddHistorical = async () => {
    setAdding(true);
    setMessage(null);

    try {
      const response = await fetch('/api/add-historical-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Successfully added ${data.added} days of historical data!`);
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
      setAdding(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleAddHistorical}
        disabled={adding}
        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {adding ? 'Adding Historical Data...' : 'Add Historical Data (Jan 1-10)'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
