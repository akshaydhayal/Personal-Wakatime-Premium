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

// Create unique index on date
SummarySchema.index({ date: 1 }, { unique: true });

/**
 * Get the Summary model for a specific user
 * Each user has their own collection
 */
export function getSummaryModel(userId: string) {
  const collectionName = userId.toLowerCase(); // akshay, monika, himanshu
  
  // Check if model already exists
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  
  // Create new model with collection name = userId
  return mongoose.model<ISummary>(collectionName, SummarySchema, collectionName);
}

// Default export for backward compatibility (uses 'akshay' collection)
export default getSummaryModel('akshay');
