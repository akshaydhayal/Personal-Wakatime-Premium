'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ActivityChartProps {
  data: Array<{
    date: string;
    total_seconds: number;
    digital: string;
    hours: number;
  }>;
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const chartData = data
    .map((item) => ({
      date: item.date,
      hours: item.total_seconds / 3600, // Convert seconds to hours
      formattedDate: format(parseISO(item.date), 'MMM dd'),
      seconds: item.total_seconds,
    }));
  // Data is already sorted chronologically from the API

  return (
    <div className="stat-card mt-6">
      <h3 className="text-xl font-semibold mb-4">Activity Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fill: 'currentColor' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            tick={{ fill: 'currentColor' }}
            style={{ fontSize: '12px' }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value.toFixed(2)} hrs`, 'Time']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="hours" 
            stroke="#0ea5e9" 
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
