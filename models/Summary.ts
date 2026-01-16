import mongoose, { Schema, Document } from 'mongoose';

export interface ISummary extends Document {
  date: string; // YYYY-MM-DD format
  total_seconds: number;
  digital: string;
  text: string;
  hours: number;
  minutes: number;
  seconds: number;
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
  created_at: Date;
  updated_at: Date;
}

const SummarySchema = new Schema<ISummary>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    total_seconds: {
      type: Number,
      required: true,
      default: 0,
    },
    digital: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    hours: {
      type: Number,
      default: 0,
    },
    minutes: {
      type: Number,
      default: 0,
    },
    seconds: {
      type: Number,
      default: 0,
    },
    languages: [
      {
        name: String,
        total_seconds: Number,
        digital: String,
        text: String,
        percent: Number,
      },
    ],
    projects: [
      {
        name: String,
        total_seconds: Number,
        digital: String,
        text: String,
        percent: Number,
      },
    ],
    editors: [
      {
        name: String,
        total_seconds: Number,
        digital: String,
        text: String,
        percent: Number,
      },
    ],
    operating_systems: [
      {
        name: String,
        total_seconds: Number,
        digital: String,
        text: String,
        percent: Number,
      },
    ],
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Summary || mongoose.model<ISummary>('Summary', SummarySchema);
