import type { DayConfig } from '~/api/campaignsApi';

export interface PredefinedScheduleConfig {
	name: string;
	dayConfigs: DayConfig[];
}
