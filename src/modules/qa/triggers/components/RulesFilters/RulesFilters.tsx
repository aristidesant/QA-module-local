import { ActionIcon, Button, Group, SegmentedControl, Select, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import type { EvaluationArea, RuleKind, RuleRecipient, RuleStatus, RuleType } from '~/models/qa';
import { EVALUATION_AREAS, RECIPIENTS } from '~/modules/qa/triggers/constants';
import { ruleTypesForKind } from '~/modules/qa/triggers/helpers';
import { FilterContainer } from '~/components/FilterContainer';

export interface RulesFilterValues {
	search: string;
	type: RuleType | null;
	area: EvaluationArea | null;
	status: RuleStatus | 'ALL';
	recipient: RuleRecipient | null;
}

const defaultFilters: RulesFilterValues = {
	search: '',
	type: null,
	area: null,
	status: 'ALL',
	recipient: null,
};

interface RulesFiltersProps {
	kind: RuleKind;
	values: RulesFilterValues;
	onChange: (values: RulesFilterValues) => void;
	onClear: () => void;
}

export default function RulesFilters({ kind, values, onChange, onClear }: RulesFiltersProps) {
	const { t } = useTranslation('qa.triggers');

	const isFiltered = JSON.stringify(values) !== JSON.stringify(defaultFilters);

	// Memoize options arrays to prevent unnecessary Select component re-renders
	const typeOptions = useMemo(() => ruleTypesForKind(kind).map((type) => ({
		value: type,
		label: t(`types.${type}.label`),
	})), [kind, t]);

	const areaOptions = useMemo(() => EVALUATION_AREAS.map((area) => ({
		value: area,
		label: t(`areas.${area}`),
	})), [t]);

	const recipientOptions = useMemo(() => RECIPIENTS.map((recipient) => ({
		value: recipient,
		label: t(`recipients.${recipient}`),
	})), [t]);

	return (
		<>
			<FilterContainer>
				<Group grow align="flex-end">
					<TextInput
						size="sm"
						placeholder={t('rules.filters.search')}
						leftSection={<IconSearch size={14} />}
						value={values.search}
						onChange={(e) => onChange({ ...values, search: e.currentTarget.value })}
						rightSection={
							values.search ? (
								<ActionIcon
									size="xs"
									color="gray"
									radius="xl"
									variant="transparent"
									onClick={() => onChange({ ...values, search: '' })}
								>
									<IconX size={14} />
								</ActionIcon>
							) : null
						}
					/>
					<Select
						size="sm"
						placeholder={t('rules.filters.type')}
						data={typeOptions}
						value={values.type}
						onChange={(value) => onChange({ ...values, type: value as RuleType | null })}
						clearable
						searchable
					/>
					<Select
						size="sm"
						placeholder={t('rules.filters.area')}
						data={areaOptions}
						value={values.area}
						onChange={(value) => onChange({ ...values, area: value as EvaluationArea | null })}
						clearable
						searchable
					/>
					<Select
						size="sm"
						placeholder={t('rules.filters.recipient')}
						data={recipientOptions}
						value={values.recipient}
						onChange={(value) => onChange({ ...values, recipient: value as RuleRecipient | null })}
						clearable
						searchable
					/>
					<SegmentedControl
						size="sm"
						value={values.status}
						onChange={(value) => onChange({ ...values, status: value as RuleStatus | 'ALL' })}
						data={[
							{ value: 'ALL', label: t('rules.filters.all') },
							{ value: 'ACTIVE', label: t('status.ACTIVE') },
							{ value: 'PAUSED', label: t('status.PAUSED') },
							{ value: 'DRAFT', label: t('status.DRAFT') },
						]}
					/>
				</Group>
			</FilterContainer>

			{isFiltered && (
				<Button
					variant="light"
					size="xs"
					leftSection={<IconX size={14} />}
					onClick={onClear}
				>
					{t('rules.filters.clear')}
				</Button>
			)}
		</>
	);
}
