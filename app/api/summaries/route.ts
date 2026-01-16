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
      // Get last 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const dateStrings = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(sevenDaysAgo.getDate() + i);
        dateStrings.push(date.toISOString().split('T')[0]);
      }
      
      query.date = { $in: dateStrings };
    }

    const summaries = await Summary.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .lean();

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
