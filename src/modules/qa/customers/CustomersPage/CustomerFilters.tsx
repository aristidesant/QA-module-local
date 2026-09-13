import { Button, Group, Select, Switch, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import type { CustomerFilters as CustomerFiltersState } from '../types';
import { CHURN_META, RECEPTIVENESS_META, SEGMENT_META, STATUS_META } from '../constants';

const DEFAULT_FILTERS: CustomerFiltersState = { search: '', segment: 'all', status: 'all', receptiveness: 'all', churnRisk: 'all', agentId: 'all', dncOnly: false };

interface CustomerFiltersProps {
	role: TeamRole;
	value: CustomerFiltersState;
	onChange: (value: CustomerFiltersState) => void;
}

export function CustomerFilters({ role, value, onChange }: CustomerFiltersProps) {
	const { t } = useTranslation('qa.customers');

	const isDefault =
		value.search === DEFAULT_FILTERS.search
		&& value.segment === DEFAULT_FILTERS.segment
		&& value.status === DEFAULT_FILTERS.status
		&& value.receptiveness === DEFAULT_FILTERS.receptiveness
		&& value.churnRisk === DEFAULT_FILTERS.churnRisk
		&& value.agentId === DEFAULT_FILTERS.agentId
		&& value.dncOnly === DEFAULT_FILTERS.dncOnly;

	const visibleAgents = role === 'qa-manager' ? TEAM_AGENTS : TEAM_AGENTS.filter((a) => a.supervisorId === SUPERVISOR_PERSONA.id);

	return (
		<Group gap='sm' wrap='wrap'>
			<TextInput
				leftSection={<IconSearch size={16} />}
				placeholder={t('list.filters.search')}
				value={value.search}
				onChange={(e) => onChange({ ...value, search: e.currentTarget.value })}
				w={280}
			/>
			<Select
				placeholder={t('list.filters.segment')}
				value={value.segment}
				onChange={(v) => onChange({ ...value, segment: (v as CustomerFiltersState['segment']) ?? 'all' })}
				data={[{ value: 'all', label: t('list.filters.all') }, ...Object.entries(SEGMENT_META).map(([key, meta]) => ({ value: key, label: t(meta.labelKey) }))]}
				allowDeselect={false}
				w={160}
			/>
			<Select
				placeholder={t('list.filters.status')}
				value={value.status}
				onChange={(v) => onChange({ ...value, status: (v as CustomerFiltersState['status']) ?? 'all' })}
				data={[{ value: 'all', label: t('list.filters.all') }, ...Object.entries(STATUS_META).map(([key, meta]) => ({ value: key, label: t(meta.labelKey) }))]}
				allowDeselect={false}
				w={160}
			/>
			<Select
				placeholder={t('list.filters.receptiveness')}
				value={value.receptiveness}
				onChange={(v) => onChange({ ...value, receptiveness: (v as CustomerFiltersState['receptiveness']) ?? 'all' })}
				data={[{ value: 'all', label: t('list.filters.all') }, ...Object.entries(RECEPTIVENESS_META).map(([key, meta]) => ({ value: key, label: t(meta.labelKey) }))]}
				allowDeselect={false}
				w={170}
			/>
			<Select
				placeholder={t('list.filters.churn')}
				value={value.churnRisk}
				onChange={(v) => onChange({ ...value, churnRisk: (v as CustomerFiltersState['churnRisk']) ?? 'all' })}
				data={[{ value: 'all', label: t('list.filters.all') }, ...Object.entries(CHURN_META).map(([key, meta]) => ({ value: key, label: t(meta.labelKey) }))]}
				allowDeselect={false}
				w={160}
			/>
			<Select
				placeholder={t('list.filters.agent')}
				value={value.agentId}
				onChange={(v) => onChange({ ...value, agentId: v ?? 'all' })}
				data={[{ value: 'all', label: t('list.filters.all') }, ...visibleAgents.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` }))]}
				allowDeselect={false}
				w={220}
				searchable
			/>
			<Switch
				label={t('list.filters.dncOnly')}
				checked={value.dncOnly}
				onChange={(e) => onChange({ ...value, dncOnly: e.currentTarget.checked })}
			/>
			{!isDefault && (
				<Button variant='subtle' size='xs' onClick={() => onChange(DEFAULT_FILTERS)}>
					{t('list.filters.clear')}
				</Button>
			)}
		</Group>
	);
}
