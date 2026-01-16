'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import StatsCards from '@/components/StatsCards';
import ActivityChart from '@/components/ActivityChart';
import LanguageBreakdown from '@/components/LanguageBreakdown';
import SyncButton from '@/components/SyncButton';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: summariesData, error: summariesError, mutate: mutateSummaries } = useSWR('/api/summaries?last7=true', fetcher);
  const { data: statsData, error: statsError } = useSWR('/api/stats', fetcher);

  const [allLanguages, setAllLanguages] = useState<Array<{ name: string; total_seconds: number; percent: number }>>([]);

  useEffect(() => {
    if (summariesData?.data) {
      // Aggregate all languages from last 7 days
      const langMap = new Map<string, number>();
      let totalSeconds = 0;

      summariesData.data.forEach((summary: any) => {
        totalSeconds += summary.total_seconds || 0;
        (summary.languages || []).forEach((lang: any) => {
          const current = langMap.get(lang.name) || 0;
          langMap.set(lang.name, current + lang.total_seconds);
        });
      });

      const languages = Array.from(langMap.entries())
        .map(([name, seconds]) => ({
          name,
          total_seconds: seconds,
          percent: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
        }))
        .sort((a, b) => b.total_seconds - a.total_seconds);

      setAllLanguages(languages);
    }
  }, [summariesData]);

  if (summariesError || statsError) {
    return (
      <div className="wakatime-container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Data</h1>
          <p className="text-gray-500">
            {summariesError?.message || statsError?.message || 'Failed to load data'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Make sure your environment variables are set correctly.
          </p>
        </div>
      </div>
    );
  }

  const summaries = summariesData?.data || [];
  const stats = statsData?.stats || {
    total_seconds: 0,
    total_days: 0,
    avg_seconds_per_day: 0,
    total_hours: 0,
    total_minutes: 0,
  };

  const totalHours = Math.floor(stats.total_seconds / 3600);
  const totalMinutes = Math.floor((stats.total_seconds % 3600) / 60);
  const avgHoursPerDay = stats.avg_seconds_per_day / 3600;

  return (
    <div className="wakatime-container min-h-screen py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">WakaTime Premium</h1>
        <p className="text-gray-500">Your coding activity tracker</p>
      </div>

      <SyncButton />

      {!summariesData && !summariesError && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-500">Loading your activity data...</p>
        </div>
      )}

      {summariesData && summaries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No data available yet.</p>
          <p className="text-sm text-gray-400">
            Click &quot;Sync with WakaTime&quot; to fetch your last 7 days of activity.
          </p>
        </div>
      )}

      {summariesData && summaries.length > 0 && (
        <>
          <StatsCards
            totalHours={totalHours}
            totalMinutes={totalMinutes}
            totalDays={stats.total_days}
            avgHoursPerDay={avgHoursPerDay}
          />

          <ActivityChart data={summaries} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <LanguageBreakdown languages={allLanguages} title="Top Languages (Last 7 Days)" />
            
            {statsData?.top_projects && statsData.top_projects.length > 0 && (
              <LanguageBreakdown
                languages={statsData.top_projects.map((p: any) => ({
                  name: p.name,
                  total_seconds: p.total_seconds,
                  percent: p.percent,
                }))}
                title="Top Projects"
              />
            )}
          </div>

          <div className="stat-card mt-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Time</th>
                    <th className="text-left py-2 px-4">Languages</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.slice(0, 7).map((summary: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-4">
                        {format(new Date(summary.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-2 px-4 font-medium">{summary.digital || summary.text}</td>
                      <td className="py-2 px-4">
                        <div className="flex flex-wrap gap-2">
                          {(summary.languages || []).slice(0, 3).map((lang: any, i: number) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded"
                            >
                              {lang.name} ({lang.percent.toFixed(1)}%)
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
