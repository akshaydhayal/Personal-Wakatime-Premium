import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getSummaryModel } from '@/lib/getSummaryModel';
import { Model } from 'mongoose';
import { ISummary } from '@/lib/getSummaryModel';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '1000');
    const interval = searchParams.get('interval') || '7days'; // 7days, 14days, 1month, alltime
    const userId = searchParams.get('user') || 'akshay'; // Default to 'akshay' for backward compatibility

    // Get the Summary model for this user's collection
    const Summary = getSummaryModel(userId) as Model<ISummary>;

    let query: any = {};
    let dateStrings: string[] = [];
    let fillMissingDays = false;

    // Get today's date in local timezone (YYYY-MM-DD format)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (interval === '7days') {
      // Get last 7 days including today
      fillMissingDays = true;
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dateStrings.push(dateStr);
      }
      query.date = { $in: dateStrings };
    } else if (interval === '14days') {
      // Get last 14 days including today
      fillMissingDays = true;
      for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        dateStrings.push(dateStr);
      }
      query.date = { $in: dateStrings };
    } else if (interval === '1month') {
      // Get last 30 days including today
      fillMissingDays = false; // Too many days to fill, just show what we have
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      const thirtyDaysAgoStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;
      query.date = { $gte: thirtyDaysAgoStr };
    } else if (interval === 'alltime') {
      // Get all data for this user
      fillMissingDays = false;
      query = {}; // No filter - get all data from this user's collection
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
