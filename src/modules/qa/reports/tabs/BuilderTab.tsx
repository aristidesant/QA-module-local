import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Accordion,
	Badge,
	Button,
	Grid,
	Group,
	Menu,
	Modal,
	Stack,
	TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconDeviceFloppy, IconDownload, IconPlus } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { downloadBlob } from '~/utils/fileUtils';
import type {
	ReportDefinition,
	ReportDraft,
	ReportFormat,
} from '~/models/qa/reportBuilder';
import type { TeamRole } from '~/modules/qa/team/types';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useReportsStore } from '~/stores/qa/reportsStore';
import { useDisputesStore, selectCases } from '~/stores/qa/disputesStore';
import { useRankingsStore, selectPrograms } from '~/stores/qa/rankingsStore';
import { useCoachingStore, selectSessions } from '~/stores/qa/coachingStore';
import { useLmsStore, selectAssignments } from '~/stores/qa/lmsStore';
import { buildReportData } from '../buildReportData';
import { approximateSizeKb, csvFilename, toCsv } from '../exportCsv';
import AudienceStep from '../components/composer/AudienceStep';
import PeriodScopeStep from '../components/composer/PeriodScopeStep';
import SectionsStep from '../components/composer/SectionsStep';
import OutputStep from '../components/composer/OutputStep';
import ReportPreview from '../components/preview/ReportPreview';

const PREVIEW_DEBOUNCE_MS = 300;
const STEPS = ['audience', 'period', 'sections', 'output'] as const;

interface BuilderTabProps {
	role: TeamRole;
	draft: ReportDraft;
	/** Saved definition being edited, or null for a new one. */
	editingId: string | null;
	onDraftChange: (draft: ReportDraft) => void;
	onSaved: (definition: ReportDefinition) => void;
	onReset: () => void;
}

