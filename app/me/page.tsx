'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import StatsCards from '@/components/StatsCards';
import ActivityChart from '@/components/ActivityChart';
import WeeklyAverageChart from '@/components/WeeklyAverageChart';
import LanguageBreakdown from '@/components/LanguageBreakdown';
import IntervalSelector from '@/components/IntervalSelector';
import { format } from 'date-fns';
import { formatTimeDetailed } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Tracking start date for Akshay - used as the global reference for all charts
const TRACKING_START_DATE = '2026-01-01';

export default function MeDashboard() {
  const [selectedInterval, setSelectedInterval] = useState<string>('7days');
  const { data: summariesData, error: summariesError, mutate: mutateSummaries } = useSWR(
    `/api/summaries?interval=${selectedInterval}&user=akshay`,
    fetcher
  );
  const { data: statsData, error: statsError } = useSWR('/api/stats?user=akshay', fetcher);
  // Fetch all-time data for the weekly average chart
  const { data: allTimeData } = useSWR('/api/summaries?interval=alltime&user=akshay', fetcher);

  const [allLanguages, setAllLanguages] = useState<Array<{ name: string; total_seconds: number; percent: number }>>([]);
  const [allProjects, setAllProjects] = useState<Array<{ name: string; total_seconds: number; percent: number }>>([]);

  useEffect(() => {
    if (summariesData?.data) {
      // Aggregate all languages from selected interval
      const langMap = new Map<string, number>();
      const projectMap = new Map<string, number>();
      let totalSeconds = 0;

      summariesData.data.forEach((summary: any) => {
        totalSeconds += summary.total_seconds || 0;
        
        // Aggregate languages
        (summary.languages || []).forEach((lang: any) => {
          const current = langMap.get(lang.name) || 0;
          langMap.set(lang.name, current + lang.total_seconds);
        });

        // Aggregate projects
        (summary.projects || []).forEach((proj: any) => {
          const current = projectMap.get(proj.name) || 0;
          projectMap.set(proj.name, current + proj.total_seconds);
        });
      });

      const languages = Array.from(langMap.entries())
        .map(([name, seconds]) => ({
          name,
          total_seconds: seconds,
          percent: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
        }))
        .sort((a, b) => b.total_seconds - a.total_seconds);

      const projects = Array.from(projectMap.entries())
        .map(([name, seconds]) => ({
          name,
          total_seconds: seconds,
          percent: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
        }))
        .sort((a, b) => b.total_seconds - a.total_seconds);

      setAllLanguages(languages);
      setAllProjects(projects);
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

  // Calculate totals and averages for the selected interval
  const intervalTotalSeconds = summaries.reduce((sum: number, s: any) => sum + (s.total_seconds || 0), 0);
  const intervalDays = summaries.length;
  const intervalAvgSeconds = intervalDays > 0 ? intervalTotalSeconds / intervalDays : 0;

  return (
    <div className="wakatime-container min-h-screen py-4 sm:py-6">

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
          <div className="mb-6">
            <StatsCards
              totalSeconds={stats.total_seconds}
              totalDays={stats.total_days}
              avgSecondsPerDay={stats.avg_seconds_per_day}
            />
          </div>

          <div>
            <IntervalSelector
              selectedInterval={selectedInterval}
              onIntervalChange={setSelectedInterval}
            />
            <ActivityChart 
              data={summaries} 
              interval={selectedInterval}
              totalSeconds={intervalTotalSeconds}
              averageSeconds={intervalAvgSeconds}
            />
          </div>

          {/* Weekly Average Chart - uses all-time data, weeks counted from tracking start */}
          {allTimeData?.data && allTimeData.data.length > 0 && (
            <WeeklyAverageChart
              data={allTimeData.data}
              startDate={TRACKING_START_DATE}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <LanguageBreakdown
              languages={allLanguages}
              title={`Top Languages (${selectedInterval === '7days' ? 'Last 7 Days' : selectedInterval === '14days' ? 'Last 14 Days' : selectedInterval === '1month' ? 'Last Month' : 'All Time'})`}
            />
            
            {allProjects.length > 0 && (
              <LanguageBreakdown
                languages={allProjects}
                title={`Top Projects (${selectedInterval === '7days' ? 'Last 7 Days' : selectedInterval === '14days' ? 'Last 14 Days' : selectedInterval === '1month' ? 'Last Month' : 'All Time'})`}
              />
            )}
          </div>

          <div className="stat-card mt-4 sm:mt-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {selectedInterval === '7days' ? 'Last 7 Days' : 
               selectedInterval === '14days' ? 'Last 14 Days' : 
               selectedInterval === '1month' ? 'Last Month' : 
               'All Activity'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Date</th>
                    <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Time</th>
                    <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Languages</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries
                    .slice()
                    .reverse()
                    .filter((s: any) => s.total_seconds > 0) // Only show days with activity
                    .slice(0, selectedInterval === 'alltime' ? 50 : selectedInterval === '1month' ? 30 : summaries.length)
                    .map((summary: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                        {format(new Date(summary.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-2 px-2 sm:px-4 font-medium text-xs sm:text-sm">{formatTimeDetailed(summary.total_seconds || 0)}</td>
                      <td className="py-2 px-2 sm:px-4">
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
