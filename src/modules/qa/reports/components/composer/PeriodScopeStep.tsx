import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Chip,
	Group,
	MultiSelect,
	Select,
	SimpleGrid,
	Stack,
	Switch,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { ReportDraft, ReportGroupBy } from '~/models/qa/reportBuilder';
import type { QuickRange } from '~/modules/qa/analytics/types';
import { TODAY, addDays } from '~/modules/qa/analytics/constants';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TEAM_CAMPAIGNS } from '~/modules/qa/team/mockData';
import { scopeAgents } from '~/modules/qa/analytics/helpers';
import type { TeamRole } from '~/modules/qa/team/types';
import { TEAMS } from '~/modules/qa/rankings/constants';

const PRESETS: QuickRange[] = ['7d', '30d', '90d', 'custom'];
const GROUP_BY: ReportGroupBy[] = [
	'none',
	'team',
	'supervisor',
	'agent',
	'campaign',
	'lineOfBusiness',
];

const PRESET_DAYS: Partial<Record<QuickRange, number>> = {
	'7d': 7,
	'30d': 30,
	'90d': 90,
};

const toDay = (value: string | null): string | undefined =>
	value ? new Date(value).toISOString().slice(0, 10) : undefined;

interface PeriodScopeStepProps {
	role: TeamRole;
	draft: ReportDraft;
	onChange: (patch: Partial<ReportDraft>) => void;
	datesError?: string;
}

/** What window the report covers and whose calls go into it. */
export const PeriodScopeStep: React.FC<PeriodScopeStepProps> = ({
	role,
	draft,
	onChange,
	datesError,
}) => {
	const { t } = useTranslation('qa.reports');

	const agentOptions = useMemo(
		() =>
			scopeAgents(role).map((agent) => ({
				value: agent.id,
				label: `${agent.name} · ${agent.team}`,
			})),
		[role]
	);

	const lineOptions = useMemo(
		() =>
			[...new Set(TEAM_CALLS.map((call) => call.lineOfBusiness))]
				.sort()
				.map((line) => ({ value: line, label: line })),
		[]
	);

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

	return (
		<Stack gap='md'>
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

			<MultiSelect
				label={t('scope.teams')}
				description={role === 'supervisor' ? t('scope.teamsLocked') : undefined}
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

			<MultiSelect
				label={t('scope.agents')}
				data={agentOptions}
				value={draft.scope.agentIds}
				onChange={(agentIds) =>
					onChange({ scope: { ...draft.scope, agentIds } })
				}
				clearable
				searchable
			/>

			<Select
				label={t('scope.groupBy')}
				data={GROUP_BY.map((value) => ({
					value,
					label: t(`scope.groupByOptions.${value}`),
				}))}
				value={draft.groupBy}
				onChange={(value) =>
					value && onChange({ groupBy: value as ReportGroupBy })
				}
				allowDeselect={false}
			/>
		</Stack>
	);
};

export default PeriodScopeStep;
