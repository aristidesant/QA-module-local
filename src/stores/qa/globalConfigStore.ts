import { create } from 'zustand';
import {
	SEED_CALL_ANALYSIS,
	SEED_CAMPAIGN_TYPES,
	SEED_CONTEXT_RULES,
	SEED_EVALUATION,
	SEED_EVALUATION_VERSIONS,
	SEED_NAMING_CONVENTION,
	SEED_PROTOCOL_DOCUMENTS,
	SEED_SCORE_SCALES,
	SEED_SENTIMENT_ANALYZER,
} from '~/modules/qa/global-config/seed';
import { nextId } from '~/modules/qa/global-config/helpers';
import type {
	CallAnalysisConfig,
	CampaignTypeEntry,
	ContextRule,
	EvaluationConfig,
	EvaluationVersion,
	NamingConvention,
	ProtocolDocument,
	ScoreScale,
	SentimentAnalyzerConfig,
} from '~/modules/qa/global-config/types';

/**
 * Super admin "Global configuration" mock state. Nothing is persisted or sent to a
 * backend; every write stamps `updatedAt` and the versioned slices bump `version`.
 */
interface GlobalConfigState {
	callAnalysis: CallAnalysisConfig;
	evaluation: EvaluationConfig;
	evaluationVersions: EvaluationVersion[];
	contextRules: ContextRule[];
	protocolDocuments: ProtocolDocument[];
	campaignTypes: CampaignTypeEntry[];
	namingConvention: NamingConvention;
	scoreScales: ScoreScale[];
	sentimentAnalyzer: SentimentAnalyzerConfig;

	saveCallAnalysis: (next: CallAnalysisConfig) => void;
	saveEvaluation: (next: EvaluationConfig, summary: string) => void;
	upsertContextRule: (rule: ContextRule) => void;
	toggleContextRule: (id: string) => void;
	deleteContextRule: (id: string) => void;
	duplicateContextRule: (id: string) => void;
	upsertCampaignType: (entry: CampaignTypeEntry) => void;
	deleteCampaignType: (code: string) => void;
	saveNamingConvention: (next: NamingConvention) => void;
	upsertScoreScale: (scale: ScoreScale) => void;
	deleteScoreScale: (id: string) => void;
	saveSentimentAnalyzer: (next: SentimentAnalyzerConfig) => void;
}

const now = () => new Date().toISOString();

export const useGlobalConfigStore = create<GlobalConfigState>((set) => ({
	callAnalysis: SEED_CALL_ANALYSIS,
	evaluation: SEED_EVALUATION,
	evaluationVersions: SEED_EVALUATION_VERSIONS,
	contextRules: SEED_CONTEXT_RULES,
	protocolDocuments: SEED_PROTOCOL_DOCUMENTS,
	campaignTypes: SEED_CAMPAIGN_TYPES,
	namingConvention: SEED_NAMING_CONVENTION,
	scoreScales: SEED_SCORE_SCALES,
	sentimentAnalyzer: SEED_SENTIMENT_ANALYZER,

	saveCallAnalysis: (next) =>
		set({ callAnalysis: { ...next, updatedAt: now() } }),

	saveEvaluation: (next, summary) =>
		set((s) => {
			const version = s.evaluation.version + 1;
			const savedAt = now();
			return {
				evaluation: { ...next, version, updatedAt: savedAt },
				evaluationVersions: [
					{ version, savedAt, savedBy: 'Super admin', summary },
					...s.evaluationVersions,
				],
			};
		}),

	upsertContextRule: (rule) =>
		set((s) => {
			const stamped = { ...rule, updatedAt: now() };
			const exists = s.contextRules.some((r) => r.id === rule.id);
			return {
				contextRules: exists
					? s.contextRules.map((r) => (r.id === rule.id ? stamped : r))
					: [stamped, ...s.contextRules],
			};
		}),
	toggleContextRule: (id) =>
		set((s) => ({
			contextRules: s.contextRules.map((r) =>
				r.id === id
					? {
							...r,
							status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
							updatedAt: now(),
						}
					: r
			),
		})),
	deleteContextRule: (id) =>
		set((s) => ({ contextRules: s.contextRules.filter((r) => r.id !== id) })),
	duplicateContextRule: (id) =>
		set((s) => {
			const source = s.contextRules.find((r) => r.id === id);
			if (!source) return {};
			const copy: ContextRule = {
				...source,
				id: nextId('rule'),
				topic: `${source.topic}-copy`,
				status: 'INACTIVE',
				updatedAt: now(),
			};
			const index = s.contextRules.indexOf(source);
			const next = [...s.contextRules];
			next.splice(index + 1, 0, copy);
			return { contextRules: next };
		}),

	upsertCampaignType: (entry) =>
		set((s) => {
			const stamped = { ...entry, updatedAt: now() };
			const exists = s.campaignTypes.some((c) => c.code === entry.code);
			return {
				campaignTypes: exists
					? s.campaignTypes.map((c) => (c.code === entry.code ? stamped : c))
					: [...s.campaignTypes, stamped].sort((a, b) =>
							a.code.localeCompare(b.code)
						),
			};
		}),
	deleteCampaignType: (code) =>
		set((s) => ({
			campaignTypes: s.campaignTypes.filter((c) => c.code !== code || c.locked),
		})),

	saveNamingConvention: (next) =>
		set({ namingConvention: { ...next, updatedAt: now() } }),

	upsertScoreScale: (scale) =>
		set((s) => {
			const stamped = { ...scale, updatedAt: now() };
			const exists = s.scoreScales.some((x) => x.id === scale.id);
			return {
				scoreScales: exists
					? s.scoreScales.map((x) => (x.id === scale.id ? stamped : x))
					: [stamped, ...s.scoreScales],
			};
		}),
	deleteScoreScale: (id) =>
		set((s) => ({ scoreScales: s.scoreScales.filter((x) => x.id !== id) })),

	saveSentimentAnalyzer: (next) =>
		set((s) => ({
			sentimentAnalyzer: {
				...next,
				version: s.sentimentAnalyzer.version + 1,
				updatedAt: now(),
			},
		})),
}));

export const selectCallAnalysis = (s: GlobalConfigState) => s.callAnalysis;
export const selectEvaluation = (s: GlobalConfigState) => s.evaluation;
export const selectEvaluationVersions = (s: GlobalConfigState) =>
	s.evaluationVersions;
export const selectContextRules = (s: GlobalConfigState) => s.contextRules;
export const selectProtocolDocuments = (s: GlobalConfigState) =>
	s.protocolDocuments;
export const selectCampaignTypes = (s: GlobalConfigState) => s.campaignTypes;
export const selectNamingConvention = (s: GlobalConfigState) =>
	s.namingConvention;
export const selectScoreScales = (s: GlobalConfigState) => s.scoreScales;
export const selectSentimentAnalyzer = (s: GlobalConfigState) =>
	s.sentimentAnalyzer;
