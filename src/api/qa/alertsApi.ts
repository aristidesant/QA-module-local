import type {
	Alert,
	AlertListQueryParams,
	AlertsStats,
	CreateAlertPayload,
	PaginatedResponse,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getAlerts(params?: AlertListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<Alert>>(
		'/alerts',
		{ params }
	);
	return response.data;
}

export async function getAlertStats(userId?: number) {
	const response = await qaHttpClient.get<AlertsStats>(
		'/alerts/stats',
		{ params: userId ? { userId } : {} }
	);
	return response.data;
}

export async function markAlertAsRead(alertId: number) {
	const response = await qaHttpClient.patch<Alert>(
		`/alerts/${alertId}/read`,
		{}
	);
	return response.data;
}

export async function markAlertAsDismissed(alertId: number) {
	const response = await qaHttpClient.patch<Alert>(
		`/alerts/${alertId}/dismiss`,
		{}
	);
	return response.data;
}

export async function bulkMarkAlertsAsRead(alertIds: number[]) {
	const response = await qaHttpClient.patch<{ count: number }>(
		'/alerts/bulk-read',
		{ alertIds }
	);
	return response.data;
}

export async function createAlert(payload: CreateAlertPayload) {
	const response = await qaHttpClient.post<Alert>(
		'/alerts',
		payload
	);
	return response.data;
}
