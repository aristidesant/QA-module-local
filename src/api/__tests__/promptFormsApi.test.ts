import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import promptFormsApi from '../promptFormsApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { PromptForm } from '~/models/PromptFormModel';
import type { PromptType } from '~/models/PromptTypeModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('promptFormsApi', () => {
	let api: ReturnType<typeof promptFormsApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = promptFormsApi();
	});

	describe('createPromptForm', () => {
		it('should create a prompt form successfully', async () => {
			const promptFormData: Partial<PromptForm> = {
				name: 'Sales Prompt Form',
				typeId: 1,
			};
			const mockType: PromptType = {
				id: 1,
				name: 'Sales',
				description: 'Sales conversation prompts',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			const mockResponse: PromptForm = {
				id: 1,
				name: 'Sales Prompt Form',
				form: {} as any, // Mock form data
				typeId: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				type: mockType,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createPromptForm(promptFormData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-forms`,
				promptFormData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const promptFormData: Partial<PromptForm> = {
				name: 'Test Form',
			};
			const error = createMockAxiosError('Validation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			await expect(api.createPromptForm(promptFormData)).rejects.toThrow(
				'Validation failed'
			);
		});
	});

	describe('findAllPromptForms', () => {
		it('should get all prompt forms without params', async () => {
			const mockType: PromptType = {
				id: 1,
				name: 'Sales',
				description: 'Sales conversation prompts',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			const mockResponse: PromptForm[] = [
				{
					id: 1,
					name: 'Sales Prompt Form',
					form: {} as any,
					typeId: 1,
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
					type: mockType,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findAllPromptForms();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/prompt-forms`, {
				params: undefined,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should get all prompt forms with params', async () => {
			const params = { typeId: 1 };
			const mockResponse: PromptForm[] = [];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findAllPromptForms(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/prompt-forms`, {
				params,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findPromptForm', () => {
		it('should get prompt form by id', async () => {
			const promptFormId = '1';
			const mockType: PromptType = {
				id: 1,
				name: 'Sales',
				description: 'Sales conversation prompts',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			const mockResponse: PromptForm = {
				id: 1,
				name: 'Sales Prompt Form',
				form: {} as any,
				typeId: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				type: mockType,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.findPromptForm(promptFormId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-forms/${promptFormId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when form not found', async () => {
			const promptFormId = '999';
			const error = createMockAxiosError('Form not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.findPromptForm(promptFormId)).rejects.toThrow(
				'Form not found'
			);
		});
	});

	describe('updatePromptForm', () => {
		it('should update a prompt form successfully', async () => {
			const promptFormId = '1';
			const updateData: Partial<PromptForm> = {
				name: 'Updated Sales Prompt Form',
			};
			const mockType: PromptType = {
				id: 1,
				name: 'Sales',
				description: 'Sales conversation prompts',
				icon: 'sales-icon',
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			const mockResponse: PromptForm = {
				id: 1,
				name: 'Updated Sales Prompt Form',
				form: {} as any,
				typeId: 1,
				userId: 1,
				clientId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
				type: mockType,
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updatePromptForm(promptFormId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-forms/${promptFormId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deletePromptForm', () => {
		it('should delete a prompt form successfully', async () => {
			const promptFormId = '1';
			const mockResponse = { message: 'Form deleted successfully' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.deletePromptForm(promptFormId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/prompt-forms/${promptFormId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
