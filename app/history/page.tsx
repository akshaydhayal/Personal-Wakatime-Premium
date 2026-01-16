'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { format, parseISO } from 'date-fns';
import LanguageBreakdown from '@/components/LanguageBreakdown';
import { formatTimeDetailed } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HistoryPage() {
  const { data, error } = useSWR('/api/summaries?limit=100', fetcher);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<any>(null);

  useEffect(() => {
    if (selectedDate && data?.data) {
      const summary = data.data.find((s: any) => s.date === selectedDate);
      setSelectedSummary(summary);
    }
  }, [selectedDate, data]);

  if (error) {
    return (
      <div className="wakatime-container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading History</h1>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const summaries = data?.data || [];

  return (
    <div className="wakatime-container min-h-screen py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Activity History</h1>
        <p className="text-gray-500">View all your tracked coding activity</p>
      </div>

      {!data && !error && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-500">Loading history...</p>
        </div>
      )}

      {data && summaries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No history available yet.</p>
        </div>
      )}

      {data && summaries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="stat-card">
              <h2 className="text-2xl font-semibold mb-4">All Days</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {summaries.map((summary: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(summary.date)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedDate === summary.date
                        ? 'bg-primary-50 dark:bg-primary-900 border-primary-500'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {format(parseISO(summary.date), 'EEEE, MMMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatTimeDetailed(summary.total_seconds || 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {formatTimeDetailed(summary.total_seconds || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedSummary ? (
              <div className="stat-card sticky top-4">
                <h2 className="text-2xl font-semibold mb-4">
                  {format(parseISO(selectedSummary.date), 'MMM dd, yyyy')}
                </h2>
                
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {formatTimeDetailed(selectedSummary.total_seconds || 0)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedSummary.total_seconds || 0} seconds total
                  </div>
                </div>

                {selectedSummary.languages && selectedSummary.languages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Languages</h3>
                    <div className="space-y-2">
                      {selectedSummary.languages.slice(0, 5).map((lang: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm">{lang.name}</span>
                          <span className="text-sm font-medium">
                            {formatTimeDetailed(lang.total_seconds || 0)} ({lang.percent.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSummary.projects && selectedSummary.projects.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Projects</h3>
                    <div className="space-y-2">
                      {selectedSummary.projects.slice(0, 5).map((proj: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm">{proj.name}</span>
                          <span className="text-sm font-medium">
                            {formatTimeDetailed(proj.total_seconds || 0)} ({proj.percent.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSummary.editors && selectedSummary.editors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Editors</h3>
                    <div className="space-y-2">
                      {selectedSummary.editors.slice(0, 5).map((editor: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm">{editor.name}</span>
                          <span className="text-sm font-medium">
                            {formatTimeDetailed(editor.total_seconds || 0)} ({editor.percent.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="stat-card">
                <p className="text-gray-500 text-center py-8">
                  Select a date to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
