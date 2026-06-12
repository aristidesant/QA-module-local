import type {
	Campaign,
	CampaignVoice,
	CampaignVoiceInput,
} from '~/models/CampaignsModel';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';

export const normalizeCampaignVoiceName = (value?: string | null): string => {
	return (value ?? '').trim();
};

export const normalizeCampaignVoiceAssignments = (
	voices?: Array<CampaignVoice | CampaignVoiceInput | null | undefined>
): CampaignVoiceInput[] => {
	if (!Array.isArray(voices)) {
		return [];
	}

	const seenVoiceIds = new Set<string>();

	return voices.reduce<CampaignVoiceInput[]>((acc, voice) => {
		if (!voice?.voiceId || seenVoiceIds.has(voice.voiceId)) {
			return acc;
		}

		seenVoiceIds.add(voice.voiceId);
		acc.push({
			voiceId: voice.voiceId,
			voiceName: normalizeCampaignVoiceName(voice.voiceName),
		});
		return acc;
	}, []);
};

export const buildCampaignVoiceAssignments = (
	campaign?: Partial<Campaign>
): CampaignVoiceInput[] => {
	if (campaign?.voices?.length) {
		return normalizeCampaignVoiceAssignments(campaign.voices);
	}

	const voiceIds =
		campaign?.voiceIds ?? (campaign?.voiceId ? [campaign.voiceId] : []);
	return normalizeCampaignVoiceAssignments(
		voiceIds
			.filter((voiceId): voiceId is string => Boolean(voiceId))
			.map((voiceId) => ({
				voiceId,
				voiceName: '',
			}))
	);
};

export type CampaignVoiceAssignmentIssueCode = 'duplicate' | 'singleQuote';

export interface CampaignVoiceAssignmentIssue {
	voiceId: string;
	index: number;
	code: CampaignVoiceAssignmentIssueCode;
}

export interface CampaignVoiceAssignmentStats {
	customNameCount: number;
	effectiveNameCount: number;
	duplicateEffectiveNameCount: number;
}

const getCampaignVoiceCatalogName = (
	voiceId: string,
	catalogById: Map<string, string>
): string => {
	return normalizeCampaignVoiceName(catalogById.get(voiceId));
};

export const getCampaignVoiceAssignmentStats = (
	voices: Array<CampaignVoice | CampaignVoiceInput | null | undefined>,
	catalogVoices: AgentVoiceModel[]
): CampaignVoiceAssignmentStats => {
	const assignments = normalizeCampaignVoiceAssignments(voices);
	const catalogById = new Map(
		catalogVoices.map((entry) => [entry.voice.id, entry.voice.name])
	);
	const effectiveNames = assignments.map(
		(assignment) =>
			normalizeCampaignVoiceName(assignment.voiceName) ||
			normalizeCampaignVoiceName(catalogById.get(assignment.voiceId))
	);
	const uniqueNames = new Set(effectiveNames.filter(Boolean));
	const customNameCount = assignments.filter(
		(assignment) => normalizeCampaignVoiceName(assignment.voiceName).length > 0
	).length;

	return {
		customNameCount,
		effectiveNameCount: effectiveNames.filter(Boolean).length,
		duplicateEffectiveNameCount: effectiveNames.length - uniqueNames.size,
	};
};

export const getCampaignVoiceAssignmentIssues = (
	voices: Array<CampaignVoice | CampaignVoiceInput | null | undefined>,
	catalogVoices: AgentVoiceModel[]
): CampaignVoiceAssignmentIssue[] => {
	const assignments = normalizeCampaignVoiceAssignments(voices);
	const catalogById = new Map(
		catalogVoices.map((entry) => [entry.voice.id, entry.voice.name])
	);
	const effectiveNames = assignments.map((assignment) => {
		return (
			normalizeCampaignVoiceName(assignment.voiceName) ||
			getCampaignVoiceCatalogName(assignment.voiceId, catalogById) ||
			assignment.voiceId
		);
	});

	const issues: CampaignVoiceAssignmentIssue[] = [];
	const nameToIndexes = new Map<string, number[]>();

	assignments.forEach((assignment, index) => {
		const customName = normalizeCampaignVoiceName(assignment.voiceName);
		if (customName.includes("'")) {
			issues.push({
				voiceId: assignment.voiceId,
				index,
				code: 'singleQuote',
			});
		}

		const effectiveName = effectiveNames[index];
		const existing = nameToIndexes.get(effectiveName) ?? [];
		existing.push(index);
		nameToIndexes.set(effectiveName, existing);
	});

	for (const indexes of nameToIndexes.values()) {
		if (indexes.length < 2) {
			continue;
		}

		for (const index of indexes) {
			issues.push({
				voiceId: assignments[index].voiceId,
				index,
				code: 'duplicate',
			});
		}
	}

	return issues;
};
