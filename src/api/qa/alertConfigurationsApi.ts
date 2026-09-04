import type {
	AlertConfiguration,
	AlertConfigurationListQueryParams,
	CreateAlertConfigurationPayload,
	PaginatedResponse,
	UpdateAlertConfigurationPayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getAlertConfigurations(params?: AlertConfigurationListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<AlertConfiguration>>(
		'/alert-configurations',
		{ params }
	);
	return response.data;
}

export async function getAlertConfigurationDetail(configId: number) {
	const response = await qaHttpClient.get<AlertConfiguration>(
		`/alert-configurations/${configId}`
	);
	return response.data;
}

export async function createAlertConfiguration(payload: CreateAlertConfigurationPayload) {
	const response = await qaHttpClient.post<AlertConfiguration>(
		'/alert-configurations',
		payload
	);
	return response.data;
}

export async function updateAlertConfiguration(configId: number, payload: UpdateAlertConfigurationPayload) {
	const response = await qaHttpClient.patch<AlertConfiguration>(
		`/alert-configurations/${configId}`,
		payload
	);
	return response.data;
}

export async function deleteAlertConfiguration(configId: number) {
	const response = await qaHttpClient.delete<void>(
		`/alert-configurations/${configId}`
	);
	return response.data;
}
