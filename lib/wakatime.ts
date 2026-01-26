const WAKATIME_API_BASE = 'https://wakatime.com/api/v1';

/**
 * Get WakaTime API key for a specific user
 */
function getWakaTimeApiKey(userId: string): string {
  const keyMap: Record<string, string> = {
    akshay: process.env.WAKATIME_API_KEY_AKSHAY || process.env.WAKATIME_API_KEY || '',
    monika: process.env.WAKATIME_API_KEY_MONIKA || '',
    himanshu: process.env.WAKATIME_API_KEY_HIMANSHU || '',
  };

  const apiKey = keyMap[userId.toLowerCase()];
  if (!apiKey) {
    throw new Error(`WAKATIME_API_KEY_${userId.toUpperCase()} is not set`);
  }
  return apiKey;
}

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

export async function fetchLast7Days(userId: string = 'akshay'): Promise<WakaTimeSummary[]> {
  const apiKey = getWakaTimeApiKey(userId);

  const url = `${WAKATIME_API_BASE}/users/current/summaries?range=last_7_days`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
  }

  const data: WakaTimeSummariesResponse = await response.json();
  return data.data || [];
}

export async function fetchDateRange(start: string, end: string, userId: string = 'akshay'): Promise<WakaTimeSummary[]> {
  const apiKey = getWakaTimeApiKey(userId);

  const url = `${WAKATIME_API_BASE}/users/current/summaries?start=${start}&end=${end}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
  }

  const data: WakaTimeSummariesResponse = await response.json();
  return data.data || [];
}

export async function fetchToday(userId: string = 'akshay'): Promise<WakaTimeSummary | null> {
  const apiKey = getWakaTimeApiKey(userId);

  const url = `${WAKATIME_API_BASE}/users/current/summaries?range=today`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WakaTime API error: ${response.status} - ${errorText}`);
  }

  const data: WakaTimeSummariesResponse = await response.json();
  return data.data && data.data.length > 0 ? data.data[0] : null;
}
