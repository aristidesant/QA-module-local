import type { HealthResponse } from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function fetchHealth(): Promise<HealthResponse> {
	const response = await qaHttpClient.get<HealthResponse>('/health');

	return response.data;
}
