import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Summary from '@/models/Summary';
import { fetchLast7Days } from '@/lib/wakatime';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Fetch last 7 days from WakaTime
    const summaries = await fetchLast7Days();

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
export async function GET() {
  try {
    await connectDB();

    // Fetch last 7 days from WakaTime
    const summaries = await fetchLast7Days();

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
