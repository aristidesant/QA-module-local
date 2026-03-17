import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import agentVoicesApi from '~/api/agentVoicesApi';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';

// Create agent voice
export const useCreateAgentVoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (voice: Partial<AgentVoiceModel>) => {
			const api = agentVoicesApi();
			return api.createVoice(voice);
		},
		onSuccess: (_data) => {
			queryClient.invalidateQueries({ queryKey: ['agentVoices'] });
		},
		onError: (error) => {
			void error;
		},
	});
};

// Get all agent voices
export const useGetAllAgentVoices = (params?: Record<string, string>) => {
	return useQuery({
		queryKey: ['agentVoices', params],
		queryFn: async () => {
			const api = agentVoicesApi();
			return api.findAllVoices(params);
		},
	});
};

// Get one agent voice by id
export const useGetAgentVoice = (id: string) => {
	return useQuery({
		queryKey: ['agentVoice', id],
		queryFn: async () => {
			const api = agentVoicesApi();
			return api.findVoice(id);
		},
		enabled: !!id,
	});
};

// Update agent voice
export const useUpdateAgentVoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<AgentVoiceModel>;
		}) => {
			const api = agentVoicesApi();
			return api.updateVoice(id, data);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['agentVoices'] });
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ['agentVoice', data.id] });
			}
		},
		onError: (error) => {
			void error;
		},
	});
};

// Delete agent voice
export const useDeleteAgentVoice = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const api = agentVoicesApi();
			return api.deleteVoice(id);
		},
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: ['agentVoices'] });
			queryClient.invalidateQueries({ queryKey: ['agentVoice', id] });
		},
		onError: (error) => {
			void error;
		},
	});
};

// Get Elevenlabs voices
export const useGetElevenlabsVoices = (params?: Record<string, string>) => {
	return useQuery({
		queryKey: ['elevenlabsVoices', params],
		queryFn: async () => {
			const api = agentVoicesApi();
			return api.getElevenlabsVoices(params);
		},
	});
};
