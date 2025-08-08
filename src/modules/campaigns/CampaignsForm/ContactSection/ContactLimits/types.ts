import type { MappedResult } from "~/models/ContactFileSummary";

/**
 * Represents the complete form data structure for contact limits
 */
export interface ContactLimitsFormData {
  name: string;
  description?: string;
  maxCallsPerContact: number;
  maxCallsPerList: number;
  expirationDate: string | null;
  schedule: string;
  scheduleId?: number;
  columnMappings: MappedResult;
  status?: "active" | "inactive" | "paused";
}
