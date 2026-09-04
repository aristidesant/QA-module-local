import type { ListQueryParams } from './shared';

export type AlertStatus = 'UNREAD' | 'READ' | 'DISMISSED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AlertListQueryParams extends ListQueryParams {
	clientId?: number;
	userId?: number;
	status?: AlertStatus;
	severity?: AlertSeverity;
	alertConfigurationId?: number;
	sortBy?: 'id' | 'status' | 'severity' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface Alert {
	id: number;
	clientId: number;
	userId: number;
	alertConfigurationId: number;
	evaluationId?: number | null;
	conversationId?: number | null;
	agentId?: number | null;

	message: string;
	severity: AlertSeverity;

	status: AlertStatus;
	readAt?: string | null;
	dismissedAt?: string | null;

	createdAt?: string;
	updatedAt?: string;
}

export interface AlertsStats {
	clientId: number;
	userId?: number;
	unread: number;
	total: number;
	byType?: Record<string, number>;
	bySeverity?: Record<AlertSeverity, number>;
}

export interface CreateAlertPayload {
	userId: number;
	alertConfigurationId: number;
	message: string;
	severity: AlertSeverity;
	evaluationId?: number;
	conversationId?: number;
	agentId?: number;
}
