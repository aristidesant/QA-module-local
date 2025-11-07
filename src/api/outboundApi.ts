import axios from 'axios';
import { DEFAULT_API_URL } from './config';

export interface CleanOutboundQueuePayload {
	campaignId: number;
	contactGroupId: number;
}

const outboundApi = (_authHeader: Record<string, string> = {}) => {
	return {
		cleanOutboundQueue: async ({
			campaignId,
			contactGroupId,
		}: CleanOutboundQueuePayload) => {
			const response = await axios.delete(
				`${DEFAULT_API_URL}/outbound/queue/clean`,
				{
					data: { campaignId, contactGroupId },
				}
			);
			return response.data;
		},
	};
};

export default outboundApi;
