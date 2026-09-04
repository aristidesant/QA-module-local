import type { ListQueryParams } from './shared';

export type AlertType = 'THRESHOLD' | 'TREND' | 'STREAK' | 'RECOGNITION';
export type TriggerScope = 'QA' | 'SENTIMENT' | 'COMPLIANCE' | 'BUSINESS_INSIGHTS' | 'ALL';
export type AlertChannel = 'IN_APP' | 'EMAIL' | 'DASHBOARD_BADGE';

export interface AlertConfigurationListQueryParams extends ListQueryParams {
	clientId?: number;
	supervisorId?: number | null;
	isActive?: boolean;
	alertType?: AlertType;
	triggerScope?: TriggerScope;
	isRecognition?: boolean;
	sortBy?: 'id' | 'name' | 'alertType' | 'triggerScope' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface AlertConfiguration {
	id: number;
	clientId: number;
	createdByUserId: number;
	supervisorId?: number | null;
	name: string;
	description?: string | null;

	// Type of trigger
	alertType: AlertType;
	triggerScope: TriggerScope;

	// Threshold parameters
	thresholdValue?: number | null;
	trendPercentage?: number | null;
	streakCount?: number | null;
	timeWindowDays?: number | null;

	// Notification channels
	channels: AlertChannel[];

	// Status
	isActive: boolean;
	isRecognition: boolean;

	// Limits for Supervisor configuration (set by QA Manager)
	supervisorMaxThreshold?: number | null;
	supervisorMinThreshold?: number | null;

	createdAt?: string;
	updatedAt?: string;
}

export interface CreateAlertConfigurationPayload {
	name: string;
	description?: string;
	alertType: AlertType;
	triggerScope: TriggerScope;
	thresholdValue?: number;
	trendPercentage?: number;
	streakCount?: number;
	timeWindowDays?: number;
	channels: AlertChannel[];
	isActive?: boolean;
	isRecognition?: boolean;
	supervisorId?: number;
	supervisorMaxThreshold?: number;
	supervisorMinThreshold?: number;
}

export type UpdateAlertConfigurationPayload = Partial<CreateAlertConfigurationPayload>;
