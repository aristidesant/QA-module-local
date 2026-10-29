import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Accordion,
	ActionIcon,
	Badge,
	Button,
	Grid,
	Group,
	Menu,
	Modal,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
	IconAlertCircle,
	IconCalendarEvent,
	IconChevronDown,
	IconDeviceFloppy,
	IconDownload,
	IconFileText,
	IconListCheck,
	IconPlus,
	IconSend,
	type Icon,
} from '@tabler/icons-react';
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
import { agentsInScope, stepSummaries, type BuilderStep } from '../helpers';
import { approximateSizeKb, csvFilename, toCsv } from '../exportCsv';
import AudienceStep from '../components/composer/AudienceStep';
import PeriodScopeStep from '../components/composer/PeriodScopeStep';
import SectionsStep from '../components/composer/SectionsStep';
import OutputStep from '../components/composer/OutputStep';
import ReportPreview from '../components/preview/ReportPreview';
import styles from '../Reports.module.css';

const PREVIEW_DEBOUNCE_MS = 300;
const STEPS: BuilderStep[] = ['audience', 'sections', 'period', 'output'];

const STEP_ICON: Record<BuilderStep, Icon> = {
	audience: IconFileText,
	sections: IconListCheck,
	period: IconCalendarEvent,
	output: IconSend,
};

/** Which validation errors belong to which step, so its header can flag them. */
const STEP_ERRORS: Record<BuilderStep, string[]> = {
	audience: ['name', 'client'],
	sections: ['sections'],
	period: ['dates', 'scope'],
	output: ['formats'],
};

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
	const [discardOpen, setDiscardOpen] = useState(false);
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
		if (agentsInScope(role, draft.scope).length === 0) {
			list.scope = t('builder.validation.scope');
		}
		return list;
	}, [draft, role, t]);

	const shown = touched ? errors : {};
	const invalid = Object.keys(errors).length > 0;
	const summaries = useMemo(
		() => stepSummaries(draft, role, t),
		[draft, role, t]
	);
	/** First shown error of a step, if any, for its header. */
	const stepError = (step: BuilderStep): string | undefined =>
		STEP_ERRORS[step].map((key) => shown[key]).find(Boolean);

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

	/** Unsaved edits ask before they are thrown away. */
	const handleReset = () => {
		if (touched) setDiscardOpen(true);
		else onReset();
	};
	const confirmDiscard = () => {
		setDiscardOpen(false);
		setTouched(false);
		onReset();
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

	const [firstFormat, ...otherFormats] = draft.formats;

	/** Number, icon, title, live summary and, once touched, the step's first error. */
	const stepControl = (step: BuilderStep) => {
		const StepIcon = STEP_ICON[step];
		const error = stepError(step);
		return (
			<Accordion.Control>
				<Group gap='sm' wrap='nowrap'>
					<Badge circle size='lg' variant='light' color='gray'>
						{STEPS.indexOf(step) + 1}
					</Badge>
					<ThemeIcon variant='light' color='gray' size='sm'>
						<StepIcon size={14} />
					</ThemeIcon>
					<div className={styles.stepSummary}>
						<Text size='sm' fw={500}>
							{t(`steps.${step}`)}
						</Text>
						<Text size='xs' c={error ? 'red' : 'dimmed'} lineClamp={1}>
							{error ?? summaries[step]}
						</Text>
					</div>
					{error && (
						<ThemeIcon variant='light' color='red' size='sm' aria-label={error}>
							<IconAlertCircle size={14} />
						</ThemeIcon>
					)}
				</Group>
			</Accordion.Control>
		);
	};

	return (
		<>
			<Grid gap='lg'>
				<Grid.Col span={{ base: 12, xl: 5 }}>
					<SectionCard
						fullHeight
						className={styles.builderCard}
						contentClassName={styles.builderScroll}
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
									onClick={handleReset}
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
									{/* Split button: the first chosen format runs directly, the rest sit in the menu. */}
									<Button.Group>
										<Button
											leftSection={<IconDownload size={16} />}
											onClick={() =>
												firstFormat ? generateWith(firstFormat) : handleSave()
											}
										>
											{firstFormat
												? t('builder.generateAs', { format: firstFormat })
												: t('builder.generate')}
										</Button>
										{otherFormats.length > 0 && (
											<Menu position='top-end' withinPortal>
												<Menu.Target>
													<ActionIcon
														variant='filled'
														size={36}
														aria-label={t('builder.generate')}
													>
														<IconChevronDown size={16} />
													</ActionIcon>
												</Menu.Target>
												<Menu.Dropdown>
													{otherFormats.map((format) => (
														<Menu.Item
															key={format}
															onClick={() => generateWith(format)}
														>
															{t('builder.generateAs', { format })}
														</Menu.Item>
													))}
												</Menu.Dropdown>
											</Menu>
										)}
									</Button.Group>
								</Group>
							</Group>
						}
					>
						<Accordion multiple defaultValue={[...STEPS]} variant='separated'>
							<Accordion.Item value='audience'>
								{stepControl('audience')}
								<Accordion.Panel>
									<AudienceStep
										draft={draft}
										onChange={patch}
										nameError={shown.name}
										clientError={shown.client}
									/>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='sections'>
								{stepControl('sections')}
								<Accordion.Panel>
									<SectionsStep
										draft={draft}
										onChange={patch}
										sectionsError={shown.sections}
									/>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='period'>
								{stepControl('period')}
								<Accordion.Panel>
									<PeriodScopeStep
										role={role}
										draft={draft}
										onChange={patch}
										datesError={shown.dates}
										scopeError={shown.scope}
									/>
								</Accordion.Panel>
							</Accordion.Item>

							<Accordion.Item value='output'>
								{stepControl('output')}
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
							{t('builder.keepEditing')}
						</Button>
						<Button onClick={confirmSave}>{t('builder.save')}</Button>
					</Group>
				</Stack>
			</Modal>

			<Modal
				opened={discardOpen}
				onClose={() => setDiscardOpen(false)}
				title={t('builder.discardTitle')}
				centered
			>
				<Stack gap='md'>
					<Text size='sm'>{t('builder.discardBody')}</Text>
					<Group justify='flex-end'>
						<Button variant='subtle' onClick={() => setDiscardOpen(false)}>
							{t('builder.keepEditing')}
						</Button>
						<Button color='red' onClick={confirmDiscard}>
							{t('builder.discard')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
};

export default BuilderTab;
