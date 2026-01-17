import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Summary from '@/models/Summary';

interface HistoricalData {
  date: string; // YYYY-MM-DD
  hours: number;
  minutes: number;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Historical data provided by user
    const historicalData: HistoricalData[] = [
      { date: '2026-01-01', hours: 6, minutes: 30 },
      { date: '2026-01-02', hours: 6, minutes: 1 },
      { date: '2026-01-03', hours: 7, minutes: 27 },
      { date: '2026-01-04', hours: 4, minutes: 50 },
      { date: '2026-01-05', hours: 6, minutes: 1 },
      { date: '2026-01-06', hours: 8, minutes: 23 },
      { date: '2026-01-07', hours: 6, minutes: 30 },
      { date: '2026-01-08', hours: 7, minutes: 1 },
      { date: '2026-01-09', hours: 7, minutes: 15 },
      { date: '2026-01-10', hours: 5, minutes: 20 },
    ];

    // Get existing data from Jan 11-17 to use as template for breakdown
    const existingSummaries = await Summary.find({
      date: { $gte: '2026-01-11', $lte: '2026-01-17' }
    }).lean();

    if (existingSummaries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No existing data found from Jan 11-17. Please sync data first.',
        },
        { status: 400 }
      );
    }

    // Calculate average breakdown from existing data
    const avgLanguages = calculateAverageBreakdown(existingSummaries, 'languages');
    const avgProjects = calculateAverageBreakdown(existingSummaries, 'projects');
    const avgEditors = calculateAverageBreakdown(existingSummaries, 'editors');
    const avgOS = calculateAverageBreakdown(existingSummaries, 'operating_systems');

    // Create summaries for each historical date
    const operations = historicalData.map((entry) => {
      const totalSeconds = entry.hours * 3600 + entry.minutes * 60;
      const hours = entry.hours;
      const mins = entry.minutes;
      const secs = totalSeconds % 60;

      // Format digital time (H:MM)
      const digital = `${hours}:${mins.toString().padStart(2, '0')}`;
      const text = `${hours} hrs ${mins} mins`;

      // Calculate breakdown based on total seconds and average percentages
      const languages = avgLanguages.map((lang: any) => ({
        name: lang.name,
        total_seconds: Math.round((totalSeconds * lang.percent) / 100),
        digital: formatTime(lang.percent * totalSeconds / 100),
        text: formatTimeText(lang.percent * totalSeconds / 100),
        percent: lang.percent,
      }));

      const projects = avgProjects.map((proj: any) => ({
        name: proj.name,
        total_seconds: Math.round((totalSeconds * proj.percent) / 100),
        digital: formatTime(proj.percent * totalSeconds / 100),
        text: formatTimeText(proj.percent * totalSeconds / 100),
        percent: proj.percent,
      }));

      const editors = avgEditors.map((editor: any) => ({
        name: editor.name,
        total_seconds: Math.round((totalSeconds * editor.percent) / 100),
        digital: formatTime(editor.percent * totalSeconds / 100),
        text: formatTimeText(editor.percent * totalSeconds / 100),
        percent: editor.percent,
      }));

      const operating_systems = avgOS.map((os: any) => ({
        name: os.name,
        total_seconds: Math.round((totalSeconds * os.percent) / 100),
        digital: formatTime(os.percent * totalSeconds / 100),
        text: formatTimeText(os.percent * totalSeconds / 100),
        percent: os.percent,
      }));

      return {
        updateOne: {
          filter: { date: entry.date },
          update: {
            $set: {
              date: entry.date,
              total_seconds: totalSeconds,
              digital: digital,
              text: text,
              hours: hours,
              minutes: mins,
              seconds: secs,
              languages: languages,
              projects: projects,
              editors: editors,
              operating_systems: operating_systems,
              updated_at: new Date(),
            },
            $setOnInsert: {
              created_at: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      await Summary.bulkWrite(operations);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${historicalData.length} days of historical data`,
      added: historicalData.length,
      dates: historicalData.map(d => d.date),
    });
  } catch (error: any) {
    console.error('Add historical data error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add historical data',
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate average breakdown from existing data
function calculateAverageBreakdown(summaries: any[], type: 'languages' | 'projects' | 'editors' | 'operating_systems') {
  const breakdownMap = new Map<string, { total: number; count: number }>();

  summaries.forEach((summary: any) => {
    const items = summary[type] || [];
    items.forEach((item: any) => {
      const existing = breakdownMap.get(item.name) || { total: 0, count: 0 };
      breakdownMap.set(item.name, {
        total: existing.total + item.percent,
        count: existing.count + 1,
      });
    });
  });

  const averages = Array.from(breakdownMap.entries())
    .map(([name, data]) => ({
      name,
      percent: data.total / data.count,
    }))
    .sort((a, b) => b.percent - a.percent);

  // Normalize percentages to sum to 100
  const totalPercent = averages.reduce((sum, item) => sum + item.percent, 0);
  return averages.map(item => ({
    ...item,
    percent: (item.percent / totalPercent) * 100,
  }));
}

// Helper function to format time as digital (H:MM)
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

// Helper function to format time as text
function formatTimeText(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours} hrs ${minutes} mins`;
  } else if (hours > 0) {
    return `${hours} hrs`;
  } else if (minutes > 0) {
    return `${minutes} mins`;
  }
  return '0 secs';
}
