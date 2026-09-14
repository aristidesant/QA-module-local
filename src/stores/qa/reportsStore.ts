import { create } from 'zustand';
import type {
	GeneratedReportRecord,
	ReportDefinition,
	ReportDraft,
	ReportSchedule,
} from '~/models/qa/reportBuilder';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { buildNotification } from '~/modules/qa/inbox/helpers';
import {
	GENERATED_REPORTS_SEED,
	REPORT_DEFINITIONS_SEED,
} from '~/modules/qa/reports/mockData';
import { nextRunAt } from '~/modules/qa/reports/helpers';
import { useNotificationStore } from './notificationStore';

let definitionCounter = REPORT_DEFINITIONS_SEED.length;
let generationCounter = GENERATED_REPORTS_SEED.length;

const nextDefinitionId = () =>
	`RPT-${String(++definitionCounter).padStart(3, '0')}`;
const nextGenerationId = () =>
	`GEN-${String(++generationCounter).padStart(3, '0')}`;

interface ReportsState {
	definitions: ReportDefinition[];
	generated: GeneratedReportRecord[];
	/** Creates a definition, or updates the one whose id is given. */
	saveDefinition: (draft: ReportDraft, id?: string) => ReportDefinition;
	deleteDefinition: (id: string) => void;
	duplicateDefinition: (id: string) => ReportDefinition | null;
	recordGeneration: (
		record: Omit<GeneratedReportRecord, 'id' | 'generatedAt'>
	) => GeneratedReportRecord;
	setSchedule: (id: string, schedule: ReportSchedule | null) => void;
	toggleSchedule: (id: string) => void;
	/** Generates the report now as if the schedule had fired. */
	runScheduleNow: (id: string) => void;
}

export const selectDefinitions = (s: ReportsState) => s.definitions;
export const selectGenerated = (s: ReportsState) => s.generated;

/** Tells the author their scheduled report went out. */
const notifyDelivery = (definition: ReportDefinition, count: number) => {
	useNotificationStore.getState().addNotification(
		buildNotification({
			agentId:
				definition.createdByRole === 'SUPERVISOR' ? 'SUP-001' : 'QAM-001',
			recipientRole:
				definition.createdByRole === 'SUPERVISOR' ? 'SUPERVISOR' : 'QA_MANAGER',
			recipientId:
				definition.createdByRole === 'SUPERVISOR' ? 'SUP-001' : 'QAM-001',
			category: 'DIRECT_MESSAGE',
			title: `Report sent · ${definition.name}`,
			message: `${definition.name} was generated and sent to ${count} recipient(s).`,
			icon: 'file-text',
			sourceRole: 'SYSTEM',
			payload: { kind: 'MESSAGE' },
		})
	);
};

export const useReportsStore = create<ReportsState>((set, get) => ({
	definitions: REPORT_DEFINITIONS_SEED,
	generated: GENERATED_REPORTS_SEED,

	saveDefinition: (draft, id) => {
		const existing = id
			? get().definitions.find((definition) => definition.id === id)
			: undefined;

		const saved: ReportDefinition = existing
			? { ...existing, ...draft, updatedAt: NOW_ISO }
			: {
					...draft,
					id: nextDefinitionId(),
					builtIn: false,
					createdAt: NOW_ISO,
					updatedAt: NOW_ISO,
					lastGeneratedAt: null,
				};

		set((s) => ({
			definitions: existing
				? s.definitions.map((definition) =>
						definition.id === saved.id ? saved : definition
					)
				: [saved, ...s.definitions],
		}));

		return saved;
	},

	deleteDefinition: (id) =>
		set((s) => ({
			definitions: s.definitions.filter(
				(definition) => definition.id !== id || definition.builtIn
			),
		})),

	duplicateDefinition: (id) => {
		const source = get().definitions.find((definition) => definition.id === id);
		if (!source) return null;

		const copy: ReportDefinition = {
			...source,
			id: nextDefinitionId(),
			name: `${source.name} (copy)`,
			builtIn: false,
			schedule: source.schedule ? { ...source.schedule, enabled: false } : null,
			createdAt: NOW_ISO,
			updatedAt: NOW_ISO,
			lastGeneratedAt: null,
		};
		set((s) => ({ definitions: [copy, ...s.definitions] }));
		return copy;
	},

	recordGeneration: (record) => {
		const created: GeneratedReportRecord = {
			...record,
			id: nextGenerationId(),
			generatedAt: NOW_ISO,
		};

		set((s) => ({
			generated: [created, ...s.generated],
			definitions: s.definitions.map((definition) =>
				definition.id === record.definitionId
					? { ...definition, lastGeneratedAt: NOW_ISO }
					: definition
			),
		}));

		return created;
	},

	setSchedule: (id, schedule) =>
		set((s) => ({
			definitions: s.definitions.map((definition) =>
				definition.id === id
					? { ...definition, schedule, updatedAt: NOW_ISO }
					: definition
			),
		})),

	toggleSchedule: (id) =>
		set((s) => ({
			definitions: s.definitions.map((definition) =>
				definition.id === id && definition.schedule
					? {
							...definition,
							schedule: {
								...definition.schedule,
								enabled: !definition.schedule.enabled,
							},
							updatedAt: NOW_ISO,
						}
					: definition
			),
		})),

	runScheduleNow: (id) => {
		const definition = get().definitions.find(
			(candidate) => candidate.id === id
		);
		if (!definition?.schedule) return;

		get().recordGeneration({
			definitionId: definition.id,
			definitionName: definition.name,
			audience: definition.audience,
			format: definition.formats[0] ?? 'PDF',
			trigger: 'SCHEDULED',
			sizeKb: 180 + definition.sections.length * 40,
			status: 'SENT',
			recipients: definition.schedule.recipients,
		});

		get().setSchedule(id, {
			...definition.schedule,
			nextRunAt: nextRunAt(
				definition.schedule.frequency,
				definition.schedule.dayOfWeek,
				definition.schedule.time
			),
		});

		notifyDelivery(definition, definition.schedule.recipients.length);
	},
}));
