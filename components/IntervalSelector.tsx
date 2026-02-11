'use client';

interface IntervalSelectorProps {
  selectedInterval: string;
  onIntervalChange: (interval: string) => void;
}

const intervals = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '14days', label: 'Last 14 Days' },
  { value: '1month', label: 'Last 30 Days' },
  { value: 'alltime', label: 'All Time' },
];

export default function IntervalSelector({ selectedInterval, onIntervalChange }: IntervalSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {intervals.map((interval) => (
        <button
          key={interval.value}
          onClick={() => onIntervalChange(interval.value)}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
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
