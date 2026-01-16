'use client';

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatTimeDetailed } from '@/lib/utils';

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
    .map((item) => {
      const hours = item.total_seconds / 3600;
      return {
        date: item.date,
        hours: hours,
        formattedDate: format(parseISO(item.date), 'MMM dd'),
        seconds: item.total_seconds,
        formattedTime: formatTimeDetailed(item.total_seconds),
      };
    });
  // Data is already sorted chronologically from the API

  return (
    <div className="stat-card mt-6">
      <h3 className="text-xl font-semibold mb-4">Activity Over Time</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
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
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '10px',
            }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'Bar') {
                return [props.payload.formattedTime, 'Time'];
              }
              return [props.payload.formattedTime, 'Time'];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Bar 
            dataKey="hours" 
            fill="#3b82f6" 
            opacity={0.7}
            name="Daily Activity"
            radius={[4, 4, 0, 0]}
          />
          <Line 
            type="monotone" 
            dataKey="hours" 
            stroke="#0ea5e9" 
            strokeWidth={3}
            dot={{ fill: '#0ea5e9', r: 5 }}
            activeDot={{ r: 7 }}
            name="Trend"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
