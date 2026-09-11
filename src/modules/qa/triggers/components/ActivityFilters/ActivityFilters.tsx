import {
	ActionIcon, Group, Select, SegmentedControl, Stack, TextInput, Button,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { ActivityStatus, RuleKind } from '~/models/qa';
import { FilterContainer } from '~/components/FilterContainer';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { TRIGGER_AGENT_OPTIONS } from '~/modules/qa/triggers/mockData';
import { ACTIVITY_STATUS_COLORS } from '~/modules/qa/triggers/constants';

export interface ActivityFiltersValues {
	search: string;
	kind: RuleKind | 'ALL';
	ruleId: string | null;
	agentId: string | null;
	status: ActivityStatus | null;
	from: Date | null;
	to: Date | null;
}

interface ActivityFiltersProps {
	values: ActivityFiltersValues;
	onChange: (values: ActivityFiltersValues) => void;
	onClear: () => void;
}

const defaultValues: ActivityFiltersValues = {
	search: '',
	kind: 'ALL',
	ruleId: null,
	agentId: null,
	status: null,
	from: null,
	to: null,
};

export default function ActivityFilters({ values, onChange, onClear }: ActivityFiltersProps) {
	const { t } = useTranslation('qa.triggers');
	const rules = useTriggerRulesStore((s) => s.rules);

	const hasActiveFilters = JSON.stringify(values) !== JSON.stringify(defaultValues);

	const ruleOptions = rules.map((r) => ({ value: r.id, label: r.name }));
	const statusOptions = (Object.keys(ACTIVITY_STATUS_COLORS) as ActivityStatus[]).map((s) => ({
		value: s,
		label: t(`activity.filters.${s.toLowerCase()}`),
	}));

	return (
		<FilterContainer>
			<Stack gap="sm">
				<Group grow align="flex-end">
					<TextInput
						placeholder={t('activity.filters.search')}
						leftSection={<IconSearch size={16} />}
						rightSection={
							values.search && (
								<ActionIcon
									size="xs"
									variant="transparent"
									onClick={() => onChange({ ...values, search: '' })}
								>
									<IconX size={14} />
								</ActionIcon>
							)
						}
						size="sm"
						value={values.search}
						onChange={(e) => onChange({ ...values, search: e.currentTarget.value })}
					/>
					<SegmentedControl
						value={values.kind}
						onChange={(kind) => onChange({ ...values, kind: kind as RuleKind | 'ALL' })}
						data={[
							{ value: 'ALL', label: t('activity.filters.all') },
							{ value: 'ALERT', label: t('page.tabs.alerts') },
							{ value: 'RECOGNITION', label: t('page.tabs.recognition') },
						]}
						size="sm"
					/>
					<Select
						placeholder={t('activity.filters.rule')}
						data={ruleOptions}
						searchable
						clearable
						size="sm"
						value={values.ruleId}
						onChange={(ruleId) => onChange({ ...values, ruleId })}
					/>
					<Select
						placeholder={t('activity.filters.agent')}
						data={TRIGGER_AGENT_OPTIONS}
						searchable
						clearable
						size="sm"
						value={values.agentId}
						onChange={(agentId) => onChange({ ...values, agentId })}
					/>
				</Group>

				<Group grow align="flex-end">
					<Select
						placeholder={t('activity.filters.status')}
						data={statusOptions}
						clearable
						size="sm"
						value={values.status}
						onChange={(status) => onChange({ ...values, status: status as ActivityStatus | null })}
					/>
					<DateInput
						placeholder={t('activity.filters.from')}
						valueFormat="DD MMM YYYY"
						clearable
						size="sm"
						value={values.from}
						onChange={(value: string | null) => onChange({ ...values, from: value ? new Date(value) : null })}
					/>
					<DateInput
						placeholder={t('activity.filters.to')}
						valueFormat="DD MMM YYYY"
						clearable
						size="sm"
						value={values.to}
						onChange={(value: string | null) => onChange({ ...values, to: value ? new Date(value) : null })}
					/>
					{hasActiveFilters && (
						<Button
							variant="light"
							size="sm"
							leftSection={<IconX size={14} />}
							onClick={onClear}
						>
							{t('activity.filters.clear')}
						</Button>
					)}
				</Group>
			</Stack>
		</FilterContainer>
	);
}
