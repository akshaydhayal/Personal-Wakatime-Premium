# WakaTime Premium - Your Coding Activity Tracker

A Next.js application that syncs and stores your WakaTime activity data in MongoDB, allowing you to view historical data beyond the free tier's 7-day limit.

## Features

- 🔄 **Sync with WakaTime API** - Automatically fetch your last 7 days of coding activity
- 💾 **MongoDB Storage** - Store all your historical data in MongoDB
- 📊 **Beautiful Dashboards** - View your activity with interactive charts and statistics
- 📈 **Activity Charts** - Visualize your coding time over time
- 🗂️ **Language Breakdown** - See which languages you code in most
- 📅 **History View** - Browse all your past activity
- 🎨 **WakaTime-like UI** - Familiar interface similar to WakaTime

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- WakaTime account with API key

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# WakaTime API Configuration
# Get your API key from: https://wakatime.com/settings/api-key
WAKATIME_API_KEY=your_wakatime_api_key_here

# MongoDB Configuration
# Get your connection string from: https://www.mongodb.com/cloud/atlas
# Format: mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
MONGODB_URI=your_mongodb_connection_string_here
```

### 3. Get Your WakaTime API Key

1. Go to [WakaTime Settings](https://wakatime.com/settings/api-key)
2. Copy your API key
3. Paste it in `.env.local` as `WAKATIME_API_KEY`

### 4. Set Up MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Add your connection string to `.env.local` as `MONGODB_URI`

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Use connection string: `mongodb://localhost:27017/wakatime`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Sync Your Data

1. Click the "Sync with WakaTime" button on the dashboard
2. This will fetch your last 7 days of activity and store it in MongoDB
3. You can sync daily to keep your data up to date

## Usage

### Dashboard
- View your last 7 days of activity
- See total time tracked, days tracked, and daily averages
- Interactive charts showing your activity over time
- Top languages and projects breakdown

### History
- Browse all your historical activity
- Click on any day to see detailed breakdown
- View languages, projects, and editors used

### Daily Sync
You can manually sync your data by clicking the "Sync with WakaTime" button. For automatic daily syncing, you can:

1. **Vercel Cron Jobs** (if deploying to Vercel):
   - Add a `vercel.json` file with cron configuration
   - Set up a cron job to call `/api/sync` daily

2. **External Cron Service**:
   - Use services like [cron-job.org](https://cron-job.org) to hit your `/api/sync` endpoint daily

3. **Local Cron** (for local development):
   - Set up a cron job on your machine to call the sync endpoint

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── sync/          # Sync endpoint to fetch from WakaTime
│   │   ├── summaries/     # Get summaries from MongoDB
│   │   └── stats/         # Get aggregate statistics
│   ├── history/           # History page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   └── globals.css        # Global styles
├── components/
│   ├── ActivityChart.tsx  # Activity line chart
│   ├── LanguageBreakdown.tsx # Language/project bar chart
│   ├── Navigation.tsx     # Navigation component
│   ├── StatsCards.tsx     # Statistics cards
│   └── SyncButton.tsx     # Sync button component
├── lib/
│   ├── mongodb.ts         # MongoDB connection
│   └── wakatime.ts        # WakaTime API client
├── models/
│   └── Summary.ts         # MongoDB schema
└── .env.local             # Environment variables (not in git)
```

## API Endpoints

- `POST /api/sync` - Sync data from WakaTime API to MongoDB
- `GET /api/summaries?last7=true` - Get last 7 days of summaries
- `GET /api/summaries?limit=100` - Get all summaries (with limit)
- `GET /api/stats` - Get aggregate statistics

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **MongoDB** - Database for storing activity data
- **Mongoose** - MongoDB ODM
- **Recharts** - Chart library for visualizations
- **Tailwind CSS** - Styling
- **SWR** - Data fetching and caching

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Your own server

## Notes

- The free WakaTime API allows access to the last 7 days of data
- This app stores that data in MongoDB so you can view historical data
- Sync daily to keep your database updated
- All data is stored locally in your MongoDB instance

## License

MIT

## Support

If you encounter any issues:
1. Check that your environment variables are set correctly
2. Verify your WakaTime API key is valid
3. Ensure MongoDB connection string is correct
4. Check the browser console and server logs for errors
