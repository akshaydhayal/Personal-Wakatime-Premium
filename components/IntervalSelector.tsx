'use client';

interface IntervalSelectorProps {
  selectedInterval: string;
  onIntervalChange: (interval: string) => void;
}

const intervals = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '14days', label: 'Last 14 Days' },
  { value: '1month', label: 'Last Month' },
  { value: 'alltime', label: 'All Time' },
];

export default function IntervalSelector({ selectedInterval, onIntervalChange }: IntervalSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {intervals.map((interval) => (
        <button
          key={interval.value}
          onClick={() => onIntervalChange(interval.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedInterval === interval.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {interval.label}
        </button>
      ))}
    </div>
  );
}
