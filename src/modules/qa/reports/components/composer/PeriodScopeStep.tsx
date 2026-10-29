import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Badge,
	Button,
	Chip,
	Divider,
	Group,
	Menu,
	MultiSelect,
	SimpleGrid,
	Stack,
	Switch,
	Text,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconChevronDown } from '@tabler/icons-react';
import type { ReportDraft } from '~/models/qa/reportBuilder';
import type { QuickRange } from '~/modules/qa/analytics/types';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TEAM_CAMPAIGNS } from '~/modules/qa/team/mockData';
import { scopeAgents } from '~/modules/qa/analytics/helpers';
import type { RosterAgent, TeamRole } from '~/modules/qa/team/types';
import { TEAMS } from '~/modules/qa/rankings/constants';
import { agentsInScope } from '../../helpers';

const PRESETS: QuickRange[] = ['7d', '30d', '90d', '12m', 'custom'];

const PRESET_DAYS: Partial<Record<QuickRange, number>> = {
	'7d': 7,
	'30d': 30,
	'90d': 90,
	'12m': 365,
};

const toDay = (value: string | null): string | undefined =>
	value ? new Date(value).toISOString().slice(0, 10) : undefined;

/** One entry of an "add all agents from" menu. */
interface GroupShortcut {
	key: string;
	label: string;
	agentIds: string[];
}

interface PeriodScopeStepProps {
	role: TeamRole;
	draft: ReportDraft;
	onChange: (patch: Partial<ReportDraft>) => void;
	datesError?: string;
	/** Shown under the agent picker when the scope ends up with no agents. */
	scopeError?: string;
}

