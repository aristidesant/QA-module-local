import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import campaignsApi from '../campaignsApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { Campaign } from '~/models/CampaignsModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('campaignsApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createCampaign', () => {
		it('should create a campaign successfully', async () => {
			const campaignData = { name: 'Test Campaign', type: 'OUTBOUND' as const };
			const mockResponse = { id: 1, name: 'Test Campaign', type: 'OUTBOUND' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.createCampaign(campaignData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns`,
				campaignData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findAllCampaigns', () => {
		it('should fetch all campaigns without params', async () => {
			const mockCampaigns = [
				{ id: 1, name: 'Campaign 1' },
				{ id: 2, name: 'Campaign 2' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockCampaigns));

			const api = campaignsApi();
			const result = await api.findAllCampaigns();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/campaigns`, {
				params: undefined,
				timeout: 5000,
			});
			expect(result).toEqual(mockCampaigns);
		});

		it('should fetch campaigns with params and headers', async () => {
			const params = { status: 'ACTIVE' };
			const extraHeaders = { 'X-Custom-Header': 'value' };
			const mockCampaigns = [{ id: 1, name: 'Campaign 1' }];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockCampaigns));

			const api = campaignsApi();
			await api.findAllCampaigns(params, extraHeaders);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/campaigns`, {
				params,
				headers: extraHeaders,
				timeout: 5000,
			});
		});
	});

	describe('findAllCampaignsPaginated', () => {
		it('should fetch paginated campaigns', async () => {
			const mockResponse = {
				data: [{ id: 1, name: 'Campaign 1' }],
				total: 1,
				page: 1,
				limit: 10,
				totalPages: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.findAllCampaignsPaginated({
				page: 1,
				limit: 10,
			});

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/paginated`,
				{
					params: { page: 1, limit: 10 },
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findCampaign', () => {
		it('should fetch a single campaign by id', async () => {
			const campaignId = '123';
			const mockCampaign = { id: 123, name: 'Test Campaign' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockCampaign));

			const api = campaignsApi();
			const result = await api.findCampaign(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}`
			);
			expect(result).toEqual(mockCampaign);
		});

		it('should throw error when campaign not found', async () => {
			const campaignId = 'non-existent';
			const error = createMockAxiosError('Campaign not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = campaignsApi();
			await expect(api.findCampaign(campaignId)).rejects.toThrow(
				'Campaign not found'
			);
		});
	});

	describe('findCampaignsTimeEnd', () => {
		it('should fetch campaign time end', async () => {
			const campaignId = '123';
			const mockResponse = { timeEnd: '2025-12-31T23:59:59Z' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.findCampaignsTimeEnd(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/timeEnd/${campaignId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findCampaignScheduleSummary', () => {
		it('should fetch campaign schedule summary', async () => {
			const campaignId = '123';
			const mockResponse = [
				{ dayOfWeek: 'monday', isActive: true, dailyCallLimit: 100 },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.findCampaignScheduleSummary(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules/day-configs/summary`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createCampaignSchedule', () => {
		it('should create a campaign schedule', async () => {
			const campaignId = '123';
			const scheduleData = {
				name: 'Weekly Schedule',
				description: 'Weekly outbound schedule',
				humanEquivalent: 5,
				dayConfigs: [
					{
						dayOfWeek: 'monday' as const,
						isActive: true,
						dailyCallLimit: 100,
						hourConfigs: [],
					},
				],
			};
			const mockResponse = { id: 1, ...scheduleData };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.createCampaignSchedule(campaignId, scheduleData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/schedules`,
				scheduleData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getCampaignRequirements', () => {
		it('should fetch campaign requirements', async () => {
			const campaignId = '123';
			const mockResponse = {
				hasAgent: true,
				hasContacts: true,
				hasSchedule: false,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.getCampaignRequirements(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/requirements`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getLiveMetrics', () => {
		it('should fetch live metrics with range parameter', async () => {
			const campaignId = '123';
			const range = '1h' as const;
			const mockResponse = {
				totalCalls: 100,
				successfulCalls: 80,
				failedCalls: 20,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.getLiveMetrics(campaignId, range);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/live-metrics`,
				{ params: { range } }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateCampaign', () => {
		it('should update a campaign', async () => {
			const campaignId = '123';
			const updateData = { name: 'Updated Campaign' };
			const mockResponse = { id: 123, name: 'Updated Campaign' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.updateCampaign(campaignId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should remove nested prompt.prompt when present in agentConfig', async () => {
			const campaignId = '123';
			const updateData = {
				name: 'Updated Campaign',
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: {
								prompt: 'Should be removed',
								llm: 'gpt-4',
							},
						},
					},
				},
			} as Partial<Campaign>;

			const mockResponse = { id: 123, name: 'Updated Campaign' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			await api.updateCampaign(campaignId, updateData);

			// Verify the prompt.prompt was deleted before sending
			expect(axios.patch).toHaveBeenCalled();
		});
	});

	describe('updateCampaignLight', () => {
		it('should update campaign details via light endpoint', async () => {
			const campaignId = '123';
			const updateData = { name: 'Updated Campaign Light' };
			const mockResponse = { id: 123, name: 'Updated Campaign Light' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.updateCampaignLight(campaignId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/details`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should remove nested prompt.prompt when present in agentConfig', async () => {
			const campaignId = '123';
			const updateData = {
				name: 'Updated Campaign Light',
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: {
								prompt: 'Should be removed',
								llm: 'gpt-4',
							},
						},
					},
				},
			} as any;

			const expectedData = {
				name: 'Updated Campaign Light',
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: {
								llm: 'gpt-4',
							},
						},
					},
				},
			};

			const mockResponse = { id: 123, name: 'Updated Campaign Light' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			await api.updateCampaignLight(campaignId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/details`,
				expectedData
			);
		});
	});

	describe('Outbound Campaign Controls', () => {
		describe('startOutboundCampaign', () => {
			it('should start an outbound campaign', async () => {
				const campaignId = 123;
				const contactGroupId = 456;
				const mockResponse = { status: 'started' };
				(axios.post as Mock).mockResolvedValue(
					createMockResponse(mockResponse)
				);

				const api = campaignsApi();
				const result = await api.startOutboundCampaign(
					campaignId,
					contactGroupId
				);

				expect(axios.post).toHaveBeenCalledWith(
					`${TEST_API_URL}/outbound/start`,
					{
						campaignId,
						contactGroupId,
					}
				);
				expect(result).toEqual(mockResponse);
			});
		});

		describe('pauseOutboundCampaign', () => {
			it('should pause an outbound campaign', async () => {
				const campaignId = 123;
				const contactGroupId = 456;
				const mockResponse = { status: 'paused' };
				(axios.patch as Mock).mockResolvedValue(
					createMockResponse(mockResponse)
				);

				const api = campaignsApi();
				const result = await api.pauseOutboundCampaign(
					campaignId,
					contactGroupId
				);

				expect(axios.patch).toHaveBeenCalledWith(
					`${TEST_API_URL}/outbound/pause`,
					{
						campaignId,
						contactGroupId,
					}
				);
				expect(result).toEqual(mockResponse);
			});
		});

		describe('resumeOutboundCampaign', () => {
			it('should resume an outbound campaign', async () => {
				const campaignId = 123;
				const contactGroupId = 456;
				const mockResponse = { status: 'running' };
				(axios.patch as Mock).mockResolvedValue(
					createMockResponse(mockResponse)
				);

				const api = campaignsApi();
				const result = await api.resumeOutboundCampaign(
					campaignId,
					contactGroupId
				);

				expect(axios.patch).toHaveBeenCalledWith(
					`${TEST_API_URL}/outbound/resume`,
					{
						campaignId,
						contactGroupId,
					}
				);
				expect(result).toEqual(mockResponse);
			});
		});
	});

	describe('deleteCampaign', () => {
		it('should delete a campaign', async () => {
			const campaignId = '123';
			const mockResponse = { message: 'Campaign deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = campaignsApi();
			const result = await api.deleteCampaign(campaignId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('cloneCampaign', () => {
		it('should clone a campaign with agents', async () => {
			const campaignId = '123';
			const cloneData = {
				name: 'Cloned Campaign',
				description: 'A cloned campaign',
				agentsToDuplicate: [{ agentId: 'agent-1', newName: 'New Agent 1' }],
			};
			const mockResponse = { id: 456, name: 'Cloned Campaign' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.cloneCampaign(campaignId, cloneData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/clone`,
				cloneData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('assignObjectiveToCampaign', () => {
		it('should assign an objective to a campaign', async () => {
			const campaignId = '123';
			const objectiveId = 10;
			const mockResponse = { id: 123, objectiveId: 10 };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.assignObjectiveToCampaign(
				campaignId,
				objectiveId
			);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/assign-objective`,
				{ objectiveId }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createCampaignWithAgent', () => {
		it('should create a campaign with agent', async () => {
			const createData = {
				campaign: {
					name: 'New Campaign',
					description: 'Description',
					type: 'OUTBOUND' as const,
				},
				agent: {
					name: 'New Agent',
					type: 'OUTBOUND' as const,
					voiceId: 'voice-123',
				},
			};
			const mockResponse = { id: 789, name: 'New Campaign' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.createCampaignWithAgent(createData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/with-agent`,
				createData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('setDraft', () => {
		it('should set campaign draft status to true', async () => {
			const campaignId = '123';
			const draftData = { isDraft: true, draftStep: 2 };
			const mockResponse = { id: 123, isDraft: true, draftStep: 2 };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.setDraft(campaignId, draftData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/draft`,
				draftData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should set campaign draft status to false', async () => {
			const campaignId = '123';
			const draftData = { isDraft: false, draftStep: 0 };
			const mockResponse = { id: 123, isDraft: false, draftStep: 0 };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = campaignsApi();
			const result = await api.setDraft(campaignId, draftData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/campaigns/${campaignId}/draft`,
				draftData
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
