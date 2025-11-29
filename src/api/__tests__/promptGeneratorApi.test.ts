import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import promptGeneratorApi from '../promptGeneratorApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { Prompt } from '~/models/PromptModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('promptGeneratorApi', () => {
	let api: ReturnType<typeof promptGeneratorApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = promptGeneratorApi();
	});

	describe('createPrompt', () => {
		it('should create a prompt successfully', async () => {
			const promptData: Partial<Prompt> = {
				name: 'Sales Prompt',
				generationInput: {
					agent_goal: 'Sell products',
					agent_role: 'Sales agent',
					key_messages: 'Key selling points',
					target_audience: 'Customers',
					communication_tone: 'Professional',
					financial_product_type: 'Loans',
				},
				generatedPrompt: 'Generated prompt text',
				status: 'ACTIVE',
			};
			const mockResponse: Prompt = {
				id: 1,
				name: 'Sales Prompt',
				generationInput: {
					agent_goal: 'Sell products',
					agent_role: 'Sales agent',
					key_messages: 'Key selling points',
					target_audience: 'Customers',
					communication_tone: 'Professional',
					financial_product_type: 'Loans',
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
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createPrompt(promptData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompts`,
				promptData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const promptData: Partial<Prompt> = {
				name: 'Test Prompt',
			};
			const error = createMockAxiosError('Validation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(api.createPrompt(promptData)).rejects.toThrow(
				'Validation failed'
			);
		});
	});

	describe('findAllPrompts', () => {
		it('should get all prompts without params', async () => {
			const mockResponse: Prompt[] = [
				{
					id: 1,
					name: 'Sales Prompt',
					generationInput: {
						agent_goal: 'Sell products',
						agent_role: 'Sales agent',
						key_messages: 'Key selling points',
						target_audience: 'Customers',
						communication_tone: 'Professional',
						financial_product_type: 'Loans',
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
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findAllPrompts();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/prompts`, {
				params: undefined,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should get all prompts with params', async () => {
			const params = { status: 'ACTIVE' as const, limit: 10 };
			const mockResponse: Prompt[] = [];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findAllPrompts(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/prompts`, {
				params,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findPrompt', () => {
		it('should get prompt by id', async () => {
			const promptId = '1';
			const mockResponse: Prompt = {
				id: 1,
				name: 'Sales Prompt',
				generationInput: {
					agent_goal: 'Sell products',
					agent_role: 'Sales agent',
					key_messages: 'Key selling points',
					target_audience: 'Customers',
					communication_tone: 'Professional',
					financial_product_type: 'Loans',
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
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findPrompt(promptId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompts/${promptId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when prompt not found', async () => {
			const promptId = '999';
			const error = createMockAxiosError('Prompt not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.findPrompt(promptId)).rejects.toThrow(
				'Prompt not found'
			);
		});
	});

	describe('updatePrompt', () => {
		it('should update a prompt successfully', async () => {
			const promptId = '1';
			const updateData: Partial<Prompt> = {
				name: 'Updated Sales Prompt',
				status: 'INACTIVE',
			};
			const mockResponse: Prompt = {
				id: 1,
				name: 'Updated Sales Prompt',
				generationInput: {
					agent_goal: 'Sell products',
					agent_role: 'Sales agent',
					key_messages: 'Key selling points',
					target_audience: 'Customers',
					communication_tone: 'Professional',
					financial_product_type: 'Loans',
				},
				generatedPrompt: 'Generated prompt text',
				status: 'INACTIVE',
				typeId: 1,
				userId: 1,
				clientId: 1,
				promptInstructionId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updatePrompt(promptId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompts/${promptId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deletePrompt', () => {
		it('should delete a prompt successfully', async () => {
			const promptId = '1';
			const mockResponse = { message: 'Prompt deleted successfully' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.deletePrompt(promptId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompts/${promptId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
