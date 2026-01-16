'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Language {
  name: string;
  total_seconds: number;
  percent: number;
}

interface LanguageBreakdownProps {
  languages: Language[];
  title?: string;
}

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b'];

export default function LanguageBreakdown({ languages, title = 'Top Languages' }: LanguageBreakdownProps) {
  const chartData = languages
    .slice(0, 10)
    .map((lang) => ({
      name: lang.name,
      hours: lang.total_seconds / 3600,
      percent: lang.percent,
    }))
    .sort((a, b) => b.hours - a.hours);

  if (chartData.length === 0) {
    return (
      <div className="stat-card mt-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="stat-card mt-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            type="number"
            tick={{ fill: 'currentColor' }}
            style={{ fontSize: '12px' }}
            label={{ value: 'Hours', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            tick={{ fill: 'currentColor' }}
            style={{ fontSize: '12px' }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value.toFixed(2)} hrs (${props.payload.percent.toFixed(1)}%)`,
              'Time',
            ]}
          />
          <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
