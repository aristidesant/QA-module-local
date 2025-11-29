import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import contactsApi from '../contactsApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('contactsApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createContact', () => {
		it('should create a contact successfully', async () => {
			const contactData = {
				firstName: 'John',
				lastName: 'Doe',
				emails: ['john@example.com'],
				phones: ['+1234567890'],
			};
			const mockResponse = { id: 1, ...contactData };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactsApi();
			const result = await api.createContact(contactData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts`,
				contactData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findAllContacts', () => {
		it('should fetch all contacts without params', async () => {
			const mockContacts = [
				{ id: 1, name: 'Contact 1' },
				{ id: 2, name: 'Contact 2' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockContacts));

			const api = contactsApi();
			const result = await api.findAllContacts();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/contacts`, {
				params: undefined,
				timeout: 5000,
			});
			expect(result).toEqual(mockContacts);
		});

		it('should fetch contacts with params', async () => {
			const params = { status: 'ACTIVE', page: 1 };
			const mockContacts = [{ id: 1, name: 'Contact 1' }];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockContacts));

			const api = contactsApi();
			await api.findAllContacts(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/contacts`, {
				params,
				timeout: 5000,
			});
		});
	});

	describe('findContact', () => {
		it('should fetch a single contact by id', async () => {
			const contactId = '123';
			const mockContact = { id: 123, name: 'John Doe' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockContact));

			const api = contactsApi();
			const result = await api.findContact(contactId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/${contactId}`
			);
			expect(result).toEqual(mockContact);
		});

		it('should throw error when contact not found', async () => {
			const contactId = 'non-existent';
			const error = createMockAxiosError('Contact not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = contactsApi();
			await expect(api.findContact(contactId)).rejects.toThrow(
				'Contact not found'
			);
		});
	});

	describe('findContactGroupContacts', () => {
		it('should fetch contacts in a contact group', async () => {
			const contactGroupId = 1;
			const mockResponse = {
				data: [{ id: 1, name: 'Contact 1' }],
				total: 1,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactsApi();
			const result = await api.findContactGroupContacts(contactGroupId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/contact-group/${contactGroupId}`,
				{ params: undefined }
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch contacts with filters', async () => {
			const contactGroupId = 1;
			const params = { limit: 10, offset: 0, status: 'ACTIVE' };
			const mockResponse = { data: [], total: 0 };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactsApi();
			await api.findContactGroupContacts(contactGroupId, params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/contact-group/${contactGroupId}`,
				{ params }
			);
		});
	});

	describe('findContactGroupContactsWithPhoneValidationErrors', () => {
		it('should fetch contacts with phone validation errors', async () => {
			const contactGroupId = 1;
			const mockContacts = [
				{ id: 1, name: 'Contact with error', phoneNumbers: [] },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockContacts));

			const api = contactsApi();
			const result =
				await api.findContactGroupContactsWithPhoneValidationErrors(
					contactGroupId
				);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/contact-group/${contactGroupId}/phone-numbers/with-validation-errors`
			);
			expect(result).toEqual(mockContacts);
		});
	});

	describe('exportContactGroupContactsWithPhoneValidationErrors', () => {
		it('should export contacts with validation errors', async () => {
			const contactGroupId = 1;
			const mockUrl = 'https://storage.example.com/export.csv';
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockUrl));

			const api = contactsApi();
			const result =
				await api.exportContactGroupContactsWithPhoneValidationErrors(
					contactGroupId
				);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/contact-group/${contactGroupId}/phone-numbers/with-validation-errors/export`
			);
			expect(result).toEqual(mockUrl);
		});
	});

	describe('findContactSummaryGroups', () => {
		it('should fetch contact summary by campaign', async () => {
			const campaignId = 1;
			const mockSummary = {
				statusBreakdown: [
					{ status: 'ACTIVE', count: 50 },
					{ status: 'INACTIVE', count: 10 },
				],
				totalContacts: 60,
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockSummary));

			const api = contactsApi();
			const result = await api.findContactSummaryGroups(campaignId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/summary/status/${campaignId}`
			);
			expect(result).toEqual(mockSummary);
		});
	});

	describe('updateContactPhoneNumber', () => {
		it('should update a contact phone number', async () => {
			const contactId = 1;
			const phoneNumberId = 10;
			const updateData = { phoneNumber: '+1234567890' };
			const mockResponse = { id: 10, phoneNumber: '+1234567890' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactsApi();
			const result = await api.updateContactPhoneNumber(
				contactId,
				phoneNumberId,
				updateData
			);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/${contactId}/phone-numbers/${phoneNumberId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createContactPhoneNumbers', () => {
		it('should create phone numbers for a contact', async () => {
			const contactId = 1;
			const phoneData = { phones: ['+1234567890', '+0987654321'] };
			const mockResponse = [
				{ id: 1, phoneNumber: '+1234567890' },
				{ id: 2, phoneNumber: '+0987654321' },
			];
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactsApi();
			const result = await api.createContactPhoneNumbers(contactId, phoneData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/${contactId}/phone-numbers`,
				phoneData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateContact', () => {
		it('should update a contact', async () => {
			const contactId = '123';
			const updateData = { firstName: 'Updated', lastName: 'Name' };
			const mockResponse = { id: 123, ...updateData };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactsApi();
			const result = await api.updateContact(contactId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/${contactId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteContact', () => {
		it('should delete a contact', async () => {
			const contactId = '123';
			const mockResponse = { message: 'Contact deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = contactsApi();
			const result = await api.deleteContact(contactId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/contacts/${contactId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