/** Whose calls go into the report (an agent group first, then filters that narrow it) and what window it covers. */
export const PeriodScopeStep: React.FC<PeriodScopeStepProps> = ({
	role,
	draft,
	onChange,
	datesError,
	scopeError,
}) => {
	const { t } = useTranslation('qa.reports');

	const roster = useMemo(() => scopeAgents(role), [role]);

	/** Agents the narrowing filters leave, ignoring any hand-picked ones. */
	const narrowedIds = useMemo(
		() =>
			new Set(
				agentsInScope(role, { ...draft.scope, agentIds: [] }).map(
					(agent) => agent.id
				)
			),
		[role, draft.scope]
	);
	const inScopeCount = useMemo(
		() => agentsInScope(role, draft.scope).length,
		[role, draft.scope]
	);

	// Selected agents stay in the list even when a filter would hide them, so their pills never vanish.
	const agentOptions = useMemo(
		() =>
			roster
				.filter(
					(agent) =>
						narrowedIds.has(agent.id) || draft.scope.agentIds.includes(agent.id)
				)
				.map((agent) => ({
					value: agent.id,
					label: `${agent.name} · ${agent.team}`,
				})),
		[roster, narrowedIds, draft.scope.agentIds]
	);

	const lineOptions = useMemo(
		() =>
			[...new Set(TEAM_CALLS.map((call) => call.lineOfBusiness))]
				.sort()
				.map((line) => ({ value: line, label: line })),
		[]
	);

	/** Only groups with at least one agent in the viewer's roster, so a supervisor sees their own team. */
	const shortcuts = useMemo(() => {
		const idsWhere = (test: (agent: RosterAgent) => boolean) =>
			roster.filter(test).map((agent) => agent.id);
		const teams: GroupShortcut[] = [...new Set(roster.map((a) => a.team))]
			.sort()
			.map((team) => ({
				key: team,
				label: team,
				agentIds: idsWhere((agent) => agent.team === team),
			}));
		const supervisors: GroupShortcut[] = [
			...new Map(roster.map((a) => [a.supervisorId, a.supervisorName])),
		].map(([id, name]) => ({
			key: id,
			label: name,
			agentIds: idsWhere((agent) => agent.supervisorId === id),
		}));
		const campaigns: GroupShortcut[] = TEAM_CAMPAIGNS.map((campaign) => ({
			key: campaign.id,
			label: campaign.name,
			agentIds: idsWhere((agent) => agent.campaignIds.includes(campaign.id)),
		})).filter((shortcut) => shortcut.agentIds.length > 0);
		return { teams, supervisors, campaigns };
	}, [roster]);

	const addAgents = (agentIds: string[]) =>
		onChange({
			scope: {
				...draft.scope,
				agentIds: [...new Set([...draft.scope.agentIds, ...agentIds])],
			},
		});

	const setPreset = (preset: QuickRange) => {
		const days = PRESET_DAYS[preset];
		onChange({
			period: {
				...draft.period,
				preset,
				...(days ? { from: addDays(TODAY, -(days - 1)), to: TODAY } : {}),
			},
		});
	};

	const shortcutMenu = (
		labelKey: string,
		entries: GroupShortcut[]
	): React.ReactNode => (
		<Menu withinPortal position='bottom-start' shadow='md'>
			<Menu.Target>
				<Button
					size='xs'
					variant='light'
					color='gray'
					rightSection={<IconChevronDown size={14} />}
				>
					{t(labelKey)}
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{entries.map((entry) => (
					<Menu.Item key={entry.key} onClick={() => addAgents(entry.agentIds)}>
						{entry.label} · {entry.agentIds.length}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);

	return (
		<Stack gap='lg'>
			<Stack gap='xs'>
				<Group justify='space-between' wrap='nowrap'>
					<Text size='sm' fw={500}>
						{t('scope.agents')}
					</Text>
					<Badge variant='light' color='gray' tt='none'>
						{t('scope.agentCount', {
							count: inScopeCount,
							total: roster.length,
						})}
					</Badge>
				</Group>

				<Group gap='xs' wrap='wrap'>
					<Text size='xs' c='dimmed'>
						{t('scope.addFrom')}
					</Text>
					{shortcutMenu('scope.addFromTeam', shortcuts.teams)}
					{shortcutMenu('scope.addFromSupervisor', shortcuts.supervisors)}
					{shortcutMenu('scope.addFromCampaign', shortcuts.campaigns)}
					{draft.scope.agentIds.length > 0 && (
						<Button
							size='compact-xs'
							variant='subtle'
							color='gray'
							onClick={() =>
								onChange({ scope: { ...draft.scope, agentIds: [] } })
							}
						>
							{t('scope.clearAgents')}
						</Button>
					)}
				</Group>

				<MultiSelect
					aria-label={t('scope.agents')}
					description={t('scope.agentsHint')}
					data={agentOptions}
					value={draft.scope.agentIds}
					onChange={(agentIds) =>
						onChange({ scope: { ...draft.scope, agentIds } })
					}
					clearable
					searchable
				/>
				{scopeError && (
					<Text size='xs' c='red'>
						{scopeError}
					</Text>
				)}
			</Stack>

			<Divider />

			<Stack gap='sm'>
				<Text size='sm' fw={500}>
					{t('scope.narrowLabel')}
				</Text>
				<MultiSelect
					label={t('scope.teams')}
					description={
						role === 'supervisor' ? t('scope.teamsLocked') : undefined
					}
					placeholder={t('scope.allTeams')}
					data={TEAMS}
					disabled={role === 'supervisor'}
					value={draft.scope.teams}
					onChange={(teams) => onChange({ scope: { ...draft.scope, teams } })}
					clearable
				/>

				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
					<MultiSelect
						label={t('scope.campaigns')}
						data={TEAM_CAMPAIGNS.map((campaign) => ({
							value: campaign.id,
							label: campaign.name,
						}))}
						value={draft.scope.campaignIds}
						onChange={(campaignIds) =>
							onChange({ scope: { ...draft.scope, campaignIds } })
						}
						clearable
						searchable
					/>
					<MultiSelect
						label={t('scope.linesOfBusiness')}
						data={lineOptions}
						value={draft.scope.linesOfBusiness}
						onChange={(linesOfBusiness) =>
							onChange({ scope: { ...draft.scope, linesOfBusiness } })
						}
						clearable
						searchable
					/>
				</SimpleGrid>
			</Stack>

			<Divider />

			<Stack gap='sm'>
				<Text size='sm' fw={500}>
					{t('period.label')}
				</Text>
				<Chip.Group
					value={draft.period.preset}
					onChange={(value) => setPreset(value as QuickRange)}
				>
					<Group gap='xs'>
						{PRESETS.map((preset) => (
							<Chip key={preset} value={preset} size='sm'>
								{t(`period.presets.${preset}`)}
							</Chip>
						))}
					</Group>
				</Chip.Group>

				{draft.period.preset === 'custom' && (
					<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
						<DateInput
							label={t('period.from')}
							value={new Date(`${draft.period.from}T00:00:00Z`)}
							error={datesError}
							onChange={(value: string | null) => {
								const day = toDay(value);
								if (day) onChange({ period: { ...draft.period, from: day } });
							}}
						/>
						<DateInput
							label={t('period.to')}
							value={new Date(`${draft.period.to}T00:00:00Z`)}
							onChange={(value: string | null) => {
								const day = toDay(value);
								if (day) onChange({ period: { ...draft.period, to: day } });
							}}
						/>
					</SimpleGrid>
				)}

				<Switch
					label={t('period.compare')}
					checked={draft.period.compareWithPrevious}
					onChange={(event) =>
						onChange({
							period: {
								...draft.period,
								compareWithPrevious: event.currentTarget.checked,
							},
						})
					}
				/>
			</Stack>
		</Stack>
	);
};

export default PeriodScopeStep;
