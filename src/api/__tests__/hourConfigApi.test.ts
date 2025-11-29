import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import hourConfigApi from '../hourConfigApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { HourConfig } from '~/models/SchedulerModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('hourConfigApi', () => {
	let api: ReturnType<typeof hourConfigApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = hourConfigApi();
	});

	describe('getDayConfigHourConfigs', () => {
		it('should get hour configs for a day config', async () => {
			const campaignId = 1;
			const dayConfigId = 2;
			const mockResponse: HourConfig[] = [
				{
					id: 1,
					clientId: 1,
					dayConfigId: 2,
					hour: '09:00:00',
					hourOrder: 9,
					capacity: '10',
					isActive: true,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
				{
					id: 2,
					clientId: 1,
					dayConfigId: 2,
					hour: '10:00:00',
					hourOrder: 10,
					capacity: '15',
					isActive: true,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getDayConfigHourConfigs(campaignId, dayConfigId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/day-configs/${dayConfigId}/hour-configs`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle string IDs', async () => {
			const campaignId = 'campaign-1';
			const dayConfigId = 'day-2';
			const mockResponse: HourConfig[] = [];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getDayConfigHourConfigs(campaignId, dayConfigId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/day-configs/${dayConfigId}/hour-configs`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when request fails', async () => {
			const campaignId = 1;
			const dayConfigId = 2;
			const error = createMockAxiosError('Day config not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(
				api.getDayConfigHourConfigs(campaignId, dayConfigId)
			).rejects.toThrow('Day config not found');
		});
	});

	describe('bulkUpdateHourConfigs', () => {
		it('should bulk update hour configs successfully', async () => {
			const campaignId = 1;
			const hourConfigs = [
				{ id: 1, capacity: 20, isActive: true },
				{ id: 2, capacity: 0, isActive: false },
			];
			const mockResponse: HourConfig[] = [
				{
					id: 1,
					clientId: 1,
					dayConfigId: 1,
					hour: '09:00:00',
					hourOrder: 9,
					capacity: '20',
					isActive: true,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
				{
					id: 2,
					clientId: 1,
					dayConfigId: 1,
					hour: '10:00:00',
					hourOrder: 10,
					capacity: '0',
					isActive: false,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.bulkUpdateHourConfigs(campaignId, hourConfigs);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/hour-configs/bulk-update`,
				{ hourConfigs }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle string campaign ID', async () => {
			const campaignId = 'campaign-1';
			const hourConfigs = [{ id: 1, capacity: 10, isActive: true }];
			const mockResponse: HourConfig[] = [];
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.bulkUpdateHourConfigs(campaignId, hourConfigs);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/hour-configs/bulk-update`,
				{ hourConfigs }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when bulk update fails', async () => {
			const campaignId = 1;
			const hourConfigs = [{ id: 1, capacity: 10, isActive: true }];
			const error = createMockAxiosError('Validation failed', 400);
			(axios.patch as Mock).mockRejectedValue(error);

			await expect(
				api.bulkUpdateHourConfigs(campaignId, hourConfigs)
			).rejects.toThrow('Validation failed');
		});
	});
});
