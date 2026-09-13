import { Button, Group, Select, Switch, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { TeamFilters as TeamFiltersState, TeamRole } from '../types';
import { TEAM_CAMPAIGNS, TEAM_SUPERVISORS } from '../mockData';

const DEFAULT_FILTERS: TeamFiltersState = { search: '', status: 'all', campaignId: 'all', supervisorId: 'all', riskOnly: false };

interface TeamFiltersProps {
	role: TeamRole;
	value: TeamFiltersState;
	onChange: (value: TeamFiltersState) => void;
}

export function TeamFilters({ role, value, onChange }: TeamFiltersProps) {
	const { t } = useTranslation('qa.team');

	const isDefault =
		value.search === DEFAULT_FILTERS.search
		&& value.status === DEFAULT_FILTERS.status
		&& value.campaignId === DEFAULT_FILTERS.campaignId
		&& value.supervisorId === DEFAULT_FILTERS.supervisorId
		&& value.riskOnly === DEFAULT_FILTERS.riskOnly;

	return (
		<Group gap='sm' wrap='wrap'>
			<TextInput
				leftSection={<IconSearch size={16} />}
				placeholder={t('team.filters.search')}
				value={value.search}
				onChange={(e) => onChange({ ...value, search: e.currentTarget.value })}
				w={260}
			/>
			<Select
				placeholder={t('team.filters.status')}
				value={value.status}
				onChange={(v) => onChange({ ...value, status: (v as TeamFiltersState['status']) ?? 'all' })}
				data={[
					{ value: 'all', label: t('team.filters.all') },
					{ value: 'active', label: t('status.active') },
					{ value: 'on-leave', label: t('status.on-leave') },
					{ value: 'training', label: t('status.training') },
				]}
				allowDeselect={false}
				w={160}
			/>
			<Select
				placeholder={t('team.filters.campaign')}
				value={value.campaignId}
				onChange={(v) => onChange({ ...value, campaignId: v ?? 'all' })}
				data={[
					{ value: 'all', label: t('team.filters.all') },
					...TEAM_CAMPAIGNS.map((c) => ({ value: c.id, label: c.name })),
				]}
				allowDeselect={false}
				w={200}
			/>
			{role === 'qa-manager' && (
				<Select
					placeholder={t('team.filters.supervisor')}
					value={value.supervisorId}
					onChange={(v) => onChange({ ...value, supervisorId: v ?? 'all' })}
					data={[
						{ value: 'all', label: t('team.filters.all') },
						...TEAM_SUPERVISORS.map((s) => ({ value: s.id, label: `${s.name} — ${s.team}` })),
					]}
					allowDeselect={false}
					w={220}
				/>
			)}
			<Switch
				label={t('team.filters.riskOnly')}
				checked={value.riskOnly}
				onChange={(e) => onChange({ ...value, riskOnly: e.currentTarget.checked })}
			/>
			{!isDefault && (
				<Button variant='subtle' size='xs' onClick={() => onChange(DEFAULT_FILTERS)}>
					{t('team.filters.clear')}
				</Button>
			)}
		</Group>
	);
}
