import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import schedulerApi from '../schedulerApi';
import { resetAxiosMocks, createMockResponse } from './setup';
import type { Scheduler } from '~/models/SchedulerModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('schedulerApi', () => {
	let api: ReturnType<typeof schedulerApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = schedulerApi();
	});

	describe('getCampaignSchedules', () => {
		it('should get all schedules for a campaign', async () => {
			const campaignId = 1;
			const mockResponse: Scheduler[] = [
				{
					id: 1,
					name: 'Test Schedule',
					description: 'Test description',
					campaignId: 1,
					status: 'active',
					humanEquivalent: 5,
					callsPerHour: '10',
					estimatedCompletionDays: 7,
					totalWeekVolumes: 1000,
					totalWeeklyHours: '40',
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
					dayConfigs: [],
					scheduleContactGroups: [],
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getCampaignSchedules(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle string campaign ID', async () => {
			const campaignId = 'campaign-1';
			const mockResponse: Scheduler[] = [];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getCampaignSchedules(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createPredefinedSchedule', () => {
		it('should create a predefined schedule successfully', async () => {
			const campaignId = 1;
			const predefinedScheduleData = {
				name: 'Predefined Schedule',
				description: 'Predefined description',
				campaignId: 1,
			};
			const mockResponse: Scheduler = {
				id: 1,
				name: 'Predefined Schedule',
				description: 'Predefined description',
				campaignId: 1,
				status: 'draft',
				humanEquivalent: null,
				callsPerHour: null,
				estimatedCompletionDays: null,
				totalWeekVolumes: null,
				totalWeeklyHours: null,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				dayConfigs: [],
				scheduleContactGroups: [],
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createPredefinedSchedule(
				campaignId,
				predefinedScheduleData
			);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/predefined`,
				predefinedScheduleData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignActiveScheduler', () => {
		it('should get active scheduler for a campaign', async () => {
			const campaignId = 1;
			const mockResponse: Scheduler = {
				id: 1,
				name: 'Active Schedule',
				description: 'Active description',
				campaignId: 1,
				status: 'active',
				humanEquivalent: 5,
				callsPerHour: '10',
				estimatedCompletionDays: 7,
				totalWeekVolumes: 1000,
				totalWeeklyHours: '40',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				dayConfigs: [],
				scheduleContactGroups: [],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getCampaignActiveScheduler(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/active`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateContactGroupStatus', () => {
		it('should update contact group status successfully', async () => {
			const groupId = 1;
			const status = 'active';
			const mockResponse = { message: 'Status updated successfully' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updateContactGroupStatus(groupId, status);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/schedule-contact-groups/${groupId}/status`,
				{ status }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should handle different status values', async () => {
			const groupId = 2;
			const status = 'paused';
			const mockResponse = { message: 'Status updated successfully' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updateContactGroupStatus(groupId, status);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/schedule-contact-groups/${groupId}/status`,
				{ status }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('activateSchedule', () => {
		it('should activate schedule successfully', async () => {
			const campaignId = 1;
			const scheduleId = 2;
			const mockResponse = { message: 'Schedule activated successfully' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.activateSchedule(campaignId, scheduleId);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/activate`,
				{}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createSchedule', () => {
		it('should create a new schedule successfully', async () => {
			const campaignId = 1;
			const scheduleData: Partial<Scheduler> = {
				name: 'New Schedule',
				description: 'New description',
			};
			const mockResponse: Scheduler = {
				id: 1,
				name: 'New Schedule',
				description: 'New description',
				campaignId: 1,
				status: 'draft',
				humanEquivalent: null,
				callsPerHour: null,
				estimatedCompletionDays: null,
				totalWeekVolumes: null,
				totalWeeklyHours: null,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				dayConfigs: [],
				scheduleContactGroups: [],
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createSchedule(campaignId, scheduleData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules`,
				scheduleData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getScheduleById', () => {
		it('should get schedule by ID', async () => {
			const campaignId = 1;
			const scheduleId = 2;
			const mockResponse: Scheduler = {
				id: 2,
				name: 'Schedule 2',
				description: 'Description 2',
				campaignId: 1,
				status: 'active',
				humanEquivalent: 3,
				callsPerHour: '8',
				estimatedCompletionDays: 10,
				totalWeekVolumes: 800,
				totalWeeklyHours: '32',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				dayConfigs: [],
				scheduleContactGroups: [],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getScheduleById(campaignId, scheduleId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateSchedule', () => {
		it('should update schedule successfully', async () => {
			const campaignId = 1;
			const scheduleId = 2;
			const scheduleData: Partial<Scheduler> = {
				name: 'Updated Schedule',
				status: 'paused',
			};
			const mockResponse: Scheduler = {
				id: 2,
				name: 'Updated Schedule',
				description: 'Description 2',
				campaignId: 1,
				status: 'paused',
				humanEquivalent: 3,
				callsPerHour: '8',
				estimatedCompletionDays: 10,
				totalWeekVolumes: 800,
				totalWeeklyHours: '32',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				dayConfigs: [],
				scheduleContactGroups: [],
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updateSchedule(
				campaignId,
				scheduleId,
				scheduleData
			);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/with-day-configs`,
				scheduleData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteSchedule', () => {
		it('should delete schedule successfully', async () => {
			const campaignId = 1;
			const scheduleId = 2;
			const mockResponse = { message: 'Schedule deleted successfully' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.deleteSchedule(campaignId, scheduleId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getScheduleCapacity', () => {
		it('should get schedule capacity successfully', async () => {
			const campaignId = 1;
			const scheduleId = 2;
			const contactListSize = 1000;
			const mockResponse = {
				capacity: 500,
				estimatedDays: 5,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getScheduleCapacity(
				campaignId,
				scheduleId,
				contactListSize
			);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/capacity`,
				{
					params: {
						contactListSize,
					},
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deactivateSchedule', () => {
		it('should deactivate schedule successfully', async () => {
			const campaignId = 1;
			const scheduleId = 2;
			const mockResponse = { message: 'Schedule deactivated successfully' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.deactivateSchedule(campaignId, scheduleId);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/${scheduleId}/deactivate`,
				{}
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
