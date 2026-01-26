'use client';

import { formatTimeHoursMinutes } from '@/lib/utils';

interface StatsCardsProps {
  totalSeconds: number;
  totalDays: number;
  avgSecondsPerDay: number;
}

export default function StatsCards({ totalDays, avgSecondsPerDay }: StatsCardsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-end items-end gap-2 sm:gap-4 pt-1">
      <div className="text-right text-xs sm:text-sm">
        <span className="text-gray-500 dark:text-gray-400 text-xs">Days Tracked: </span>
        <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">{totalDays}</span>
      </div>
      <div className="text-right text-xs sm:text-sm">
        <span className="text-gray-500 dark:text-gray-400 text-xs">All Time Daily Average: </span>
        <span className="text-sm sm:text-base md:text-lg font-bold text-primary-600 dark:text-primary-400">{formatTimeHoursMinutes(avgSecondsPerDay)}</span>
      </div>
    </div>
  );
}
