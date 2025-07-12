import type SchedulerContactGroupModel from "./SchedulerContactGroupModel";
import type ContactGroup from "./SchedulerContactGroupModel";

export interface TimeRange {
  id: number;
  dayConfigId: number;
  startTime: string; // Format: 'HH:mm:ss'
  endTime: string; // Format: 'HH:mm:ss'
  callsPerHourOverride: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayConfig {
  id: number;
  scheduleId: number;
  dayOfWeek: DayOfWeek;
  isActive: boolean;
  dailyCallLimit: number;
  timeRanges: TimeRange[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Scheduler {
  id: number;
  name: string;
  description: string | null;
  campaignId: number;
  status: "active" | "paused" | "completed" | "draft" | string;
  humanEquivalent: number;
  callsPerHour: number | null;
  estimatedCompletionDays: number | null;
  totalWeekVolumes: number | null;
  totalWeeklyHours: number; // Added to match the provided object
  userId: number;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null; // Made optional with ?
  dayConfigs?: DayConfig[]; // Made optional with ?
  scheduleContactGroups?: SchedulerContactGroupModel[]; // Made optional with ?
}

// Create a const to allow default export
const SchedulerExport = {};
export default SchedulerExport;
