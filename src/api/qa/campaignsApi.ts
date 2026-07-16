import type {
	Campaign,
	CampaignListQueryParams,
	Conversation,
	ConversationListQueryParams,
	CreateCampaignPayload,
	PaginatedResponse,
	UpdateCampaignPayload,
	UploadAudioConversationPayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

function toCampaignListParams(params?: CampaignListQueryParams) {
	return {
		pagination: params?.pagination,
		limit: params?.limit,
		offset: params?.offset,
		q: params?.q || undefined,
		status: params?.status,
		sortBy: params?.sortBy,
		orderBy: params?.orderBy,
	};
}

function toConversationListParams(params?: ConversationListQueryParams) {
	return {
		pagination: params?.pagination,
		limit: params?.limit,
		offset: params?.offset,
		q: params?.q || undefined,
		externalRef: params?.externalRef || undefined,
		sortBy: params?.sortBy,
		orderBy: params?.orderBy,
	};
}

export async function getCampaigns(params?: CampaignListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<Campaign>>(
		'/campaigns',
		{
			params: toCampaignListParams(params),
		}
	);

	return response.data;
}

export async function getCampaign(campaignId: number) {
	const response = await qaHttpClient.get<Campaign>(`/campaigns/${campaignId}`);

	return response.data;
}

export async function createCampaign(payload: CreateCampaignPayload) {
	const response = await qaHttpClient.post<Campaign>('/campaigns', payload);

	return response.data;
}

export async function updateCampaign(
	campaignId: number,
	payload: UpdateCampaignPayload
) {
	const response = await qaHttpClient.patch<Campaign>(
		`/campaigns/${campaignId}`,
		payload
	);

	return response.data;
}

export async function deleteCampaign(campaignId: number) {
	const response = await qaHttpClient.delete<{ message: string }>(
		`/campaigns/${campaignId}`
	);

	return response.data;
}

export async function getCampaignConversations(
	campaignId: number,
	params?: ConversationListQueryParams
) {
	const response = await qaHttpClient.get<PaginatedResponse<Conversation>>(
		`/campaigns/${campaignId}/conversations`,
		{
			params: toConversationListParams(params),
		}
	);

	return response.data;
}

export async function uploadCampaignConversationAudio(
	campaignId: number,
	payload: UploadAudioConversationPayload
) {
	const formData = new FormData();

	formData.append('file', payload.file);

	if (payload.externalRef) {
		formData.append('externalRef', payload.externalRef);
	}

	if (payload.source) {
		formData.append('source', payload.source);
	}

	if (payload.sourceMetadata) {
		formData.append('sourceMetadata', JSON.stringify(payload.sourceMetadata));
	}

	const response = await qaHttpClient.post<Conversation>(
		`/campaigns/${campaignId}/conversations/audio`,
		formData
	);

	return response.data;
}

export async function getConversationAudio(conversationId: number) {
	const response = await qaHttpClient.get<Blob>(
		`/conversations/${conversationId}/audio`,
		{
			responseType: 'blob',
		}
	);

	return response.data;
}
