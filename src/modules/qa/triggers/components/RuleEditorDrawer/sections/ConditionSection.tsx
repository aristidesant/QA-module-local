import { Button, Stack, Group, SegmentedControl, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturnType } from '@mantine/form';
import type { RuleType, RuleCondition } from '~/models/qa';
import { MAX_CONDITIONS, RULE_TYPE_META } from '~/modules/qa/triggers/constants';
import { type RuleFormValues } from '~/modules/qa/triggers/helpers';
import { ConditionRow } from '~/modules/qa/triggers/components/ConditionRow';
import { SectionCard } from '~/components/SectionCard';

interface ConditionSectionProps {
	form: UseFormReturnType<RuleFormValues>;
	type: RuleType;
}

export function ConditionSection({ form, type }: ConditionSectionProps) {
	const { t } = useTranslation('qa.triggers');
	const meta = RULE_TYPE_META[type];

	if (!meta.hasConditions) {
		return null;
	}

	const handleAddCondition = () => {
		const newCondition: RuleCondition = {
			id: `cond-${Date.now()}`,
			metricId: 'QA_OVERALL_SCORE',
			subItem: null,
			mode: meta.allowedModes[0],
			operator: 'LT',
			value: 80,
			value2: null,
			changeDirection: 'DECREASE',
			changePercent: 10,
			consecutiveCount: 3,
			window: 'LAST_7_DAYS',
			windowSize: 10,
		};
		form.insertListItem('conditions', newCondition);
	};

	return (
		<SectionCard
			title={t('editor.sections.condition')}
			description={t('editor.sections.conditionDescription')}
		>
			{form.values.conditions.length > 1 && (
				<Group mb='md' justify='space-between'>
					<Text size='sm' fw={500}>{t('logic.ALL')}</Text>
					<SegmentedControl
						size='xs'
						data={[
							{ label: t('logic.ALL'), value: 'ALL' },
							{ label: t('logic.ANY'), value: 'ANY' },
						]}
						value={form.values.conditionLogic}
						onChange={(v) => form.setFieldValue('conditionLogic', v as any)}
					/>
				</Group>
			)}

			<Stack gap='md'>
				{form.values.conditions.map((condition, index) => (
					<ConditionRow
						key={condition.id}
						condition={condition}
						allowedModes={meta.allowedModes}
						onChange={(updated) => form.setFieldValue(`conditions.${index}`, updated)}
						onRemove={() => form.removeListItem('conditions', index)}
						canRemove={form.values.conditions.length > 1}
					/>
				))}
			</Stack>

			<Button
				variant='light'
				size='xs'
				leftSection={<IconPlus size={14} />}
				onClick={handleAddCondition}
				disabled={form.values.conditions.length >= MAX_CONDITIONS}
				mt='md'
			>
				{t('editor.fields.addCondition')}
			</Button>

			{typeof form.errors.conditions === 'string' && (
				<Text size='xs' c='red' mt='xs'>
					{form.errors.conditions}
				</Text>
			)}
		</SectionCard>
	);
}
