import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import contactGroupApi from '../contactGroupApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type ContactGroup from '~/models/ContactGroup';
import type { PaginatedResponse } from '~/models/CampaignsModel';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('contactGroupApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createContactGroup', () => {
		it('should create a contact group successfully', async () => {
			const mockData = { name: 'Test Group', campaignId: 1 };
			const mockResponse: ContactGroup = {
				id: 1,
				name: 'Test Group',
				description: 'Test Description',
				campaignId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				scheduleId: 1,
				queueStatus: 'active',
				isActive: true,
				contactCount: 0,
				expirationDate: '2023-12-31T00:00:00Z',
				maxCallsPerContact: 3,
				maxCallsPerList: 100,
				humanEquivalent: 1,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupApi();
			const result = await api.createContactGroup(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-groups`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when create fails', async () => {
			const mockData = { name: 'Test Group', campaignId: 1 };
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = contactGroupApi();
			await expect(api.createContactGroup(mockData)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('findAllContactGroups', () => {
		it('should fetch all contact groups without params', async () => {
			const mockResponse: PaginatedResponse<ContactGroup> = {
				data: [
					{
						id: 1,
						name: 'Test Group',
						description: 'Test Description',
						campaignId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						scheduleId: 1,
						queueStatus: 'active',
						isActive: true,
						contactCount: 0,
						expirationDate: '2023-12-31T00:00:00Z',
						maxCallsPerContact: 3,
						maxCallsPerList: 100,
						humanEquivalent: 1,
					},
				],
				total: 1,
				limit: 10,
				offset: 0,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupApi();
			const result = await api.findAllContactGroups();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/contact-groups`, {
				params: undefined,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should fetch contact groups with params', async () => {
			const params = { campaignId: 1 };
			const mockResponse: PaginatedResponse<ContactGroup> = {
				data: [
					{
						id: 1,
						name: 'Test Group',
						description: 'Test Description',
						campaignId: 1,
						createdAt: '2023-01-01T00:00:00Z',
						scheduleId: 1,
						queueStatus: 'active',
						isActive: true,
						contactCount: 0,
						expirationDate: '2023-12-31T00:00:00Z',
						maxCallsPerContact: 3,
						maxCallsPerList: 100,
						humanEquivalent: 1,
					},
				],
				total: 1,
				limit: 10,
				offset: 0,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupApi();
			const result = await api.findAllContactGroups(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/contact-groups`, {
				params,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findContactGroup', () => {
		it('should fetch a contact group by id', async () => {
			const id = 1;
			const mockResponse: ContactGroup = {
				id: 1,
				name: 'Test Group',
				description: 'Test Description',
				campaignId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				scheduleId: 1,
				queueStatus: 'active',
				isActive: true,
				contactCount: 0,
				expirationDate: '2023-12-31T00:00:00Z',
				maxCallsPerContact: 3,
				maxCallsPerList: 100,
				humanEquivalent: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupApi();
			const result = await api.findContactGroup(id);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-groups/${id}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when group not found', async () => {
			const id = 999;
			const error = createMockAxiosError('Group not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = contactGroupApi();
			await expect(api.findContactGroup(id)).rejects.toThrow('Group not found');
		});
	});

	describe('updateContactGroup', () => {
		it('should update a contact group successfully', async () => {
			const id = 1;
			const updateData = { name: 'Updated Group' };
			const mockResponse: ContactGroup = {
				id: 1,
				name: 'Updated Group',
				description: 'Test Description',
				campaignId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				scheduleId: 1,
				queueStatus: 'active',
				isActive: true,
				contactCount: 0,
				expirationDate: '2023-12-31T00:00:00Z',
				maxCallsPerContact: 3,
				maxCallsPerList: 100,
				humanEquivalent: 1,
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupApi();
			const result = await api.updateContactGroup(id, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-groups/${id}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteContactGroup', () => {
		it('should delete a contact group successfully', async () => {
			const id = 1;
			const mockResponse = { message: 'Deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = contactGroupApi();
			const result = await api.deleteContactGroup(id);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-groups/${id}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('addContactToGroup', () => {
		it('should add contact to group successfully', async () => {
			const id = 1;
			const contactId = 2;
			const mockResponse = { success: true };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupApi();
			const result = await api.addContactToGroup(id, contactId);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-groups/${id}/contacts`,
				{ contactId }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('removeContactFromGroup', () => {
		it('should remove contact from group successfully', async () => {
			const id = 1;
			const contactId = 2;
			const mockResponse = { success: true };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = contactGroupApi();
			const result = await api.removeContactFromGroup(id, contactId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-groups/${id}/contacts/${contactId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('addContactsToGroupBulk', () => {
		it('should add contacts to group bulk successfully', async () => {
			const id = 1;
			const contactIds = [2, 3, 4];
			const mockResponse = { success: true };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupApi();
			const result = await api.addContactsToGroupBulk(id, contactIds);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-groups/${id}/contacts/bulk`,
				{ contactIds }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('toggleContactGroupStatus', () => {
		it('should toggle contact group status successfully', async () => {
			const id = 1;
			const isActive = false;
			const mockResponse: ContactGroup = {
				id: 1,
				name: 'Test Group',
				description: 'Test Description',
				campaignId: 1,
				createdAt: '2023-01-01T00:00:00Z',
				scheduleId: 1,
				queueStatus: 'inactive',
				isActive: false,
				contactCount: 0,
				expirationDate: '2023-12-31T00:00:00Z',
				maxCallsPerContact: 3,
				maxCallsPerList: 100,
				humanEquivalent: 1,
			};
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupApi();
			const result = await api.toggleContactGroupStatus(id, isActive);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-groups/${id}`,
				{ isActive }
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
