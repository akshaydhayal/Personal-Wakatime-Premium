'use client';

import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { format, parseISO, addDays, min, getDaysInMonth } from 'date-fns';
import { formatTimeHoursMinutes } from '@/lib/utils';

interface WeeklyAverageChartProps {
  data: Array<{
    date: string;
    total_seconds: number;
  }>;
  startDate: string; // e.g. "2026-01-01" - tracking start date
}

interface WeekData {
  weekLabel: string;
  weekNum: number;
  avgSeconds: number;
  avgHours: number;
  totalSeconds: number;
  daysTracked: number;
  formattedAvg: string;
}

interface MonthData {
  monthLabel: string;
  monthKey: string;
  avgSeconds: number;
  avgHours: number;
  totalSeconds: number;
  daysTracked: number;
  daysInMonth: number;
  formattedAvg: string;
  formattedTotal: string;
}

interface CumulativePoint {
  date: string;
  formattedDate: string;
  cumulativeAvgHours: number;
  cumulativeAvgSeconds: number;
  formattedAvg: string;
  dayNumber: number;
  dailyHours: number;
  formattedDaily: string;
}

type TabType = 'weekly' | 'monthly' | 'cumulative';

export default function WeeklyAverageChart({ data, startDate }: WeeklyAverageChartProps) {
  const [activeTab, setActiveTab] = useState<TabType>('weekly');

  if (!data || data.length === 0) return null;

  const trackingStart = parseISO(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a lookup map: date string -> total_seconds
  const dateMap = new Map<string, number>();
  data.forEach((item) => {
    dateMap.set(item.date, item.total_seconds || 0);
  });

  // ========== WEEKLY AVERAGE DATA ==========
  const weeks: WeekData[] = [];
  let weekStart = trackingStart;
  let weekNum = 1;

  while (weekStart <= today) {
    const weekEnd = min([addDays(weekStart, 6), today]);

    let totalSeconds = 0;
    let daysTracked = 0;
    let current = new Date(weekStart);

    while (current <= weekEnd) {
      const dateStr = format(current, 'yyyy-MM-dd');
      if (dateMap.has(dateStr)) {
        totalSeconds += dateMap.get(dateStr)!;
        daysTracked += 1;
      }
      current = addDays(current, 1);
    }

    const avgSeconds = daysTracked > 0 ? totalSeconds / daysTracked : 0;

    weeks.push({
      weekLabel: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
      weekNum,
      avgSeconds,
      avgHours: avgSeconds / 3600,
      totalSeconds,
      daysTracked,
      formattedAvg: formatTimeHoursMinutes(avgSeconds),
    });

    weekStart = addDays(weekStart, 7);
    weekNum++;
  }

  // Weekly stats
  const weeksWithData = weeks.filter((w) => w.daysTracked > 0);
  const overallWeeklyAvgSeconds =
    weeksWithData.length > 0
      ? weeksWithData.reduce((sum, w) => sum + w.avgSeconds, 0) / weeksWithData.length
      : 0;
  const overallWeeklyAvgHours = overallWeeklyAvgSeconds / 3600;

  // ========== MONTHLY AVERAGE DATA ==========
  const monthMap = new Map<string, { totalSeconds: number; daysTracked: number; year: number; month: number }>();

  data.forEach((item) => {
    const date = parseISO(item.date);
    const monthKey = format(date, 'yyyy-MM'); // e.g. "2026-01"
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        totalSeconds: 0,
        daysTracked: 0,
        year: date.getFullYear(),
        month: date.getMonth(), // 0-indexed
      });
    }

    const monthEntry = monthMap.get(monthKey)!;
    monthEntry.totalSeconds += item.total_seconds || 0;
    monthEntry.daysTracked += 1;
  });

  const months: MonthData[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, entry]) => {
      const daysInMonth = getDaysInMonth(new Date(entry.year, entry.month));
      const avgSeconds = entry.daysTracked > 0 ? entry.totalSeconds / entry.daysTracked : 0;

      return {
        monthLabel: format(new Date(entry.year, entry.month), 'MMM yyyy'),
        monthKey,
        avgSeconds,
        avgHours: avgSeconds / 3600,
        totalSeconds: entry.totalSeconds,
        daysTracked: entry.daysTracked,
        daysInMonth,
        formattedAvg: formatTimeHoursMinutes(avgSeconds),
        formattedTotal: formatTimeHoursMinutes(entry.totalSeconds),
      };
    });

  // Monthly stats
  const monthsWithData = months.filter((m) => m.daysTracked > 0);
  const overallMonthlyAvgSeconds =
    monthsWithData.length > 0
      ? monthsWithData.reduce((sum, m) => sum + m.avgSeconds, 0) / monthsWithData.length
      : 0;
  const overallMonthlyAvgHours = overallMonthlyAvgSeconds / 3600;

  // ========== CUMULATIVE AVERAGE DATA ==========
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const cumulativeData: CumulativePoint[] = [];
  let runningTotal = 0;
  let dayCount = 0;

  sorted.forEach((item) => {
    runningTotal += item.total_seconds || 0;
    dayCount += 1;
    const cumulativeAvgSeconds = runningTotal / dayCount;

    cumulativeData.push({
      date: item.date,
      formattedDate: format(parseISO(item.date), 'MMM dd'),
      cumulativeAvgHours: cumulativeAvgSeconds / 3600,
      cumulativeAvgSeconds,
      formattedAvg: formatTimeHoursMinutes(cumulativeAvgSeconds),
      dayNumber: dayCount,
      dailyHours: (item.total_seconds || 0) / 3600,
      formattedDaily: formatTimeHoursMinutes(item.total_seconds || 0),
    });
  });

  const showWeekly = weeks.length >= 2;
  const showMonthly = months.length >= 1;
  const showCumulative = cumulativeData.length >= 2;

  if (!showWeekly && !showMonthly && !showCumulative) return null;

  // Color bars for weekly/monthly charts
  const getWeeklyBarColor = (avgHours: number) => {
    if (avgHours === 0) return '#e2e8f0';
    if (avgHours >= overallWeeklyAvgHours * 1.1) return '#22c55e';
    if (avgHours >= overallWeeklyAvgHours * 0.9) return '#3b82f6';
    return '#94a3b8';
  };

  const getMonthlyBarColor = (avgHours: number) => {
    if (avgHours === 0) return '#e2e8f0';
    if (avgHours >= overallMonthlyAvgHours * 1.1) return '#22c55e';
    if (avgHours >= overallMonthlyAvgHours * 0.9) return '#3b82f6';
    return '#94a3b8';
  };

  // Current overall average (last point in cumulative)
  const currentOverallAvg = cumulativeData.length > 0
    ? cumulativeData[cumulativeData.length - 1].cumulativeAvgSeconds
    : 0;

  return (
    <div className="stat-card mt-6">
      {/* Header with tabs */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* Tab buttons */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {showWeekly && (
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'weekly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Weekly Avg
              </button>
            )}
            {showMonthly && (
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Monthly Avg
              </button>
            )}
            {showCumulative && (
              <button
                onClick={() => setActiveTab('cumulative')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'cumulative'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Cumulative Avg
              </button>
            )}
          </div>

          {/* Stats for active tab */}
          <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm">
            {activeTab === 'weekly' && (
              <>
                <div className="text-right">
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Weeks Tracked</div>
                  <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                    {weeks.length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Overall Weekly Avg</div>
                  <div className="text-base md:text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatTimeHoursMinutes(overallWeeklyAvgSeconds)}
                  </div>
                </div>
              </>
            )}
            {activeTab === 'monthly' && (
              <>
                <div className="text-right">
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Months Tracked</div>
                  <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                    {months.length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Overall Monthly Avg</div>
                  <div className="text-base md:text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatTimeHoursMinutes(overallMonthlyAvgSeconds)}
                  </div>
                </div>
              </>
            )}
            {activeTab === 'cumulative' && (
              <>
                <div className="text-right">
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Days Tracked</div>
                  <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                    {cumulativeData.length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Current Overall Avg</div>
                  <div className="text-base md:text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatTimeHoursMinutes(currentOverallAvg)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Average Chart */}
      {activeTab === 'weekly' && showWeekly && (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={weeks} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="weekLabel"
                tick={{ fill: 'currentColor', fontSize: 11 }}
                angle={weeks.length > 6 ? -30 : 0}
                textAnchor={weeks.length > 6 ? 'end' : 'middle'}
                height={weeks.length > 6 ? 70 : 40}
                interval={0}
              />
              <YAxis
                tick={{ fill: 'currentColor' }}
                style={{ fontSize: '12px' }}
                label={{ value: 'Avg Hours/Day', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '13px',
                }}
                formatter={(value: number, name: string, props: any) => {
                  const payload = props.payload as WeekData;
                  return [
                    `${payload.formattedAvg} (${payload.daysTracked} days tracked)`,
                    'Daily Avg',
                  ];
                }}
                labelFormatter={(label) => `Week: ${label}`}
              />
              <ReferenceLine
                y={overallWeeklyAvgHours}
                stroke="#f59e0b"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{
                  value: 'Overall Avg',
                  position: 'right',
                  fill: '#f59e0b',
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey="avgHours"
                name="Weekly Avg"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {weeks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getWeeklyBarColor(entry.avgHours)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Color legend */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#22c55e' }}></span>
              Above avg
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }}></span>
              Near avg
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#94a3b8' }}></span>
              Below avg
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm border" style={{ borderColor: '#f59e0b', backgroundColor: 'transparent' }}></span>
              Overall avg line
            </div>
          </div>
        </>
      )}

      {/* Monthly Average Chart */}
      {activeTab === 'monthly' && showMonthly && (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={months} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="monthLabel"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                interval={0}
              />
              <YAxis
                tick={{ fill: 'currentColor' }}
                style={{ fontSize: '12px' }}
                label={{ value: 'Avg Hours/Day', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '13px',
                }}
                formatter={(value: number, name: string, props: any) => {
                  const payload = props.payload as MonthData;
                  return [
                    `${payload.formattedAvg} (${payload.daysTracked}/${payload.daysInMonth} days)`,
                    'Daily Avg',
                  ];
                }}
                labelFormatter={(label) => `${label}`}
              />
              {monthsWithData.length > 1 && (
                <ReferenceLine
                  y={overallMonthlyAvgHours}
                  stroke="#f59e0b"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: 'Overall Avg',
                    position: 'right',
                    fill: '#f59e0b',
                    fontSize: 11,
                  }}
                />
              )}
              <Bar
                dataKey="avgHours"
                name="Monthly Avg"
                radius={[6, 6, 0, 0]}
                maxBarSize={80}
              >
                {months.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getMonthlyBarColor(entry.avgHours)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Monthly details table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 sm:px-3">Month</th>
                  <th className="text-right py-2 px-2 sm:px-3">Days Tracked</th>
                  <th className="text-right py-2 px-2 sm:px-3">Total Time</th>
                  <th className="text-right py-2 px-2 sm:px-3">Daily Avg</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => (
                  <tr key={month.monthKey} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2 sm:px-3 font-medium">{month.monthLabel}</td>
                    <td className="py-2 px-2 sm:px-3 text-right text-gray-500 dark:text-gray-400">
                      {month.daysTracked}/{month.daysInMonth}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-right">{month.formattedTotal}</td>
                    <td className="py-2 px-2 sm:px-3 text-right font-medium text-primary-600 dark:text-primary-400">
                      {month.formattedAvg}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Color legend */}
          {monthsWithData.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#22c55e' }}></span>
                Above avg
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }}></span>
                Near avg
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#94a3b8' }}></span>
                Below avg
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm border" style={{ borderColor: '#f59e0b', backgroundColor: 'transparent' }}></span>
                Overall avg line
              </div>
            </div>
          )}
        </>
      )}

      {/* Cumulative Average Chart */}
      {activeTab === 'cumulative' && showCumulative && (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={cumulativeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="formattedDate"
              tick={{ fill: 'currentColor', fontSize: 11 }}
              angle={cumulativeData.length > 20 ? -45 : 0}
              textAnchor={cumulativeData.length > 20 ? 'end' : 'middle'}
              height={cumulativeData.length > 20 ? 70 : 30}
              interval={cumulativeData.length > 30 ? Math.floor(cumulativeData.length / 15) : cumulativeData.length > 15 ? 1 : 0}
            />
            <YAxis
              tick={{ fill: 'currentColor' }}
              style={{ fontSize: '12px' }}
              label={{ value: 'Avg Hours/Day', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
              }}
              formatter={(value: number, name: string, props: any) => {
                const payload = props.payload as CumulativePoint;
                if (name === 'Overall Avg') {
                  return [`${payload.formattedAvg} (Day ${payload.dayNumber})`, 'Overall Avg'];
                }
                return [`${payload.formattedDaily}`, 'Daily Time'];
              }}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="dailyHours"
              stroke="#94a3b8"
              strokeWidth={1}
              dot={false}
              strokeDasharray="3 3"
              name="Daily Time"
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="cumulativeAvgHours"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', r: 3 }}
              activeDot={{ r: 6 }}
              name="Overall Avg"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
