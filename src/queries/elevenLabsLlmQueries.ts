import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import elevenLabsLlmApi from '~/api/elevenLabsLlmApi';
import type {
	ElevenLabsLlm,
	ElevenLabsLlmFilters,
	ElevenLabsLlmStatusUpdate,
	ElevenLabsLlmSyncResponse,
} from '~/models/ElevenLabsLlmModel';

export const elevenLabsLlmQueryKeys = {
	all: ['elevenlabs-llms'] as const,
	list: (filters: ElevenLabsLlmFilters = {}) =>
		['elevenlabs-llms', filters] as const,
};

export const useElevenLabsLlms = (filters: ElevenLabsLlmFilters = {}) =>
	useQuery<ElevenLabsLlm[], Error>({
		queryKey: elevenLabsLlmQueryKeys.list(filters),
		queryFn: () => elevenLabsLlmApi().getLlms(filters),
	});

export interface ElevenLabsLlmOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export const buildElevenLabsLlmOptions = (
	llms: ElevenLabsLlm[],
	currentValues: Array<string | null | undefined> = [],
	unavailableLabel = 'Unavailable'
): ElevenLabsLlmOption[] => {
	const activeValues = new Set(llms.map((llm) => llm.llm));
	const options: ElevenLabsLlmOption[] = llms.map((llm) => ({
		value: llm.llm,
		label: llm.llm,
	}));

	currentValues.filter(Boolean).forEach((value) => {
		if (!value || activeValues.has(value)) return;
		options.push({
			value,
			label: `${value} (${unavailableLabel})`,
			disabled: true,
		});
	});

	return options;
};

export const useActiveElevenLabsLlmCatalog = () => {
	const query = useElevenLabsLlms({ status: 'ACTIVE' });
	const reasoningEffortsByModel = useMemo(
		() =>
			(query.data ?? []).reduce<Record<string, string[]>>((acc, llm) => {
				acc[llm.llm] = llm.availableReasoningEfforts ?? [];
				return acc;
			}, {}),
		[query.data]
	);

	return { ...query, llms: query.data ?? [], reasoningEffortsByModel };
};

export const useSyncElevenLabsLlms = () => {
	const queryClient = useQueryClient();

	return useMutation<ElevenLabsLlmSyncResponse, Error>({
		mutationFn: () => elevenLabsLlmApi().syncLlms(),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: elevenLabsLlmQueryKeys.all,
			});
		},
	});
};

export const useUpdateElevenLabsLlmStatus = () => {
	const queryClient = useQueryClient();

	return useMutation<
		ElevenLabsLlm,
		Error,
		{ llm: string; payload: ElevenLabsLlmStatusUpdate }
	>({
		mutationFn: ({ llm, payload }) =>
			elevenLabsLlmApi().updateLlmStatus(llm, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: elevenLabsLlmQueryKeys.all,
			});
		},
	});
};
