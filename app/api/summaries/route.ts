import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Summary from '@/models/Summary';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '30');
    const last7Days = searchParams.get('last7') === 'true';

    let query: any = {};

    if (last7Days) {
      // Get last 7 days including today (today + 6 days ago = 7 days total)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      
      const dateStrings = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dateStrings.push(date.toISOString().split('T')[0]);
      }
      
      query.date = { $in: dateStrings };
    }

    let summaries = await Summary.find(query)
      .sort({ date: 1 }) // Sort ascending for chronological order
      .limit(limit)
      .lean();

    // If last7Days, ensure we have entries for all 7 days (fill missing days with 0)
    if (last7Days) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const all7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const existing = summaries.find((s: any) => s.date === dateStr);
        if (existing) {
          all7Days.push(existing);
        } else {
          // Fill missing days with zero data
          all7Days.push({
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
      summaries = all7Days;
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