/** Compose a report on the left, see the document it produces on the right. */
export const BuilderTab: React.FC<BuilderTabProps> = ({
	role,
	draft,
	editingId,
	onDraftChange,
	onSaved,
	onReset,
}) => {
	const { t } = useTranslation('qa.reports');
	const { t: tMetrics } = useTranslation('qa.teamAnalytics');

	const saveDefinition = useReportsStore((s) => s.saveDefinition);
	const recordGeneration = useReportsStore((s) => s.recordGeneration);
	const cases = useDisputesStore(selectCases);
	const programs = useRankingsStore(selectPrograms);
	const sessions = useCoachingStore(selectSessions);
	const assignments = useLmsStore(selectAssignments);

	const [saveOpen, setSaveOpen] = useState(false);
	const [saveName, setSaveName] = useState('');
	const [touched, setTouched] = useState(false);

	const patch = useCallback(
		(changes: Partial<ReportDraft>) => {
			setTouched(true);
			onDraftChange({ ...draft, ...changes });
		},
		[draft, onDraftChange]
	);

	const errors = useMemo(() => {
		const list: Partial<Record<string, string>> = {};
		if (!draft.name.trim()) list.name = t('builder.validation.name');
		if (draft.audience === 'client' && !draft.clientName?.trim()) {
			list.client = t('builder.validation.client');
		}
		if (draft.sections.length === 0) {
			list.sections = t('builder.validation.sections');
		}
		if (draft.formats.length === 0) {
			list.formats = t('builder.validation.formats');
		}
		if (draft.period.to < draft.period.from) {
			list.dates = t('builder.validation.dates');
		}
		return list;
	}, [draft, t]);

	const shown = touched ? errors : {};
	const invalid = Object.keys(errors).length > 0;

	// Rebuilding the whole document on every keystroke is wasteful.
	const [debounced] = useDebouncedValue(draft, PREVIEW_DEBOUNCE_MS);

	const data = useMemo(() => {
		const definition: ReportDefinition = {
			...debounced,
			id: editingId ?? 'draft',
			builtIn: false,
			createdAt: NOW_ISO,
			updatedAt: NOW_ISO,
			lastGeneratedAt: null,
		};
		return buildReportData(definition, role, {
			cases,
			programs,
			sessions,
			assignments,
		});
	}, [debounced, editingId, role, cases, programs, sessions, assignments]);

	const handleSave = () => {
		setTouched(true);
		if (invalid) {
			notifyWarning(Object.values(errors)[0] ?? t('builder.validation.name'));
			return;
		}
		setSaveName(draft.name);
		setSaveOpen(true);
	};

	const confirmSave = () => {
		const named = { ...draft, name: saveName.trim() || draft.name };
		const saved = saveDefinition(named, editingId ?? undefined);
		onDraftChange(named);
		onSaved(saved);
		setSaveOpen(false);
		notifySuccess(t('builder.saved'));
	};

	const generateWith = (format: ReportFormat) => {
		setTouched(true);
		if (invalid) {
			notifyWarning(Object.values(errors)[0] ?? t('builder.validation.name'));
			return;
		}

		const common = {
			definitionId: editingId ?? 'unsaved',
			definitionName: draft.name,
			audience: draft.audience,
			format,
			trigger: 'MANUAL' as const,
			status: 'READY' as const,
			recipients: [],
		};

		if (format === 'CSV') {
			const csv = toCsv(data, {
				sectionTitle: (key) => t(`sections.items.${key}.label`),
				metricLabel: (metricId) =>
					tMetrics(`metrics.${metricId}`, { defaultValue: metricId }),
				column: (key) => t(`preview.columns.${key}`),
			});
			downloadBlob(
				new Blob([csv], { type: 'text/csv;charset=utf-8' }),
				csvFilename(data)
			);
			recordGeneration({ ...common, sizeKb: approximateSizeKb(csv), csv });
			notifySuccess(t('generated.csvReady'));
			return;
		}

		if (format === 'PDF') {
			recordGeneration({
				...common,
				sizeKb: 180 + draft.sections.length * 40,
			});
			notifySuccess(t('generated.pdfReady'));
			window.print();
			return;
		}

		recordGeneration({ ...common, sizeKb: 90 + draft.sections.length * 20 });
		notifySuccess(t('generated.mockXlsx'));
	};

	return (
		<>
			<Grid gap='lg'>
				<Grid.Col span={{ base: 12, xl: 5 }}>
					<SectionCard
						fullHeight
						title={t('tabs.builder')}
						headerActions={
							editingId ? (
								<Badge variant='light' tt='none'>
									{t('builder.editing', { name: draft.name })}
								</Badge>
							) : undefined
						}
						footer={
							<Group justify='space-between' wrap='wrap'>
								<Button
									variant='subtle'
									leftSection={<IconPlus size={16} />}
									onClick={onReset}
								>
									{t('builder.reset')}
								</Button>
								<Group gap='xs'>
									<Button
										variant='light'
										leftSection={<IconDeviceFloppy size={16} />}
										onClick={handleSave}
									>
										{t('builder.save')}
									</Button>
									<Menu position='top-end' withinPortal>
										<Menu.Target>
											<Button leftSection={<IconDownload size={16} />}>
												{t('builder.generate')}
											</Button>
										</Menu.Target>
										<Menu.Dropdown>
											{draft.formats.map((format) => (
												<Menu.Item
													key={format}
													onClick={() => generateWith(format)}
												>
													{t('builder.generateAs', { format })}
												</Menu.Item>
											))}
										</Menu.Dropdown>
									</Menu>
								</Group>
							</Group>
						}
					>
						<Accordion multiple defaultValue={[...STEPS]} variant='separated'>
							<Accordion.Item value='audience'>
								<Accordion.Control>{t('steps.audience')}</Accordion.Control>
								<Accordion.Panel>
									<AudienceStep
										draft={draft}
										onChange={patch}
										nameError={shown.name}
										clientError={shown.client}
									/>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='period'>
								<Accordion.Control>{t('steps.period')}</Accordion.Control>
								<Accordion.Panel>
									<PeriodScopeStep
										role={role}
										draft={draft}
										onChange={patch}
										datesError={shown.dates}
									/>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='sections'>
								<Accordion.Control>{t('steps.sections')}</Accordion.Control>
								<Accordion.Panel>
									<SectionsStep
										draft={draft}
										onChange={patch}
										sectionsError={shown.sections}
									/>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='output'>
								<Accordion.Control>{t('steps.output')}</Accordion.Control>
								<Accordion.Panel>
									<OutputStep
										draft={draft}
										onChange={patch}
										formatsError={shown.formats}
									/>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					</SectionCard>
				</Grid.Col>

				<Grid.Col span={{ base: 12, xl: 7 }}>
					<SectionCard
						fullHeight
						title={t('preview.title')}
						description={t('preview.description')}
					>
						<ReportPreview data={data} />
					</SectionCard>
				</Grid.Col>
			</Grid>

			<Modal
				opened={saveOpen}
				onClose={() => setSaveOpen(false)}
				title={t('builder.saveTitle')}
				centered
			>
				<Stack gap='md'>
					<TextInput
						label={t('builder.saveName')}
						value={saveName}
						onChange={(event) => setSaveName(event.currentTarget.value)}
						data-autofocus
					/>
					<Group justify='flex-end'>
						<Button variant='subtle' onClick={() => setSaveOpen(false)}>
							{t('builder.reset')}
						</Button>
						<Button onClick={confirmSave}>{t('builder.save')}</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
};

export default BuilderTab;
