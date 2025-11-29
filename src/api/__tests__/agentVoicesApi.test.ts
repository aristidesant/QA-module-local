import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import axios from 'axios';
import agentVoicesApi from '../agentVoicesApi';
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

describe('agentVoicesApi', () => {
	beforeEach(() => {
		resetAxiosMocks();
	});

	describe('createVoice', () => {
		it('should create a voice successfully', async () => {
			const voiceData = { voiceId: 'voice-123', clientId: 1 } as any;
			const mockResponse = { id: 1, voiceId: 'voice-123' };
			(axios.post as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentVoicesApi();
			const result = await api.createVoice(voiceData);

			expect(axios.post).toHaveBeenCalledWith(
				`${TEST_API_URL}/voices`,
				voiceData
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when creation fails', async () => {
			const voiceData = { voiceId: 'voice-123' } as any;
			const error = createMockAxiosError('Creation failed', 400);
			(axios.post as Mock).mockRejectedValue(error);

			const api = agentVoicesApi();
			await expect(api.createVoice(voiceData)).rejects.toThrow(
				'Creation failed'
			);
		});
	});

	describe('findAllVoices', () => {
		it('should fetch all voices without params', async () => {
			const mockResponse = [
				{ id: 'voice-1', name: 'Voice 1' },
				{ id: 'voice-2', name: 'Voice 2' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentVoicesApi();
			const result = await api.findAllVoices();

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/voices`, {
				params: undefined,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});

		it('should fetch voices with params', async () => {
			const params = { provider: 'elevenlabs', language: 'en' };
			const mockResponse = [
				{ id: 'voice-1', name: 'Voice 1', provider: 'elevenlabs' },
			];
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentVoicesApi();
			const result = await api.findAllVoices(params);

			expect(axios.get).toHaveBeenCalledWith(`${TEST_API_URL}/voices`, {
				params,
				timeout: 5000,
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('findVoice', () => {
		it('should fetch a single voice by id', async () => {
			const voiceId = 'voice-123';
			const mockResponse = { id: voiceId, name: 'Test Voice' };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentVoicesApi();
			const result = await api.findVoice(voiceId);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/voices/${voiceId}`
			);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when voice not found', async () => {
			const voiceId = 'non-existent';
			const error = createMockAxiosError('Voice not found', 404);
			(axios.get as Mock).mockRejectedValue(error);

			const api = agentVoicesApi();
			await expect(api.findVoice(voiceId)).rejects.toThrow('Voice not found');
		});
	});

	describe('updateVoice', () => {
		it('should update a voice successfully', async () => {
			const voiceId = 'voice-123';
			const updateData = { voiceId: 'updated-voice' } as any;
			const mockResponse = { id: 1, voiceId: 'updated-voice' };
			(axios.patch as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentVoicesApi();
			const result = await api.updateVoice(voiceId, updateData);

			expect(axios.patch).toHaveBeenCalledWith(
				`${TEST_API_URL}/voices/${voiceId}`,
				updateData
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteVoice', () => {
		it('should delete a voice successfully', async () => {
			const voiceId = 'voice-123';
			const mockResponse = { message: 'Voice deleted' };
			(axios.delete as Mock).mockResolvedValue(
				createMockResponse(mockResponse)
			);

			const api = agentVoicesApi();
			const result = await api.deleteVoice(voiceId);

			expect(axios.delete).toHaveBeenCalledWith(
				`${TEST_API_URL}/voices/${voiceId}`
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getElevenlabsVoices', () => {
		it('should fetch elevenlabs voices without params', async () => {
			const mockResponse = { voices: [{ id: 'voice-1', name: 'Voice 1' }] };
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentVoicesApi();
			const result = await api.getElevenlabsVoices();

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/voices/elevenlabs`,
				{
					params: {},
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('should fetch elevenlabs voices with params', async () => {
			const params = { language: 'en', gender: 'female' };
			const mockResponse = {
				voices: [{ id: 'voice-1', name: 'Voice 1', language: 'en' }],
			};
			(axios.get as Mock).mockResolvedValue(createMockResponse(mockResponse));

			const api = agentVoicesApi();
			const result = await api.getElevenlabsVoices(params);

			expect(axios.get).toHaveBeenCalledWith(
				`${TEST_API_URL}/voices/elevenlabs`,
				{
					params,
					timeout: 5000,
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});
});
