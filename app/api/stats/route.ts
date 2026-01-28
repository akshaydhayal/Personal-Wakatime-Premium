import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getSummaryModel } from '@/lib/getSummaryModel';
import { Model } from 'mongoose';
import { ISummary } from '@/lib/getSummaryModel';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user from query params (default to 'akshay')
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user') || 'akshay';

    // Get the Summary model for this user's collection
    const Summary = getSummaryModel(userId) as Model<ISummary>;

    // Get all summaries for this user from their collection, sorted by date
    const summaries = await Summary.find({}).sort({ date: 1 }).lean() as any[];

    // Calculate aggregate stats
    const totalSeconds = summaries.reduce((sum, s) => sum + (s.total_seconds || 0), 0);
    const totalDays = summaries.length;
    
    // Calculate daily average from first entry date to today
    // If no data exists, default to 0
    let avgSecondsPerDay = 0;
    let daysSinceFirstEntry = 0;
    
    if (summaries.length > 0) {
      // Get first entry date
      const firstEntryDate = summaries[0].date;
      const firstDate = new Date(firstEntryDate);
      
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      firstDate.setHours(0, 0, 0, 0);
      
      // Calculate days from first entry to today (inclusive)
      const diffTime = today.getTime() - firstDate.getTime();
      daysSinceFirstEntry = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
      
      // Calculate average based on days from first entry to today
      avgSecondsPerDay = daysSinceFirstEntry > 0 ? totalSeconds / daysSinceFirstEntry : 0;
    }

    // Aggregate languages
    const languageMap = new Map<string, number>();
    summaries.forEach((summary) => {
      (summary.languages || []).forEach((lang: any) => {
        const current = languageMap.get(lang.name) || 0;
        languageMap.set(lang.name, current + lang.total_seconds);
      });
    });

    const topLanguages = Array.from(languageMap.entries())
      .map(([name, seconds]) => ({
        name,
        total_seconds: seconds,
        percent: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
      }))
      .sort((a, b) => b.total_seconds - a.total_seconds)
      .slice(0, 10);

    // Aggregate projects
    const projectMap = new Map<string, number>();
    summaries.forEach((summary) => {
      (summary.projects || []).forEach((proj: any) => {
        const current = projectMap.get(proj.name) || 0;
        projectMap.set(proj.name, current + proj.total_seconds);
      });
    });

    const topProjects = Array.from(projectMap.entries())
      .map(([name, seconds]) => ({
        name,
        total_seconds: seconds,
        percent: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
      }))
      .sort((a, b) => b.total_seconds - a.total_seconds)
      .slice(0, 10);

    // Aggregate editors
    const editorMap = new Map<string, number>();
    summaries.forEach((summary) => {
      (summary.editors || []).forEach((editor: any) => {
        const current = editorMap.get(editor.name) || 0;
        editorMap.set(editor.name, current + editor.total_seconds);
      });
    });

    const topEditors = Array.from(editorMap.entries())
      .map(([name, seconds]) => ({
        name,
        total_seconds: seconds,
        percent: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
      }))
      .sort((a, b) => b.total_seconds - a.total_seconds)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      stats: {
        total_seconds: totalSeconds,
        total_days: totalDays,
        avg_seconds_per_day: avgSecondsPerDay,
        days_since_first_entry: daysSinceFirstEntry,
        total_hours: Math.floor(totalSeconds / 3600),
        total_minutes: Math.floor((totalSeconds % 3600) / 60),
      },
      top_languages: topLanguages,
      top_projects: topProjects,
      top_editors: topEditors,
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
