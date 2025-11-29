import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import promptVersionsApi from '../promptVersionsApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { PromptVersion } from '~/models/PromptVersionModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('promptVersionsApi', () => {
	let api: ReturnType<typeof promptVersionsApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = promptVersionsApi();
	});

	describe('getAllPromptVersions', () => {
		it('should get all prompt versions without params', async () => {
			const mockResponse: PromptVersion[] = [
				{
					id: 1,
					fullFields: {
						id: 1,
						name: 'Test Prompt',
						generationInput: {
							agent_goal: 'Test goal',
							agent_role: 'Test role',
							key_messages: 'Test messages',
							target_audience: 'Test audience',
							communication_tone: 'Test tone',
							financial_product_type: 'Test product',
						},
						generatedPrompt: 'Generated prompt text',
						status: 'ACTIVE',
						typeId: 1,
						userId: 1,
						clientId: 1,
						promptInstructionId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
					generatedPrompt: 'Version specific generated prompt',
					version: 1,
					promptId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getAllPromptVersions();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-versions`,
				{
					params: undefined,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should get all prompt versions with params', async () => {
			const params = { promptId: 1, status: 'ACTIVE' as const, limit: 10 };
			const mockResponse: PromptVersion[] = [];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getAllPromptVersions(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-versions`,
				{
					params,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when request fails', async () => {
			const params = { promptId: 1 };
			const error = createMockAxiosError('Server error', 500);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.getAllPromptVersions(params)).rejects.toThrow(
				'Server error'
			);
		});
	});

	describe('getPromptVersionById', () => {
		it('should get prompt version by id', async () => {
			const versionId = '1';
			const mockResponse: PromptVersion = {
				id: 1,
				fullFields: {
					id: 1,
					name: 'Test Prompt',
					generationInput: {
						agent_goal: 'Test goal',
						agent_role: 'Test role',
						key_messages: 'Test messages',
						target_audience: 'Test audience',
						communication_tone: 'Test tone',
						financial_product_type: 'Test product',
					},
					generatedPrompt: 'Generated prompt text',
					status: 'ACTIVE',
					typeId: 1,
					userId: 1,
					clientId: 1,
					promptInstructionId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
				generatedPrompt: 'Version specific generated prompt',
				version: 1,
				promptId: 1,
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getPromptVersionById(versionId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-versions/${versionId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when version not found', async () => {
			const versionId = '999';
			const error = createMockAxiosError('Version not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.getPromptVersionById(versionId)).rejects.toThrow(
				'Version not found'
			);
		});
	});
});
