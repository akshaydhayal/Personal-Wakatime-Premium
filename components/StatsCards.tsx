'use client';

import { formatTimeHoursMinutes } from '@/lib/utils';

interface StatsCardsProps {
  totalSeconds: number;
  totalDays: number;
  avgSecondsPerDay: number;
}

export default function StatsCards({ totalSeconds, totalDays, avgSecondsPerDay }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Time',
      value: formatTimeHoursMinutes(totalSeconds),
      description: 'All time tracked',
    },
    {
      label: 'Days Tracked',
      value: totalDays.toString(),
      description: 'Total days with activity',
    },
    {
      label: 'Daily Average',
      value: formatTimeHoursMinutes(avgSecondsPerDay),
      description: 'Average per day',
    },
    {
      label: 'Last 7 Days',
      value: '7 days',
      description: 'Recent activity',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.description}</div>
        </div>
      ))}
    </div>
  );
}
