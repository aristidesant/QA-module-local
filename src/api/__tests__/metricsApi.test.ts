import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import { getLiveMetrics } from '../metricsApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { LiveMetricsResponse } from '~/models/LiveMetrics';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('getLiveMetrics', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	it('should get live metrics successfully', async () => {
		const contactGroupId = 1;
		const range = '1h';
		const mockResponse: LiveMetricsResponse = {
			contactGroupId: 1,
			name: 'Test Contact Group',
			queueStatus: 'active',
			isActive: true,
			kpis: {
				general: {
					totalRecords: 1000,
					contacts: 750,
					effectiveContacts: 500,
					noEffectiveContacts: 250,
					noContact: 200,
					dnc: 25,
					contactRate: '75.0%',
					effectivenessRate: '66.7%',
					noContactRate: '26.7%',
				},
				breakdowns: {
					ineffectiveReasons: [
						{
							label: 'No Answer',
							count: 200,
							percentage: '26.7%',
						},
						{
							label: 'Busy',
							count: 50,
							percentage: '6.7%',
						},
					],
					noContactReasons: [
						{
							label: 'Invalid Number',
							count: 150,
							percentage: '20.0%',
						},
					],
				},
				specifics: [
					{
						key: 'averageCallDuration',
						label: 'Average Call Duration',
						value: 180,
						meta: {
							conversationsMeasured: 500,
						},
					},
					{
						key: 'totalCallDuration',
						label: 'Total Call Duration',
						value: 135000,
					},
				],
			},
		};
		(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

		const result = await getLiveMetrics(contactGroupId, range);

		expect(axios.get).toHaveBeenCalledWith(
			`${TEST_API_URL}/live-metrics/contact-groups/${contactGroupId}`,
			{ params: { range } }
		);
		expect(result).toEqual(mockResponse);
	});

	it('should handle different range values', async () => {
		const contactGroupId = 2;
		const range = '24h';
		const mockResponse: LiveMetricsResponse = {
			contactGroupId: 2,
			name: 'Another Contact Group',
			queueStatus: 'active',
			isActive: true,
			kpis: {
				general: {
					totalRecords: 5000,
					contacts: 4800,
					effectiveContacts: 4500,
					noEffectiveContacts: 300,
					noContact: 200,
					dnc: 100,
					contactRate: '96.0%',
					effectivenessRate: '93.8%',
					noContactRate: '4.2%',
				},
				breakdowns: {
					ineffectiveReasons: [],
					noContactReasons: [],
				},
				specifics: [
					{
						key: 'averageCallDuration',
						label: 'Average Call Duration',
						value: 240,
					},
					{
						key: 'totalCallDuration',
						label: 'Total Call Duration',
						value: 1152000,
					},
				],
			},
		};
		(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

		const result = await getLiveMetrics(contactGroupId, range);

		expect(axios.get).toHaveBeenCalledWith(
			`${TEST_API_URL}/live-metrics/contact-groups/${contactGroupId}`,
			{ params: { range } }
		);
		expect(result).toEqual(mockResponse);
	});

	it('should throw error when request fails', async () => {
		const contactGroupId = 999;
		const range = '1h';
		const error = createMockAxiosError('Contact group not found', 404);
		(axios.get as Mock).mockRejectedValue(error);

		await expect(getLiveMetrics(contactGroupId, range)).rejects.toThrow(
			'Contact group not found'
		);
	});
});
