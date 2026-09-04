import type {
	CreateLeaderboardConfigurationPayload,
	LeaderboardConfiguration,
	LeaderboardConfigurationListQueryParams,
	LeaderboardPosition,
	LeaderboardWithPositions,
	PaginatedResponse,
	UpdateLeaderboardConfigurationPayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getLeaderboardConfigurations(params?: LeaderboardConfigurationListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<LeaderboardConfiguration>>(
		'/leaderboards',
		{ params }
	);
	return response.data;
}

export async function getLeaderboardConfiguration(supervisorId: number) {
	const response = await qaHttpClient.get<LeaderboardConfiguration>(
		`/leaderboards/${supervisorId}`
	);
	return response.data;
}

export async function getLeaderboardPositions(supervisorId: number) {
	const response = await qaHttpClient.get<LeaderboardWithPositions>(
		`/leaderboards/${supervisorId}/positions`
	);
	return response.data;
}

export async function createLeaderboardConfiguration(payload: CreateLeaderboardConfigurationPayload) {
	const response = await qaHttpClient.post<LeaderboardConfiguration>(
		'/leaderboards',
		payload
	);
	return response.data;
}

export async function updateLeaderboardConfiguration(
	id: number,
	payload: UpdateLeaderboardConfigurationPayload
) {
	const response = await qaHttpClient.patch<LeaderboardConfiguration>(
		`/leaderboards/${id}`,
		payload
	);
	return response.data;
}
