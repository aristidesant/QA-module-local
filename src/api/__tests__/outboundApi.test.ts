import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import outboundApi from '../outboundApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { CleanOutboundQueuePayload } from '../outboundApi';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('outboundApi', () => {
	let api: ReturnType<typeof outboundApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = outboundApi();
	});

	describe('cleanOutboundQueue', () => {
		it('should clean outbound queue successfully', async () => {
			const payload: CleanOutboundQueuePayload = {
				campaignId: 1,
				contactGroupId: 2,
			};
			const mockResponse = {
				cleaned: 150,
				message: 'Outbound queue cleaned successfully',
			};
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.cleanOutboundQueue(payload);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/outbound/queue/clean`,
				{
					data: { campaignId: 1, contactGroupId: 2 },
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle different campaign and contact group IDs', async () => {
			const payload: CleanOutboundQueuePayload = {
				campaignId: 100,
				contactGroupId: 200,
			};
			const mockResponse = {
				cleaned: 0,
				message: 'No items to clean',
			};
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.cleanOutboundQueue(payload);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/outbound/queue/clean`,
				{
					data: { campaignId: 100, contactGroupId: 200 },
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when clean operation fails', async () => {
			const payload: CleanOutboundQueuePayload = {
				campaignId: 1,
				contactGroupId: 2,
			};
			const error = createMockAxiosError('Campaign not found', 404);
			(axios.delete as Mock).mockRejectedValue(error);

			await expect(api.cleanOutboundQueue(payload)).rejects.toThrow(
				'Campaign not found'
			);
		});
	});
});
