import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getSummaryModel } from '@/lib/getSummaryModel';
import { fetchLast7Days, fetchDateRange } from '@/lib/wakatime';
import { Model } from 'mongoose';
import { ISummary } from '@/lib/getSummaryModel';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get user from request body (default to 'akshay' for backward compatibility)
    const body = await request.json().catch(() => ({}));
    const userId = body.user || 'akshay';

    // Get the Summary model for this user's collection
    const Summary = getSummaryModel(userId) as Model<ISummary>;

    // For monika and himanshu, fetch data from Jan 20, 2026 onwards
    // For akshay, fetch last 7 days (as before)
    let summaries;
    if (userId === 'monika' || userId === 'himanshu') {
      const startDate = '2026-01-20';
      const today = new Date().toISOString().split('T')[0];
      summaries = await fetchDateRange(startDate, today, userId);
    } else {
      // For akshay, fetch last 7 days
      summaries = await fetchLast7Days(userId);
    }

    // Store each day's summary in MongoDB
    const operations = summaries.map((summary) => {
      const date = summary.range.date;
      const grandTotal = summary.grand_total;

      return {
        updateOne: {
          filter: { date },
          update: {
            $set: {
              date,
              total_seconds: grandTotal.total_seconds,
              digital: grandTotal.digital,
              text: grandTotal.text,
              hours: grandTotal.hours,
              minutes: grandTotal.minutes,
              seconds: grandTotal.total_seconds % 60,
              languages: summary.languages || [],
              projects: summary.projects || [],
              editors: summary.editors || [],
              operating_systems: summary.operating_systems || [],
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
      message: `Synced ${summaries.length} days of data`,
      synced: summaries.length,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync data',
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual triggering (useful for cron jobs)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user from query params (default to 'akshay')
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user') || 'akshay';

    // Get the Summary model for this user's collection
    const Summary = getSummaryModel(userId) as Model<ISummary>;

    // For monika and himanshu, fetch data from Jan 20, 2026 onwards
    // For akshay, fetch last 7 days (as before)
    let summaries;
    if (userId === 'monika' || userId === 'himanshu') {
      const startDate = '2026-01-20';
      const today = new Date().toISOString().split('T')[0];
      summaries = await fetchDateRange(startDate, today, userId);
    } else {
      // For akshay, fetch last 7 days
      summaries = await fetchLast7Days(userId);
    }

    // Store each day's summary in MongoDB
    const operations = summaries.map((summary) => {
      const date = summary.range.date;
      const grandTotal = summary.grand_total;

      return {
        updateOne: {
          filter: { date },
          update: {
            $set: {
              date,
              total_seconds: grandTotal.total_seconds,
              digital: grandTotal.digital,
              text: grandTotal.text,
              hours: grandTotal.hours,
              minutes: grandTotal.minutes,
              seconds: grandTotal.total_seconds % 60,
              languages: summary.languages || [],
              projects: summary.projects || [],
              editors: summary.editors || [],
              operating_systems: summary.operating_systems || [],
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
      message: `Synced ${summaries.length} days of data`,
      synced: summaries.length,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync data',
      },
      { status: 500 }
    );
  }
}
