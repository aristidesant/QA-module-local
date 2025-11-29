import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import fileApi from '../fileApi';
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

describe('fileApi', () => {
	let api: ReturnType<typeof fileApi>;

	beforeEach(() => {
		resetAxiosMocks();
		api = fileApi();
	});

	describe('getPresignedFileUrl', () => {
		it('should get presigned URL as string response', async () => {
			const fileId = 'test-file-123';
			const presignedUrl =
				'https://s3.amazonaws.com/bucket/test-file-123?signature=abc';
			(axios.get as Mock).mockResolvedValue(createMockResponse(presignedUrl));

			const result = await api.getPresignedFileUrl(fileId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/files/access/${fileId}`,
				{
					params: { presigned: true },
					responseType: 'json',
					timeout: 5000,
				}
			);
			expect(result).toBe(presignedUrl);
		});

		it('should get presigned URL from object response with url field', async () => {
			const fileId = 123;
			const presignedUrl =
				'https://s3.amazonaws.com/bucket/test-file-123?signature=abc';
			const mockResponse = { url: presignedUrl };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getPresignedFileUrl(fileId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/files/access/${fileId}`,
				{
					params: { presigned: true },
					responseType: 'json',
					timeout: 5000,
				}
			);
			expect(result).toBe(presignedUrl);
		});

		it('should get presigned URL from object response with presignedUrl field', async () => {
			const fileId = 'test-file-456';
			const presignedUrl =
				'https://s3.amazonaws.com/bucket/test-file-456?signature=def';
			const mockResponse = { presignedUrl };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getPresignedFileUrl(fileId);

			expect(result).toBe(presignedUrl);
		});

		it('should get presigned URL from object response with href field', async () => {
			const fileId = 'test-file-789';
			const presignedUrl =
				'https://s3.amazonaws.com/bucket/test-file-789?signature=ghi';
			const mockResponse = { href: presignedUrl };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const result = await api.getPresignedFileUrl(fileId);

			expect(result).toBe(presignedUrl);
		});

		it('should get presigned URL with custom expiresIn', async () => {
			const fileId = 'test-file-exp';
			const presignedUrl =
				'https://s3.amazonaws.com/bucket/test-file-exp?signature=jkl';
			const expiresIn = 3600;
			(axios.get as Mock).mockResolvedValue(createMockResponse(presignedUrl));

			const result = await api.getPresignedFileUrl(fileId, { expiresIn });

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/files/access/${fileId}`,
				{
					params: { presigned: true, expiresIn },
					responseType: 'json',
					timeout: 5000,
				}
			);
			expect(result).toBe(presignedUrl);
		});

		it('should throw error for unexpected response format', async () => {
			const fileId = 'test-file-invalid';
			const mockResponse = { invalidField: 'some-value' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			await expect(api.getPresignedFileUrl(fileId)).rejects.toThrow(
				'Unexpected response when requesting presigned file URL'
			);
		});

		it('should throw error when request fails', async () => {
			const fileId = 'nonexistent-file';
			const error = createMockAxiosError('File not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			await expect(api.getPresignedFileUrl(fileId)).rejects.toThrow(
				'File not found'
			);
		});
	});
});
