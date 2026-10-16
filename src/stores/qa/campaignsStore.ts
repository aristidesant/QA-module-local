import { create } from 'zustand';
import type {
	CampaignCallSource,
	UploadedRecording,
} from '~/modules/qa/campaigns/CallSourceTab/callSource.types';
import type { Campaign } from '~/views/Campaigns/types';

export interface CampaignsState {
	/** Campaigns created from the New campaign page, newest first. */
	created: Campaign[];
	/** FTP source saved per campaign id, for created and existing campaigns alike. */
	callSources: Record<string, CampaignCallSource>;
	/** Files sent through Manual upload per campaign id, oldest first. */
	uploads: Record<string, UploadedRecording[]>;
	addCampaign: (campaign: Campaign) => void;
	setCallSource: (campaignId: string, source: CampaignCallSource) => void;
	addUploads: (campaignId: string, recordings: UploadedRecording[]) => void;
	markUploaded: (campaignId: string, ids: string[]) => void;
}

export const useCampaignsStore = create<CampaignsState>((set) => ({
	created: [],
	callSources: {},
	uploads: {},
	addCampaign: (campaign) =>
		set((state) => ({ created: [campaign, ...state.created] })),
	setCallSource: (campaignId, source) =>
		set((state) => ({
			callSources: { ...state.callSources, [campaignId]: source },
		})),
	addUploads: (campaignId, recordings) =>
		set((state) => ({
			uploads: {
				...state.uploads,
				[campaignId]: [...(state.uploads[campaignId] ?? []), ...recordings],
			},
		})),
	markUploaded: (campaignId, ids) =>
		set((state) => ({
			uploads: {
				...state.uploads,
				[campaignId]: (state.uploads[campaignId] ?? []).map((recording) =>
					ids.includes(recording.id)
						? { ...recording, status: 'UPLOADED' }
						: recording
				),
			},
		})),
}));
