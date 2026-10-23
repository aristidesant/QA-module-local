import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Alert,
	Box,
	Button,
	Chip,
	Group,
	MultiSelect,
	NumberInput,
	SegmentedControl,
	Select,
	Stack,
	Switch,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { SectionCard } from '~/components/SectionCard';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import type {
	ProgramDraft,
	RankingMetricId,
	RankingMetricWeight,
	RankingProgram,
	RankingStatus,
	PrizeKind,
} from '~/models/qa/rankingPrograms';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import {
	useRankingsStore,
	selectPrograms,
	nextMilestoneId,
} from '~/stores/qa/rankingsStore';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TODAY } from '~/modules/qa/analytics/constants';
import {
	QA_MANAGER_PERSONA,
	SUPERVISOR_PERSONA,
} from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import { computeStandings, formatScore, overlappingDated } from '../helpers';
import { DEFAULT_METRIC, PRIZE_EMOJI, PRIZE_KINDS, TEAMS } from '../constants';
import {
	RANKING_METRIC_BY_ID,
	RANKING_METRIC_GROUPS,
	type RankingMetricArea,
} from '../metrics';
import { useMetricLabel } from '../useMetricLabel';
import styles from '../Rankings.module.css';

interface RankingFormProps {
	role: TeamRole;
	/** Editing an existing program, or null to create one. */
	program: RankingProgram | null;
	onClose: () => void;
	/** Called after saving, with the status the ranking was saved as. */
	onSaved: (status: RankingStatus) => void;
}

const iso = (date: Date | null) =>
	date ? dayjs(date).format('YYYY-MM-DD') : TODAY;

const emptyDraft = (role: TeamRole): ProgramDraft => ({
	name: '',
	description: '',
	teams: role === 'qa-manager' ? [] : ['Team 1'],
	metrics: [{ metricId: DEFAULT_METRIC, weight: 100 }],
	targetScore: 90,
	minCalls: 10,
	startDate: dayjs(TODAY).startOf('month').format('YYYY-MM-DD'),
	endDate: null,
	isDefault: false,
	prize: { kind: 'GIFT_CARD', title: '', description: '', icon: '🎁' },
	milestones: [],
	winnerBadgeId: null,
	allowReactions: true,
	status: 'draft',
	createdBy:
		role === 'qa-manager' ? QA_MANAGER_PERSONA.name : SUPERVISOR_PERSONA.name,
	createdByRole: role === 'qa-manager' ? 'QA_MANAGER' : 'SUPERVISOR',
});

/** Splits 100 % across the metrics, giving the remainder to the first ones. */
const evenWeights = (metrics: RankingMetricWeight[]): RankingMetricWeight[] => {
	const base = Math.floor(100 / metrics.length);
	const extra = 100 - base * metrics.length;
	return metrics.map((metric, index) => ({
		...metric,
		weight: base + (index < extra ? 1 : 0),
	}));
};

/**
 * Create or edit a ranking program. It can rank on one metric or combine
 * several with weights, run for a period or without an end date, and be
 * switched on once saved.
 */
