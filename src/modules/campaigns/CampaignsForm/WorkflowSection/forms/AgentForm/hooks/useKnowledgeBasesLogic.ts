import { useMemo } from 'react';
import {
	useKnowledgeBases,
	useKnowledgeBasesByIds,
} from '~/queries/knowledgeBaseQueries';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import type { KnowledgeBaseRef } from '../types';

export const useKnowledgeBasesLogic = (
	mergedKnowledgeBaseItems: unknown[]
): {
	normalizeKnowledgeBaseRefs: (items: unknown[]) => KnowledgeBaseRef[];
	mergedKnowledgeBaseRefs: KnowledgeBaseRef[];
	knowledgeBaseIdNumbers: number[];
	allKnowledgeBases?: KnowledgeBaseModel[];
	isKnowledgeBasesLoading: boolean;
	isKnowledgeBasesError: boolean;
	missingKnowledgeBases: KnowledgeBaseModel[];
	combinedKnowledgeBases: KnowledgeBaseModel[];
} => {
	const normalizeKnowledgeBaseRefs = (items: unknown[]): KnowledgeBaseRef[] => {
		const refs: KnowledgeBaseRef[] = [];
		items.forEach((item) => {
			if (typeof item === 'string' || typeof item === 'number') {
				refs.push({ id: String(item) });
				return;
			}
			if (!item || typeof item !== 'object') return;
			const record = item as Record<string, unknown>;
			const idCandidate =
				record.id ?? record.knowledgeBaseId ?? record.kbId ?? null;
			const nameCandidate = record.name ?? record.label ?? null;
			if (typeof idCandidate === 'string' || typeof idCandidate === 'number') {
				refs.push({
					id: String(idCandidate),
					name: typeof nameCandidate === 'string' ? nameCandidate : undefined,
				});
			}
		});
		const deduped = new Map<string, KnowledgeBaseRef>();
		refs.forEach((ref) => {
			const existing = deduped.get(ref.id);
			deduped.set(ref.id, existing?.name ? existing : ref);
		});
		return Array.from(deduped.values());
	};

	const mergedKnowledgeBaseRefs = useMemo(
		() => normalizeKnowledgeBaseRefs(mergedKnowledgeBaseItems),
		[mergedKnowledgeBaseItems]
	);

	const knowledgeBaseIdNumbers = useMemo(
		() =>
			mergedKnowledgeBaseRefs
				.map((ref) => Number(ref.id))
				.filter((id) => Number.isFinite(id)),
		[mergedKnowledgeBaseRefs]
	);

	const {
		data: allKnowledgeBases,
		isLoading: isKnowledgeBasesLoading,
		isError: isKnowledgeBasesError,
	} = useKnowledgeBases();

	const missingKnowledgeBaseIds = knowledgeBaseIdNumbers.filter(
		(id) => !allKnowledgeBases?.some((kb) => kb.id === id)
	);

	const missingKnowledgeBaseQueries = useKnowledgeBasesByIds(
		missingKnowledgeBaseIds
	);

	const missingKnowledgeBases = missingKnowledgeBaseQueries
		.map((query) => query.data)
		.filter((kb): kb is KnowledgeBaseModel => Boolean(kb));

	const combinedKnowledgeBases = [
		...(allKnowledgeBases || []),
		...missingKnowledgeBases,
	];

	return {
		normalizeKnowledgeBaseRefs,
		mergedKnowledgeBaseRefs,
		knowledgeBaseIdNumbers,
		allKnowledgeBases,
		isKnowledgeBasesLoading,
		isKnowledgeBasesError,
		missingKnowledgeBases,
		combinedKnowledgeBases,
	};
};
