import { useMutation, useQuery } from '@tanstack/react-query';

import {
	createCampaign,
	deleteCampaign,
	getConversationAudio,
	getCampaign,
	getCampaignConversations,
	getCampaigns,
	updateCampaign,
	uploadCampaignConversationAudio,
} from '~/api/qa/campaignsApi';
import type {
	CampaignListQueryParams,
	ConversationListQueryParams,
	CreateCampaignPayload,
	UpdateCampaignPayload,
	UploadAudioConversationPayload,
} from '~/models/qa';

export const campaignsQueryKey = ['qa', 'campaigns'] as const;

export const campaignsListQueryKey = (params?: CampaignListQueryParams) =>
	['qa', 'campaigns', 'list', params ?? {}] as const;

export const campaignQueryKey = (campaignId: number) =>
	['qa', 'campaigns', campaignId] as const;

export const campaignConversationsBaseQueryKey = (campaignId: number) =>
	['qa', 'campaigns', campaignId, 'conversations'] as const;

export const campaignConversationsQueryKey = (
	campaignId: number,
	params?: ConversationListQueryParams
) => [...campaignConversationsBaseQueryKey(campaignId), params ?? {}] as const;

export function useCampaignsQuery(params?: CampaignListQueryParams) {
	return useQuery({
		queryKey: campaignsListQueryKey(params),
		queryFn: () => getCampaigns(params),
	});
}

export function useCampaignQuery(campaignId: number) {
	return useQuery({
		enabled: Number.isFinite(campaignId),
		queryKey: campaignQueryKey(campaignId),
		queryFn: () => getCampaign(campaignId),
	});
}

export function useCampaignConversationsQuery(
	campaignId: number,
	params?: ConversationListQueryParams
) {
	return useQuery({
		enabled: Number.isFinite(campaignId),
		queryKey: campaignConversationsQueryKey(campaignId, params),
		queryFn: () => getCampaignConversations(campaignId, params),
	});
}

export function useCreateCampaignMutation() {
	return useMutation({
		mutationFn: (payload: CreateCampaignPayload) => createCampaign(payload),
	});
}

export function useUpdateCampaignMutation(campaignId: number) {
	return useMutation({
		mutationFn: (payload: UpdateCampaignPayload) =>
			updateCampaign(campaignId, payload),
	});
}

export function useDeleteCampaignMutation() {
	return useMutation({
		mutationFn: (campaignId: number) => deleteCampaign(campaignId),
	});
}

export function useUploadCampaignConversationAudioMutation(campaignId: number) {
	return useMutation({
		mutationFn: (payload: UploadAudioConversationPayload) =>
			uploadCampaignConversationAudio(campaignId, payload),
	});
}

export function useConversationAudioMutation() {
	return useMutation({
		mutationFn: (conversationId: number) =>
			getConversationAudio(conversationId),
	});
}