export const RankingForm: React.FC<RankingFormProps> = ({
	role,
	program,
	onClose,
	onSaved,
}) => {
	const { t } = useTranslation('qa.rankings');
	const metricLabel = useMetricLabel();
	const programs = useRankingsStore(selectPrograms);
	const createProgram = useRankingsStore((s) => s.createProgram);
	const updateProgram = useRankingsStore((s) => s.updateProgram);
	const badges = useTriggerRulesStore((s) => s.badges);

	const form = useForm<ProgramDraft>({
		initialValues: program ? { ...program } : emptyDraft(role),
	});
	const draft = form.values;
	const [combined, setCombined] = useState(draft.metrics.length > 1);

	/** Updates fields and clears the errors of what the manager just touched. */
	const patch = (values: Partial<ProgramDraft>) => {
		form.setValues(values);
		Object.keys(values).forEach((key) => form.clearFieldError(key));
		if ('startDate' in values) form.clearFieldError('endDate');
		if ('metrics' in values) form.clearFieldError('metrics');
	};

	const permanent = draft.endDate === null;

	/** Business Insights stays QA Manager-only, so supervisors don't see it. */
	const metricData = useMemo(
		() =>
			RANKING_METRIC_GROUPS.filter(
				(group) => role === 'qa-manager' || group.area !== 'BUSINESS_INSIGHTS'
			).map((group) => ({
				group: t(`areas.${group.area}`),
				items: group.ids.map((id) => ({ value: id, label: metricLabel(id) })),
			})),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[role, t]
	);

	const setMode = (value: string) => {
		const wantsCombined = value === 'combined';
		setCombined(wantsCombined);
		if (!wantsCombined) {
			patch({
				metrics: [{ metricId: draft.metrics[0].metricId, weight: 100 }],
			});
			return;
		}
		if (draft.metrics.length < 2) {
			const taken = new Set(draft.metrics.map((m) => m.metricId));
			const next = (
				[
					'COMPLIANCE_OVERALL_SCORE',
					'CUSTOMER_SENTIMENT_SCORE',
					'OPS_AHT_SECONDS',
				] as RankingMetricId[]
			).find((id) => !taken.has(id));
			patch({
				metrics: evenWeights([
					...draft.metrics,
					{ metricId: next ?? 'OPS_CALLS_HANDLED', weight: 0 },
				]),
				targetScore: 75,
			});
		}
	};

	const patchMetric = (index: number, values: Partial<RankingMetricWeight>) =>
		patch({
			metrics: draft.metrics.map((metric, i) =>
				i === index ? { ...metric, ...values } : metric
			),
		});

	const weightTotal = draft.metrics.reduce((sum, m) => sum + m.weight, 0);

	const previewProgram = useMemo(
		() =>
			({
				...draft,
				id: 'preview',
				winnerId: null,
				winnerName: null,
				createdAt: TODAY,
				updatedAt: TODAY,
			}) as RankingProgram,
		[draft]
	);
	const previewStandings = useMemo(
		() =>
			draft.teams.length === 0 || weightTotal !== 100
				? []
				: computeStandings(previewProgram, TEAM_CALLS).slice(0, 5),
		[previewProgram, draft.teams.length, weightTotal]
	);

	const metricAreas = new Set<RankingMetricArea>(
		draft.metrics.map((m) => RANKING_METRIC_BY_ID[m.metricId].area)
	);
	const badgeOptions = badges
		.filter(
			(badge) =>
				badge.status === 'ACTIVE' &&
				(badge.area === 'GENERAL' ||
					metricAreas.has(badge.area as RankingMetricArea))
		)
		.map((badge) => ({
			value: badge.id,
			label: `${badge.icon} ${badge.name}`,
		}));

	const unit = RANKING_METRIC_BY_ID[draft.metrics[0].metricId]?.unit;
	const suffix = combined
		? ' pts'
		: unit === 'PERCENT'
			? '%'
			: unit === 'SCORE_5'
				? ' / 5'
				: unit === 'SECONDS'
					? ' s'
					: '';

	const isExisting = program !== null;
	const isPublished = isExisting && program.status !== 'draft';
	/** Publishing a dated ranking ends the dated one it overlaps for the same team. */
	const replaced = useMemo(
		() =>
			isPublished || permanent
				? null
				: overlappingDated(programs, {
						id: program?.id ?? '',
						teams: draft.teams,
						startDate: draft.startDate,
						endDate: draft.endDate,
					}),
		[
			isPublished,
			permanent,
			programs,
			draft.teams,
			draft.startDate,
			draft.endDate,
			program?.id,
		]
	);

	/** Marks each invalid field inline and reports whether the form can be saved. */
	const validate = (): boolean => {
		form.clearErrors();
		const errors: Record<string, string> = {};
		if (!draft.name.trim()) errors.name = t('editor.validation.name');
		if (draft.teams.length === 0) errors.teams = t('editor.validation.teams');
		if (draft.metrics.length === 0) {
			errors.metrics = t('editor.validation.metrics');
		} else if (weightTotal !== 100) {
			errors.metrics = t('editor.validation.weights');
		}
		if (draft.endDate !== null && draft.endDate <= draft.startDate) {
			errors.endDate = t('editor.validation.dates');
		}
		if (draft.targetScore <= 0) {
			errors.targetScore = t('editor.validation.target');
		}
		form.setErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSave = (status: ProgramDraft['status']) => {
		if (!validate()) {
			notifyWarning(t('editor.validation.fixFields'));
			return;
		}
		const next = { ...draft, status, isDefault: draft.isDefault && permanent };
		if (program) updateProgram(program.id, next);
		else createProgram(next);

		notifySuccess(
			status === 'active' && !isPublished
				? t('editor.launched')
				: t('editor.saved')
		);
		onSaved(status);
	};

	const handleClose = () => {
		if (form.isDirty()) {
			modals.openConfirmModal({
				title: t('editor.discard'),
				labels: {
					confirm: t('editor.discardConfirm'),
					cancel: t('editor.keepEditing'),
				},
				confirmProps: { color: 'red' },
				onConfirm: onClose,
			});
			return;
		}
		onClose();
	};

	const addMilestone = () =>
		patch({
			milestones: [
				...draft.milestones,
				{
					id: nextMilestoneId(),
					label: '',
					threshold: draft.targetScore,
					badgeId: badgeOptions[0]?.value ?? '',
				},
			],
		});

	const period = (from: dayjs.Dayjs, to: dayjs.Dayjs) =>
		patch({
			startDate: from.format('YYYY-MM-DD'),
			endDate: to.format('YYYY-MM-DD'),
		});

	return (
		<Stack gap='md'>
			<SectionCard title={t('editor.basics')} padding='md'>
				<Stack gap='sm'>
					<TextInput
						label={t('editor.name')}
						value={draft.name}
						error={form.errors.name}
						onChange={(e) => patch({ name: e.currentTarget.value })}
					/>
					<Textarea
						label={t('editor.description')}
						value={draft.description}
						onChange={(e) => patch({ description: e.currentTarget.value })}
						autosize
						minRows={2}
					/>
				</Stack>
			</SectionCard>

			<SectionCard title={t('editor.scope')} padding='md'>
				<MultiSelect
					label={t('editor.teams')}
					description={
						role === 'qa-manager' ? undefined : t('editor.teamsLocked')
					}
					data={TEAMS}
					value={draft.teams}
					error={form.errors.teams}
					onChange={(teams) => patch({ teams })}
					disabled={role !== 'qa-manager'}
					comboboxProps={{ withinPortal: true }}
				/>
			</SectionCard>

			<SectionCard
				title={t('editor.metrics')}
				description={t('editor.metricsHint')}
				padding='md'
			>
				<Stack gap='sm'>
					<SegmentedControl
						fullWidth
						value={combined ? 'combined' : 'single'}
						onChange={setMode}
						data={[
							{ value: 'single', label: t('editor.mode.single') },
							{ value: 'combined', label: t('editor.mode.combined') },
						]}
					/>

					{combined ? (
						<Stack gap='xs'>
							{draft.metrics.map((metric, index) => (
								<Group key={index} gap='xs' align='flex-end' wrap='nowrap'>
									<Select
										flex={1}
										label={index === 0 ? t('editor.metric') : undefined}
										data={metricData}
										value={metric.metricId}
										onChange={(value) =>
											value &&
											patchMetric(index, {
												metricId: value as RankingMetricId,
											})
										}
										allowDeselect={false}
										searchable
										comboboxProps={{ withinPortal: true }}
									/>
									<NumberInput
										w={110}
										label={index === 0 ? t('editor.weight') : undefined}
										value={metric.weight}
										onChange={(value) =>
											patchMetric(index, { weight: Number(value) || 0 })
										}
										suffix=' %'
										min={0}
										max={100}
									/>
									<ActionIcon
										variant='subtle'
										color='red'
										aria-label={t('editor.removeMetric')}
										disabled={draft.metrics.length <= 2}
										onClick={() =>
											patch({
												metrics: draft.metrics.filter((_, i) => i !== index),
											})
										}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Group>
							))}
							<Group justify='space-between'>
								<Group gap='xs'>
									<Button
										size='xs'
										variant='default'
										leftSection={<IconPlus size={14} />}
										onClick={() =>
											patch({
												metrics: [
													...draft.metrics,
													{ metricId: 'OPS_CALLS_HANDLED', weight: 0 },
												],
											})
										}
									>
										{t('editor.addMetric')}
									</Button>
									<Button
										size='xs'
										variant='subtle'
										onClick={() =>
											patch({ metrics: evenWeights(draft.metrics) })
										}
									>
										{t('editor.distribute')}
									</Button>
								</Group>
								<Text
									size='sm'
									fw={600}
									c={weightTotal === 100 ? undefined : 'red'}
								>
									{t('editor.weightsTotal', { value: weightTotal })}
								</Text>
							</Group>
						</Stack>
					) : (
						<Select
							label={t('editor.metric')}
							data={metricData}
							value={draft.metrics[0].metricId}
							onChange={(value) =>
								value &&
								patch({
									metrics: [
										{ metricId: value as RankingMetricId, weight: 100 },
									],
								})
							}
							allowDeselect={false}
							searchable
							comboboxProps={{ withinPortal: true }}
						/>
					)}
					{form.errors.metrics && (
						<Text size='sm' c='red'>
							{form.errors.metrics}
						</Text>
					)}

					<Group grow align='flex-start'>
						<NumberInput
							label={t('editor.target')}
							value={draft.targetScore}
							error={form.errors.targetScore}
							onChange={(value) => patch({ targetScore: Number(value) || 0 })}
							suffix={suffix}
							decimalScale={1}
							min={0}
						/>
						<NumberInput
							label={t('editor.minCalls')}
							value={draft.minCalls}
							onChange={(value) => patch({ minCalls: Number(value) || 0 })}
							min={0}
						/>
					</Group>
					<Switch
						label={t('editor.allowReactions')}
						description={t('editor.allowReactionsHint')}
						checked={draft.allowReactions}
						onChange={(e) => patch({ allowReactions: e.currentTarget.checked })}
					/>
				</Stack>
			</SectionCard>

			<SectionCard title={t('editor.duration')} padding='md'>
				<Stack gap='sm'>
					<DateInput
						label={t('editor.start')}
						value={new Date(draft.startDate)}
						onChange={(value) =>
							patch({ startDate: iso(value as Date | null) })
						}
						valueFormat='DD MMM YYYY'
						popoverProps={{ withinPortal: true }}
					/>
					<Switch
						label={t('editor.permanent')}
						description={t('editor.permanentHint')}
						checked={permanent}
						onChange={(e) =>
							patch(
								e.currentTarget.checked
									? { endDate: null }
									: {
											endDate: dayjs(draft.startDate)
												.endOf('month')
												.format('YYYY-MM-DD'),
											isDefault: false,
										}
							)
						}
					/>
					{permanent ? (
						<Switch
							label={t('editor.makeDefault')}
							description={t('editor.makeDefaultHint')}
							checked={draft.isDefault}
							onChange={(e) => patch({ isDefault: e.currentTarget.checked })}
						/>
					) : (
						<>
							<DateInput
								label={t('editor.end')}
								value={draft.endDate ? new Date(draft.endDate) : null}
								error={form.errors.endDate}
								onChange={(value) =>
									patch({ endDate: iso(value as Date | null) })
								}
								valueFormat='DD MMM YYYY'
								popoverProps={{ withinPortal: true }}
							/>
							<Group gap='xs'>
								<Chip
									size='sm'
									checked={false}
									onClick={() =>
										period(
											dayjs(TODAY).startOf('month'),
											dayjs(TODAY).endOf('month')
										)
									}
								>
									{t('editor.presets.thisMonth')}
								</Chip>
								<Chip
									size='sm'
									checked={false}
									onClick={() =>
										period(
											dayjs(TODAY).add(1, 'month').startOf('month'),
											dayjs(TODAY).add(1, 'month').endOf('month')
										)
									}
								>
									{t('editor.presets.nextMonth')}
								</Chip>
								<Chip
									size='sm'
									checked={false}
									onClick={() =>
										period(
											dayjs(TODAY).startOf('quarter' as never),
											dayjs(TODAY).endOf('quarter' as never)
										)
									}
								>
									{t('editor.presets.quarter')}
								</Chip>
							</Group>
						</>
					)}
				</Stack>
			</SectionCard>

			<SectionCard title={t('editor.prize')} padding='md'>
				<Stack gap='sm'>
					<Group grow>
						<Select
							label={t('editor.prizeKind')}
							data={PRIZE_KINDS.map((kind) => ({
								value: kind,
								label: t(`prizeKinds.${kind}`),
							}))}
							value={draft.prize.kind}
							onChange={(value) =>
								value &&
								patch({
									prize: { ...draft.prize, kind: value as PrizeKind },
								})
							}
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
						<Select
							label={t('editor.prizeIcon')}
							data={PRIZE_EMOJI.map((emoji) => ({
								value: emoji,
								label: emoji,
							}))}
							value={draft.prize.icon}
							onChange={(value) =>
								value && patch({ prize: { ...draft.prize, icon: value } })
							}
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
					</Group>
					<TextInput
						label={t('editor.prizeTitle')}
						value={draft.prize.title}
						onChange={(e) =>
							patch({
								prize: { ...draft.prize, title: e.currentTarget.value },
							})
						}
					/>
					<TextInput
						label={t('editor.prizeDescription')}
						value={draft.prize.description}
						onChange={(e) =>
							patch({
								prize: { ...draft.prize, description: e.currentTarget.value },
							})
						}
					/>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('editor.milestones')}
				padding='md'
				headerActions={
					<Button
						size='xs'
						variant='default'
						leftSection={<IconPlus size={14} />}
						onClick={addMilestone}
						disabled={badgeOptions.length === 0}
					>
						{t('editor.addMilestone')}
					</Button>
				}
			>
				<Stack gap='sm'>
					{draft.milestones.map((milestone, index) => (
						<div key={milestone.id} className={styles.milestoneRow}>
							<TextInput
								label={index === 0 ? t('editor.milestoneLabel') : undefined}
								value={milestone.label}
								onChange={(e) =>
									patch({
										milestones: draft.milestones.map((m) =>
											m.id === milestone.id
												? { ...m, label: e.currentTarget.value }
												: m
										),
									})
								}
							/>
							<NumberInput
								label={index === 0 ? t('editor.milestoneThreshold') : undefined}
								value={milestone.threshold}
								onChange={(value) =>
									patch({
										milestones: draft.milestones.map((m) =>
											m.id === milestone.id
												? { ...m, threshold: Number(value) || 0 }
												: m
										),
									})
								}
								decimalScale={1}
							/>
							<Select
								label={index === 0 ? t('editor.milestoneBadge') : undefined}
								data={badgeOptions}
								value={milestone.badgeId}
								onChange={(value) =>
									patch({
										milestones: draft.milestones.map((m) =>
											m.id === milestone.id ? { ...m, badgeId: value ?? '' } : m
										),
									})
								}
								comboboxProps={{ withinPortal: true }}
							/>
							<ActionIcon
								variant='subtle'
								color='red'
								onClick={() =>
									patch({
										milestones: draft.milestones.filter(
											(m) => m.id !== milestone.id
										),
									})
								}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</div>
					))}
					<Select
						label={t('editor.winnerBadge')}
						placeholder={t('editor.noBadge')}
						data={badgeOptions}
						value={draft.winnerBadgeId}
						onChange={(value) => patch({ winnerBadgeId: value })}
						clearable
						disabled={permanent}
						description={permanent ? t('editor.winnerBadgeDated') : undefined}
						comboboxProps={{ withinPortal: true }}
					/>
				</Stack>
			</SectionCard>

			<SectionCard
				title={t('editor.preview')}
				description={t('editor.previewHint')}
				padding='md'
			>
				{previewStandings.every((s) => s.rank === null) ? (
					<Text size='sm' c='dimmed'>
						{weightTotal !== 100
							? t('editor.validation.weights')
							: t('editor.previewEmpty')}
					</Text>
				) : (
					<Stack gap='xs'>
						{previewStandings.map((standing) => (
							<Group key={standing.agentId} justify='space-between'>
								<Text size='sm'>
									{standing.rank === null ? '—' : `#${standing.rank}`}{' '}
									{standing.agentName}
								</Text>
								<Text size='sm' fw={600}>
									{formatScore(previewProgram, standing.score)}
								</Text>
							</Group>
						))}
					</Stack>
				)}
			</SectionCard>

			{replaced && (
				<Alert variant='light' color='gray' icon={<IconInfoCircle size={18} />}>
					{t('card.replaces', {
						name: replaced.name,
						teams: replaced.teams.join(', '),
					})}
				</Alert>
			)}

			{/* Pinned to the viewport so the actions stay in reach on this long form. */}
			<Box className={styles.stickyActions}>
				<Group justify='flex-end' gap='xs'>
					<Button variant='subtle' onClick={handleClose}>
						{t('editor.cancel')}
					</Button>
					{isPublished ? (
						<Button
							variant={program.status === 'inactive' ? 'default' : 'filled'}
							onClick={() => handleSave(program.status)}
						>
							{t('editor.save')}
						</Button>
					) : (
						<Button variant='light' onClick={() => handleSave('draft')}>
							{t('editor.saveDraft')}
						</Button>
					)}
					{!isPublished && (
						<Button onClick={() => handleSave('active')}>
							{' '}
							{t('editor.publish')}
						</Button>
					)}
				</Group>
			</Box>
		</Stack>
	);
};

export default RankingForm;
