import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import dayConfigApi from '../dayConfigApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { DayConfig } from '~/models/SchedulerModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('dayConfigApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('getScheduleDayConfigs', () => {
		it('should get schedule day configs successfully', async () => {
			const campaignId = '1';
			const scheduleId = '1';
			const mockResponse: DayConfig[] = [
				{
					id: 1,
					scheduleId: 1,
					clientId: 1,
					userId: 1,
					dayOfWeek: 'monday',
					dayOrder: 1,
					isActive: true,
					dailyCallLimit: 100,
					startHour: '09:00:00',
					endHour: '17:00:00',
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
					hourConfigs: [],
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dayConfigApi();
			const result = await api.getScheduleDayConfigs(campaignId, scheduleId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/day-configs`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when fetch fails', async () => {
			const campaignId = '1';
			const scheduleId = '1';
			const error = createMockAxiosError('Fetch failed', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = dayConfigApi();
			await expect(
				api.getScheduleDayConfigs(campaignId, scheduleId)
			).rejects.toThrow('Fetch failed');
		});
	});

	describe('getDayConfigById', () => {
		it('should get day config by id successfully', async () => {
			const campaignId = '1';
			const dayConfigId = '1';
			const mockResponse: DayConfig = {
				id: 1,
				scheduleId: 1,
				clientId: 1,
				userId: 1,
				dayOfWeek: 'monday',
				dayOrder: 1,
				isActive: true,
				dailyCallLimit: 100,
				startHour: '09:00:00',
				endHour: '17:00:00',
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				hourConfigs: [],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dayConfigApi();
			const result = await api.getDayConfigById(campaignId, dayConfigId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/day-configs/${dayConfigId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('bulkUpdateDayConfigs', () => {
		it('should bulk update day configs successfully', async () => {
			const campaignId = '1';
			const dayConfigs: DayConfig[] = [
				{
					id: 1,
					scheduleId: 1,
					clientId: 1,
					userId: 1,
					dayOfWeek: 'monday',
					dayOrder: 1,
					isActive: true,
					dailyCallLimit: 100,
					startHour: '09:00:00',
					endHour: '17:00:00',
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
					hourConfigs: [],
				},
			];
			const mockResponse: DayConfig[] = dayConfigs;
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = dayConfigApi();
			const result = await api.bulkUpdateDayConfigs(campaignId, dayConfigs);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/day-configs/bulk-update`,
				dayConfigs
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when update fails', async () => {
			const campaignId = '1';
			const dayConfigs: DayConfig[] = [];
			const error = createMockAxiosError('Update failed', 400);
			(axios.patch as Mock).mockRejectedValue(error);

			const api = dayConfigApi();
			await expect(
				api.bulkUpdateDayConfigs(campaignId, dayConfigs)
			).rejects.toThrow('Update failed');
		});
	});
});
