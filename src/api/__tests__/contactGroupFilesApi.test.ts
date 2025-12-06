import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import contactGroupFilesApi from '../contactGroupFilesApi';
import {
	resetAxiosMocks,
	createMockResponse,
	createMockAxiosError,
} from './setup';
import type {
	ContactFileSummary,
	ProcessContactGroupFileRequest,
	ProcessContactGroupFileResponse,
	AppendContactGroupFileRequest,
	AppendContactGroupFileResponse,
} from '~/models/ContactFileSummary';

vi.mock('axios');
vi.mock('../config', () => ({
	DEFAULT_API_URL: 'http://test-api.example.com',
}));

const TEST_API_URL = 'http://test-api.example.com';

describe('contactGroupFilesApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('uploadContactGroupFile', () => {
		it('should upload a contact group file successfully', async () => {
			const file = new File(['test'], 'test.csv', { type: 'text/csv' });
			const campaignId = 1;
			const mockResponse: ContactFileSummary = {
				contactGroupFileId: 1,
				headers: ['name', 'phone'],
				totalRows: 100,
				file: {
					id: 1,
					name: 'test.csv',
					mime: 'text/csv',
					repositoryKey: 'test.csv',
					repositoryRoute: '/uploads/test.csv',
					extension: 'csv',
					description: null,
					typeId: 1,
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupFilesApi();
			const result = await api.uploadContactGroupFile(file, campaignId);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-group-files/upload`,
				expect.any(FormData)
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when upload fails', async () => {
			const file = new File(['test'], 'test.csv', { type: 'text/csv' });
			const campaignId = 1;
			const error = createMockAxiosError('Upload failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = contactGroupFilesApi();
			await expect(
				api.uploadContactGroupFile(file, campaignId)
			).rejects.toThrow('Upload failed');
		});
	});

	describe('processContactGroupFile', () => {
		it('should process a contact group file successfully', async () => {
			const mockData: ProcessContactGroupFileRequest = {
				fieldMapping: { name: { csvField: 'Name' } },
				contactGroupFileId: 1,
				groupName: 'Test Group',
				groupDescription: 'Test Description',
				groupExpiration: '2023-12-31T00:00:00Z',
				groupMaxCallPerContact: 3,
				groupMaxCallPerGroup: 100,
				humanEquivalent: 1,
				schedulerId: 1,
				schemaId: 1,
				maxWaves: 3,
			};
			const mockResponse: ProcessContactGroupFileResponse = {
				success: true,
				message: 'Processed successfully',
				contactGroupId: 1,
				totalProcessed: 100,
				failedCount: 0,
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupFilesApi();
			const result = await api.processContactGroupFile(mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-group-files/process`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when processing fails', async () => {
			const mockData: ProcessContactGroupFileRequest = {
				fieldMapping: { name: { csvField: 'Name' } },
				contactGroupFileId: 1,
				groupName: 'Test Group',
				groupDescription: 'Test Description',
				groupExpiration: '2023-12-31T00:00:00Z',
				groupMaxCallPerContact: 3,
				groupMaxCallPerGroup: 100,
				humanEquivalent: 1,
				schedulerId: 1,
				schemaId: 1,
				maxWaves: 3,
			};
			const error = createMockAxiosError('Processing failed', 500);
			(axios.post as Mock).mockRejectedValue(error);

			const api = contactGroupFilesApi();
			await expect(api.processContactGroupFile(mockData)).rejects.toThrow(
				'Processing failed'
			);
		});
	});

	describe('appendToContactGroup', () => {
		it('should append to contact group successfully', async () => {
			const contactGroupId = 1;
			const mockData: AppendContactGroupFileRequest = {
				contactGroupFileId: 2,
			};
			const mockResponse: AppendContactGroupFileResponse = {
				contactGroupFileId: 2,
				contactGroupId: 1,
				processedRows: 50,
				errorRows: 0,
				status: 'complete',
			};
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupFilesApi();
			const result = await api.appendToContactGroup(contactGroupId, mockData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-group-files/contact-groups/${contactGroupId}/append`,
				mockData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getLatestContactGroupFile', () => {
		it('should get latest contact group file successfully', async () => {
			const contactGroupId = 1;
			const mockResponse: ContactFileSummary = {
				contactGroupFileId: 1,
				headers: ['name', 'phone'],
				totalRows: 100,
				file: {
					id: 1,
					name: 'test.csv',
					mime: 'text/csv',
					repositoryKey: 'test.csv',
					repositoryRoute: '/uploads/test.csv',
					extension: 'csv',
					description: null,
					typeId: 1,
					userId: 1,
					clientId: 1,
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
					deletedAt: null,
				},
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupFilesApi();
			const result = await api.getLatestContactGroupFile(contactGroupId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-group-files/contact-group/${contactGroupId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when file not found', async () => {
			const contactGroupId = 999;
			const error = createMockAxiosError('File not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = contactGroupFilesApi();
			await expect(
				api.getLatestContactGroupFile(contactGroupId)
			).rejects.toThrow('File not found');
		});
	});

	describe('exportContactGroupFileOriginal', () => {
		it('should export contact group file original successfully', async () => {
			const contactGroupId = 1;
			const mockResponse = 'presigned-url-or-csv-content';
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = contactGroupFilesApi();
			const result = await api.exportContactGroupFileOriginal(contactGroupId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/contact-group-files/${contactGroupId}/export`
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
