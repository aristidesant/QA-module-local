import type {
	CreateMilestoneAchievementPayload,
	CreateMilestonePayload,
	Milestone,
	MilestoneAchievement,
	MilestoneListQueryParams,
	MilestoneWithAchievements,
	PaginatedResponse,
	UpdateMilestonePayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getMilestones(params?: MilestoneListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<Milestone>>(
		'/milestones',
		{ params }
	);
	return response.data;
}

export async function getMilestoneDetail(milestoneId: number) {
	const response = await qaHttpClient.get<MilestoneWithAchievements>(
		`/milestones/${milestoneId}`
	);
	return response.data;
}

export async function getMilestoneAchievements(milestoneId: number) {
	const response = await qaHttpClient.get<PaginatedResponse<MilestoneAchievement>>(
		`/milestones/${milestoneId}/achievements`
	);
	return response.data;
}

export async function createMilestone(payload: CreateMilestonePayload) {
	const response = await qaHttpClient.post<Milestone>('/milestones', payload);
	return response.data;
}

export async function updateMilestone(milestoneId: number, payload: UpdateMilestonePayload) {
	const response = await qaHttpClient.patch<Milestone>(
		`/milestones/${milestoneId}`,
		payload
	);
	return response.data;
}

export async function deleteMilestone(milestoneId: number) {
	const response = await qaHttpClient.delete<void>(`/milestones/${milestoneId}`);
	return response.data;
}

export async function createMilestoneAchievement(
	milestoneId: number,
	payload: CreateMilestoneAchievementPayload
) {
	const response = await qaHttpClient.post<MilestoneAchievement>(
		`/milestones/${milestoneId}/achievements`,
		payload
	);
	return response.data;
}
