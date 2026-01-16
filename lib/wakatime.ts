const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;
const WAKATIME_API_BASE = 'https://wakatime.com/api/v1';

export interface WakaTimeSummary {
  range: {
    start: string;
    end: string;
    date: string;
    text: string;
    timezone: string;
  };
  grand_total: {
    hours: number;
    minutes: number;
    total_seconds: number;
    digital: string;
    text: string;
  };
  languages: Array<{
    name: string;
    total_seconds: number;
    digital: string;
    text: string;
    percent: number;
  }>;
  projects: Array<{
    name: string;
    total_seconds: number;
    digital: string;
    text: string;
    percent: number;
  }>;
  editors: Array<{
    name: string;
    total_seconds: number;
    digital: string;
    text: string;
    percent: number;
  }>;
  operating_systems: Array<{
    name: string;
    total_seconds: number;
    digital: string;
    text: string;
    percent: number;
  }>;
}

export interface WakaTimeSummariesResponse {
  data: WakaTimeSummary[];
}

export async function fetchLast7Days(): Promise<WakaTimeSummary[]> {
  if (!WAKATIME_API_KEY) {
    throw new Error('WAKATIME_API_KEY is not set');
  }

  const url = `${WAKATIME_API_BASE}/users/current/summaries?range=last_7_days`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
  }

  const data: WakaTimeSummariesResponse = await response.json();
  return data.data || [];
}

export async function fetchDateRange(start: string, end: string): Promise<WakaTimeSummary[]> {
  if (!WAKATIME_API_KEY) {
    throw new Error('WAKATIME_API_KEY is not set');
  }

  const url = `${WAKATIME_API_BASE}/users/current/summaries?start=${start}&end=${end}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
  }

  const data: WakaTimeSummariesResponse = await response.json();
  return data.data || [];
}

export async function fetchToday(): Promise<WakaTimeSummary | null> {
  if (!WAKATIME_API_KEY) {
    throw new Error('WAKATIME_API_KEY is not set');
  }

  const url = `${WAKATIME_API_BASE}/users/current/summaries?range=today`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${WAKATIME_API_KEY}:`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
  }

  const data: WakaTimeSummariesResponse = await response.json();
  return data.data && data.data.length > 0 ? data.data[0] : null;
}
