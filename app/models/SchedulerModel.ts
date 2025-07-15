import type SchedulerContactGroupModel from "./SchedulerContactGroupModel";

export interface HourConfig {
  id: number;
  clientId: number;
  dayConfigId: number;
  hour: string; // Format: 'HH:mm:ss'
  hourOrder: number;
  capacity: string;
  isActive: boolean;
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
  clientId: number;
  dayOfWeek: DayOfWeek;
  dayOrder: number;
  isActive: boolean;
  dailyCallLimit: number | null;
  dayCapacity: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  hourConfigs: HourConfig[];
}

export interface Scheduler {
  id: number;
  name: string;
  description: string | null;
  campaignId: number;
  status: "active" | "paused" | "completed" | "draft" | string;
  humanEquivalent: string | null;
  callsPerHour: string | null;
  estimatedCompletionDays: number | null;
  totalWeekVolumes: number | null;
  totalWeeklyHours: string | null;
  userId: number;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  dayConfigs: DayConfig[];
  scheduleContactGroups: SchedulerContactGroupModel[];
}
