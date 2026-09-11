import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { ConditionLogic, RuleCondition } from '~/models/qa';
import { describeCondition } from '~/modules/qa/triggers/helpers';
import classes from './ConditionSummaryList.module.css';

interface ConditionSummaryListProps {
	conditions: RuleCondition[];
	logic: ConditionLogic;
}

export default function ConditionSummaryList({ conditions, logic }: ConditionSummaryListProps) {
	const { t } = useTranslation('qa.triggers');

	if (conditions.length === 0) {
		return <Text size="sm" c="dimmed">{t('conditions.none')}</Text>;
	}

	return (
		<Stack gap="xs" className={classes.root}>
			{conditions.length > 1 && (
				<Badge variant="light" size="lg">
					{t(`logic.${logic}`)}
				</Badge>
			)}
			{conditions.map((condition) => (
				<Paper key={condition.id} withBorder p="sm" radius="md" className={classes.card}>
					<Group gap="sm" wrap="nowrap">
						<Badge variant="outline" color="gray" size="sm" w={80} flex="0 0 auto">
							{t('areas.ALL')}
						</Badge>
						<Text size="sm" flex="1">
							{describeCondition(t, condition)}
						</Text>
					</Group>
				</Paper>
			))}
		</Stack>
	);
}
