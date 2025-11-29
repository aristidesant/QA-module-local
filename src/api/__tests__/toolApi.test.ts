import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import toolApi from '../toolApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type { ToolModel, AssignedToolModel } from '~/models/ToolModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('toolApi', () => {
	let api: ReturnType<typeof toolApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = toolApi();
	});

	describe('getAllTools', () => {
		it('should get all tools successfully', async () => {
			const mockResponse: ToolModel[] = [
				{
					id: 1,
					identifier: 'test-tool',
					prompt: 'Test prompt',
					name: 'Test Tool',
					description: 'Test description',
					categoryId: 1,
					category: {
						id: 1,
						name: 'Test Category',
						description: 'Test category description',
						icon: 'test-icon',
						userId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
					status: 'active',
					config: {
						id: 'config-1',
						accessInfo: {
							role: 'admin',
							isCreator: true,
							creatorName: 'Test User',
							creatorEmail: 'test@example.com',
						},
						toolConfig: {
							name: 'Test Config',
							type: 'api',
							apiSchema: {
								url: 'https://api.example.com',
								method: 'GET',
								requestHeaders: {},
								auth_connection: null,
								pathParamsSchema: {},
								requestBodySchema: {
									type: 'object',
									required: [],
									properties: {},
									description: 'Test schema',
								},
							},
							description: 'Test config description',
							dynamicVariables: {
								dynamicVariablePlaceholders: {},
							},
							responseTimeoutSecs: 30,
						},
					},
					clientId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getAllTools();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/tools`);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when request fails', async () => {
			const error = createMockAxiosError('Server error', 500);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.getAllTools()).rejects.toThrow('Server error');
		});
	});

	describe('getToolById', () => {
		it('should get tool by ID', async () => {
			const id = 1;
			const mockResponse: ToolModel = {
				id: 1,
				identifier: 'test-tool',
				prompt: 'Test prompt',
				name: 'Test Tool',
				description: 'Test description',
				categoryId: 1,
				category: {
					id: 1,
					name: 'Test Category',
					description: 'Test category description',
					icon: 'test-icon',
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
				status: 'active',
				config: {
					id: 'config-1',
					accessInfo: {
						role: 'admin',
						isCreator: true,
						creatorName: 'Test User',
						creatorEmail: 'test@example.com',
					},
					toolConfig: {
						name: 'Test Config',
						type: 'api',
						apiSchema: {
							url: 'https://api.example.com',
							method: 'GET',
							requestHeaders: {},
							auth_connection: null,
							pathParamsSchema: {},
							requestBodySchema: {
								type: 'object',
								required: [],
								properties: {},
								description: 'Test schema',
							},
						},
						description: 'Test config description',
						dynamicVariables: {
							dynamicVariablePlaceholders: {},
						},
						responseTimeoutSecs: 30,
					},
				},
				clientId: 1,
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getToolById(id);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/tools/${id}`);
			expect(result).toEqual(mockResponse);
		});

		it('should handle string ID', async () => {
			const id = 'tool-1';
			const mockResponse: ToolModel = {
				id: 1,
				identifier: 'test-tool',
				prompt: 'Test prompt',
				name: 'Test Tool',
				description: 'Test description',
				categoryId: 1,
				category: {
					id: 1,
					name: 'Test Category',
					description: 'Test category description',
					icon: 'test-icon',
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
				status: 'active',
				config: {
					id: 'config-1',
					accessInfo: {
						role: 'admin',
						isCreator: true,
						creatorName: 'Test User',
						creatorEmail: 'test@example.com',
					},
					toolConfig: {
						name: 'Test Config',
						type: 'api',
						apiSchema: {
							url: 'https://api.example.com',
							method: 'GET',
							requestHeaders: {},
							auth_connection: null,
							pathParamsSchema: {},
							requestBodySchema: {
								type: 'object',
								required: [],
								properties: {},
								description: 'Test schema',
							},
						},
						description: 'Test config description',
						dynamicVariables: {
							dynamicVariablePlaceholders: {},
						},
						responseTimeoutSecs: 30,
					},
				},
				clientId: 1,
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getToolById(id);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/tools/${id}`);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createTool', () => {
		it('should create a tool successfully', async () => {
			const data: Partial<ToolModel> = {
				name: 'New Tool',
				description: 'New tool description',
				categoryId: 1,
			};
			const mockResponse: ToolModel = {
				id: 1,
				identifier: 'new-tool',
				prompt: '',
				name: 'New Tool',
				description: 'New tool description',
				categoryId: 1,
				category: {
					id: 1,
					name: 'Test Category',
					description: 'Test category description',
					icon: 'test-icon',
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
				status: 'active',
				config: {
					id: 'config-1',
					accessInfo: {
						role: 'admin',
						isCreator: true,
						creatorName: 'Test User',
						creatorEmail: 'test@example.com',
					},
					toolConfig: {
						name: 'New Config',
						type: 'api',
						apiSchema: {
							url: 'https://api.example.com',
							method: 'GET',
							requestHeaders: {},
							auth_connection: null,
							pathParamsSchema: {},
							requestBodySchema: {
								type: 'object',
								required: [],
								properties: {},
								description: 'New schema',
							},
						},
						description: 'New config description',
						dynamicVariables: {
							dynamicVariablePlaceholders: {},
						},
						responseTimeoutSecs: 30,
					},
				},
				clientId: 1,
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createTool(data);

			expect(axios.post).toHaveBeenCalledWith(`${TEST_API_URL}/tools`, data);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateTool', () => {
		it('should update a tool successfully', async () => {
			const id = 1;
			const data: Partial<ToolModel> = {
				name: 'Updated Tool',
				status: 'inactive',
			};
			const mockResponse: ToolModel = {
				id: 1,
				identifier: 'updated-tool',
				prompt: 'Updated prompt',
				name: 'Updated Tool',
				description: 'Updated description',
				categoryId: 1,
				category: {
					id: 1,
					name: 'Test Category',
					description: 'Test category description',
					icon: 'test-icon',
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
				status: 'inactive',
				config: {
					id: 'config-1',
					accessInfo: {
						role: 'admin',
						isCreator: true,
						creatorName: 'Test User',
						creatorEmail: 'test@example.com',
					},
					toolConfig: {
						name: 'Updated Config',
						type: 'api',
						apiSchema: {
							url: 'https://api.example.com',
							method: 'GET',
							requestHeaders: {},
							auth_connection: null,
							pathParamsSchema: {},
							requestBodySchema: {
								type: 'object',
								required: [],
								properties: {},
								description: 'Updated schema',
							},
						},
						description: 'Updated config description',
						dynamicVariables: {
							dynamicVariablePlaceholders: {},
						},
						responseTimeoutSecs: 30,
					},
				},
				clientId: 1,
				userId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
				deletedAt: null,
			};
			(axios.put as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.updateTool(id, data);

			expect(axios.put).toHaveBeenCalledWith(
				`${TEST_API_URL}/tools/${id}`,
				data
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteTool', () => {
		it('should delete a tool successfully', async () => {
			const id = 1;
			const mockResponse = { message: 'Tool deleted successfully' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const result = await api.deleteTool(id);

			expect(axios.delete).toHaveBeenCalledWith(`${TEST_API_URL}/tools/${id}`);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createToolBulk', () => {
		it('should create tools in bulk successfully', async () => {
			const data: Partial<ToolModel>[] = [
				{
					name: 'Tool 1',
					description: 'Description 1',
					categoryId: 1,
				},
				{
					name: 'Tool 2',
					description: 'Description 2',
					categoryId: 1,
				},
			];
			const mockResponse: ToolModel[] = [
				{
					id: 1,
					identifier: 'tool-1',
					prompt: '',
					name: 'Tool 1',
					description: 'Description 1',
					categoryId: 1,
					category: {
						id: 1,
						name: 'Test Category',
						description: 'Test category description',
						icon: 'test-icon',
						userId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
					status: 'active',
					config: {
						id: 'config-1',
						accessInfo: {
							role: 'admin',
							isCreator: true,
							creatorName: 'Test User',
							creatorEmail: 'test@example.com',
						},
						toolConfig: {
							name: 'Config 1',
							type: 'api',
							apiSchema: {
								url: 'https://api.example.com',
								method: 'GET',
								requestHeaders: {},
								auth_connection: null,
								pathParamsSchema: {},
								requestBodySchema: {
									type: 'object',
									required: [],
									properties: {},
									description: 'Schema 1',
								},
							},
							description: 'Config description 1',
							dynamicVariables: {
								dynamicVariablePlaceholders: {},
							},
							responseTimeoutSecs: 30,
						},
					},
					clientId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.createToolBulk(data);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/tools/bulk`,
				data
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getToolsByCategory', () => {
		it('should get tools by category successfully', async () => {
			const categoryId = 1;
			const mockResponse: ToolModel[] = [
				{
					id: 1,
					identifier: 'category-tool',
					prompt: 'Category prompt',
					name: 'Category Tool',
					description: 'Category tool description',
					categoryId: 1,
					category: {
						id: 1,
						name: 'Test Category',
						description: 'Test category description',
						icon: 'test-icon',
						userId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
					status: 'active',
					config: {
						id: 'config-1',
						accessInfo: {
							role: 'admin',
							isCreator: true,
							creatorName: 'Test User',
							creatorEmail: 'test@example.com',
						},
						toolConfig: {
							name: 'Category Config',
							type: 'api',
							apiSchema: {
								url: 'https://api.example.com',
								method: 'GET',
								requestHeaders: {},
								auth_connection: null,
								pathParamsSchema: {},
								requestBodySchema: {
									type: 'object',
									required: [],
									properties: {},
									description: 'Category schema',
								},
							},
							description: 'Category config description',
							dynamicVariables: {
								dynamicVariablePlaceholders: {},
							},
							responseTimeoutSecs: 30,
						},
					},
					clientId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getToolsByCategory(categoryId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/tools/categories/${categoryId}/tools`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('assignToolsToAgent', () => {
		it('should assign tools to agent successfully', async () => {
			const agentId = 'agent-1';
			const toolIds = ['1', '2'];
			const mockResponse = { message: 'Tools assigned successfully' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.assignToolsToAgent(agentId, toolIds);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-tools/${agentId}/tools/assign`,
				{ toolIds }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('unassignToolsFromAgent', () => {
		it('should unassign tools from agent successfully', async () => {
			const agentId = 'agent-1';
			const toolIds = ['1', '2'];
			const mockResponse = { message: 'Tools unassigned successfully' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.unassignToolsFromAgent(agentId, toolIds);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-tools/${agentId}/tools/unassign`,
				{ toolIds }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getAssignedTools', () => {
		it('should get assigned tools for agent successfully', async () => {
			const agentId = 'agent-1';
			const mockResponse: AssignedToolModel[] = [
				{
					id: 1,
					agentId,
					toolId: 1,
					clientId: 1,
					userId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
					tool: {
						id: 1,
						identifier: 'assigned-tool',
						prompt: 'Assigned prompt',
						name: 'Assigned Tool',
						description: 'Assigned tool description',
						categoryId: 1,
						category: {
							id: 1,
							name: 'Test Category',
							description: 'Test category description',
							icon: 'test-icon',
							userId: 1,
							createdAt: '2023-01-01T00:00:00Z',
							updatedAt: '2023-01-01T00:00:00Z',
							deletedAt: null,
						},
						status: 'active',
						config: {
							id: 'config-1',
							accessInfo: {
								role: 'admin',
								isCreator: true,
								creatorName: 'Test User',
								creatorEmail: 'test@example.com',
							},
							toolConfig: {
								name: 'Assigned Config',
								type: 'api',
								apiSchema: {
									url: 'https://api.example.com',
									method: 'GET',
									requestHeaders: {},
									auth_connection: null,
									pathParamsSchema: {},
									requestBodySchema: {
										type: 'object',
										required: [],
										properties: {},
										description: 'Assigned schema',
									},
								},
								description: 'Assigned config description',
								dynamicVariables: {
									dynamicVariablePlaceholders: {},
								},
								responseTimeoutSecs: 30,
							},
						},
						clientId: 1,
						userId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						updatedAt: '2023-01-01T00:00:00Z',
						deletedAt: null,
					},
				},
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getAssignedTools(agentId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/agent-tools/agents/${agentId}/assignments`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
