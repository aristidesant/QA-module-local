import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Alert,
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
import { IconAlertTriangle, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { AppDrawer } from '~/components/AppDrawer';
import SectionCard from '~/components/SectionCard';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import type {
	ProgramDraft,
	RankingEvaluationType,
	RankingProgram,
	PrizeKind,
} from '~/models/qa/rankingPrograms';
import type { TriggerMetricId } from '~/models/qa/triggerRules';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import { METRIC_BY_ID } from '~/modules/qa/triggers/constants';
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
import { computeStandings, conflictingProgram, formatScore } from '../helpers';
import {
	AREA_OF_TYPE,
	DEFAULT_METRIC,
	PRIZE_EMOJI,
	PRIZE_KINDS,
	RANKING_METRICS,
	TEAMS,
} from '../constants';
import styles from '../Rankings.module.css';

interface RankingEditorDrawerProps {
	opened: boolean;
	onClose: () => void;
	role: TeamRole;
	/** Editing an existing program, or null to create one. */
	program: RankingProgram | null;
}

const iso = (date: Date | null) =>
	date ? dayjs(date).format('YYYY-MM-DD') : TODAY;

const emptyDraft = (role: TeamRole): ProgramDraft => ({
	name: '',
	description: '',
	teams: role === 'qa-manager' ? [] : ['Team 1'],
	evaluationType: 'qa',
	metricId: DEFAULT_METRIC.qa,
	targetScore: 90,
	minCalls: 10,
	startDate: dayjs(TODAY).startOf('month').format('YYYY-MM-DD'),
	endDate: dayjs(TODAY).endOf('month').format('YYYY-MM-DD'),
	prize: { kind: 'GIFT_CARD', title: '', description: '', icon: '🎁' },
	milestones: [],
	winnerBadgeId: null,
	allowReactions: true,
	status: 'draft',
	createdBy:
		role === 'qa-manager' ? QA_MANAGER_PERSONA.name : SUPERVISOR_PERSONA.name,
	createdByRole: role === 'qa-manager' ? 'QA_MANAGER' : 'SUPERVISOR',
});

/** Create or edit a ranking program, with a live conflict check and preview. */
export const RankingEditorDrawer: React.FC<RankingEditorDrawerProps> = ({
	opened,
	onClose,
	role,
	program,
}) => {
	const { t } = useTranslation('qa.rankings');
	const { t: tMetrics } = useTranslation('qa.teamAnalytics');
	const programs = useRankingsStore(selectPrograms);
	const createProgram = useRankingsStore((s) => s.createProgram);
	const updateProgram = useRankingsStore((s) => s.updateProgram);
	const endProgram = useRankingsStore((s) => s.endProgram);
	const badges = useTriggerRulesStore((s) => s.badges);

	const [draft, setDraft] = useState<ProgramDraft>(emptyDraft(role));

	useEffect(() => {
		if (!opened) return;
		setDraft(program ? { ...program } : emptyDraft(role));
	}, [opened, program, role]);

	const patch = (values: Partial<ProgramDraft>) =>
		setDraft((current) => ({ ...current, ...values }));

	/** Switching the evaluation type resets the metric to that view's primary. */
	const setType = (type: RankingEvaluationType) =>
		patch({ evaluationType: type, metricId: DEFAULT_METRIC[type] });

	const conflict = useMemo(
		() =>
			conflictingProgram(
				programs,
				draft.teams,
				draft.startDate,
				draft.endDate,
				program?.id
			),
		[programs, draft.teams, draft.startDate, draft.endDate, program?.id]
	);

	const previewStandings = useMemo(
		() =>
			draft.teams.length === 0
				? []
				: computeStandings(
						{
							...draft,
							id: 'preview',
							winnerId: null,
							winnerName: null,
							createdAt: TODAY,
							updatedAt: TODAY,
						},
						TEAM_CALLS
					).slice(0, 5),
		[draft]
	);

	const areaBadges = badges.filter(
		(badge) =>
			badge.status === 'ACTIVE' &&
			(badge.area === AREA_OF_TYPE[draft.evaluationType] ||
				badge.area === 'GENERAL')
	);
	const badgeOptions = areaBadges.map((badge) => ({
		value: badge.id,
		label: `${badge.icon} ${badge.name}`,
	}));

	/** Supervisors don't rank on Business Insights — that view stays QA Manager-only. */
	const evaluationTypeOptions =
		role === 'supervisor'
			? CALL_EVALUATION_TABS.filter((tab) => tab.key !== 'business-insights')
			: CALL_EVALUATION_TABS;

	const unit = METRIC_BY_ID[draft.metricId]?.unit;
	const suffix = unit === 'PERCENT' ? '%' : unit === 'SCORE_5' ? ' / 5' : '';
	const scheduled = draft.startDate > TODAY;

	const validate = (): string | null => {
		if (!draft.name.trim()) return t('editor.validation.name');
		if (draft.teams.length === 0) return t('editor.validation.teams');
		if (draft.endDate <= draft.startDate) return t('editor.validation.dates');
		if (draft.targetScore <= 0) return t('editor.validation.target');
		return null;
	};

	const save = (status: ProgramDraft['status']) => {
		const error = validate();
		if (error) {
			notifyWarning(error);
			return;
		}
		const next = { ...draft, status };
		const result = program
			? updateProgram(program.id, next)
			: createProgram(next);

		if (!result.ok) {
			notifyWarning(
				t('editor.conflict', {
					name: result.conflict.name,
					teams: result.conflict.teams.join(', '),
					from: result.conflict.startDate,
					to: result.conflict.endDate,
				})
			);
			return;
		}
		notifySuccess(
			status === 'draft'
				? t('editor.saved')
				: scheduled
					? t('editor.scheduled')
					: t('editor.launched')
		);
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
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='xl'
			title={program ? t('editor.titleEdit') : t('editor.titleNew')}
		>
			<Stack gap='lg'>
				<SectionCard title={t('editor.basics')}>
					<Stack gap='sm'>
						<TextInput
							label={t('editor.name')}
							value={draft.name}
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

				<SectionCard title={t('editor.scope')}>
					<MultiSelect
						label={t('editor.teams')}
						description={
							role === 'qa-manager' ? undefined : t('editor.teamsLocked')
						}
						data={TEAMS}
						value={draft.teams}
						onChange={(teams) => patch({ teams })}
						disabled={role !== 'qa-manager'}
						comboboxProps={{ withinPortal: true }}
					/>
				</SectionCard>

				<SectionCard title={t('editor.evaluation')}>
					<Stack gap='sm'>
						<SegmentedControl
							fullWidth
							value={draft.evaluationType}
							onChange={(value) => setType(value as RankingEvaluationType)}
							data={evaluationTypeOptions.map((tab) => ({
								value: tab.key,
								label: t(`types.${tab.key}`),
							}))}
						/>
						<Select
							label={t('editor.metric')}
							data={RANKING_METRICS[draft.evaluationType].map((id) => ({
								value: id,
								label: tMetrics(`metrics.${id}`),
							}))}
							value={draft.metricId}
							onChange={(value) =>
								value && patch({ metricId: value as TriggerMetricId })
							}
							allowDeselect={false}
							comboboxProps={{ withinPortal: true }}
						/>
						<Group grow>
							<NumberInput
								label={t('editor.target')}
								value={draft.targetScore}
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
							onChange={(e) =>
								patch({ allowReactions: e.currentTarget.checked })
							}
						/>
					</Stack>
				</SectionCard>

				<SectionCard title={t('editor.period')}>
					<Stack gap='sm'>
						<Group grow>
							<DateInput
								label={t('editor.start')}
								value={new Date(draft.startDate)}
								onChange={(value) =>
									patch({ startDate: iso(value as Date | null) })
								}
								valueFormat='DD MMM YYYY'
								popoverProps={{ withinPortal: true }}
							/>
							<DateInput
								label={t('editor.end')}
								value={new Date(draft.endDate)}
								onChange={(value) =>
									patch({ endDate: iso(value as Date | null) })
								}
								valueFormat='DD MMM YYYY'
								popoverProps={{ withinPortal: true }}
							/>
						</Group>
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
					</Stack>
				</SectionCard>

				<SectionCard title={t('editor.prize')}>
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
					headerActions={
						<Button
							size='xs'
							variant='light'
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
									label={
										index === 0 ? t('editor.milestoneThreshold') : undefined
									}
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
												m.id === milestone.id
													? { ...m, badgeId: value ?? '' }
													: m
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
							comboboxProps={{ withinPortal: true }}
						/>
					</Stack>
				</SectionCard>

				<SectionCard
					title={t('editor.preview')}
					description={t('editor.previewHint')}
				>
					{conflict ? (
						<Alert
							color='red'
							icon={<IconAlertTriangle size={18} />}
							title={t('editor.conflict', {
								name: conflict.name,
								teams: conflict.teams.join(', '),
								from: conflict.startDate,
								to: conflict.endDate,
							})}
						>
							<Button
								size='xs'
								variant='light'
								color='red'
								onClick={() => endProgram(conflict.id)}
							>
								{t('editor.endConflict')}
							</Button>
						</Alert>
					) : previewStandings.every((s) => s.rank === null) ? (
						<Text size='sm' c='dimmed'>
							{t('editor.previewEmpty')}
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
										{formatScore(
											{ ...draft, id: 'preview' } as RankingProgram,
											standing.score
										)}
									</Text>
								</Group>
							))}
						</Stack>
					)}
				</SectionCard>

				<Group justify='flex-end' gap='sm'>
					<Button variant='subtle' onClick={onClose}>
						{t('editor.cancel')}
					</Button>
					<Button variant='light' onClick={() => save('draft')}>
						{t('editor.saveDraft')}
					</Button>
					<Button onClick={() => save('active')} disabled={Boolean(conflict)}>
						{scheduled ? t('editor.schedule') : t('editor.launch')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
};

export default RankingEditorDrawer;
