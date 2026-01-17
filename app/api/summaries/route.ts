import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Summary from '@/models/Summary';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '1000');
    const interval = searchParams.get('interval') || '7days'; // 7days, 14days, 1month, alltime

    let query: any = {};
    let dateStrings: string[] = [];
    let fillMissingDays = false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (interval === '7days') {
      // Get last 7 days including today
      fillMissingDays = true;
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dateStrings.push(date.toISOString().split('T')[0]);
      }
      query.date = { $in: dateStrings };
    } else if (interval === '14days') {
      // Get last 14 days including today
      fillMissingDays = true;
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dateStrings.push(date.toISOString().split('T')[0]);
      }
      query.date = { $in: dateStrings };
    } else if (interval === '1month') {
      // Get last 30 days including today
      fillMissingDays = false; // Too many days to fill, just show what we have
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29);
      query.date = { $gte: thirtyDaysAgo.toISOString().split('T')[0] };
    } else if (interval === 'alltime') {
      // Get all data
      fillMissingDays = false;
      query = {}; // No date filter
    }

    let summaries: any[] = await Summary.find(query)
      .sort({ date: 1 }) // Sort ascending for chronological order
      .limit(limit)
      .lean();

    // Fill missing days for short intervals
    if (fillMissingDays && dateStrings.length > 0) {
      const filledSummaries: any[] = [];
      for (const dateStr of dateStrings) {
        const existing = summaries.find((s: any) => s.date === dateStr);
        if (existing) {
          filledSummaries.push(existing);
        } else {
          // Fill missing days with zero data
          filledSummaries.push({
            date: dateStr,
            total_seconds: 0,
            digital: '0:00',
            text: '0 secs',
            hours: 0,
            minutes: 0,
            seconds: 0,
            languages: [],
            projects: [],
            editors: [],
            operating_systems: [],
          });
        }
      }
      summaries = filledSummaries;
    }

    // Calculate totals
    const totalSeconds = summaries.reduce((sum, s) => sum + (s.total_seconds || 0), 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

    return NextResponse.json({
      success: true,
      data: summaries,
      totals: {
        total_seconds: totalSeconds,
        hours: totalHours,
        minutes: totalMinutes,
        digital: `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`,
        text: `${totalHours} hrs ${totalMinutes} mins`,
      },
      count: summaries.length,
    });
  } catch (error: any) {
    console.error('Fetch summaries error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch summaries',
      },
      { status: 500 }
    );
  }
}
