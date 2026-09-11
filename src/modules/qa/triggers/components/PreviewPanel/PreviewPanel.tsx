import { Badge, Button, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TriggerRule } from '~/models/qa';
import { TRIGGER_AGENTS } from '~/modules/qa/triggers/mockData';
import { evaluateRulePreview } from '~/modules/qa/triggers/helpers';
import classes from './PreviewPanel.module.css';

interface PreviewPanelProps {
	values: Pick<TriggerRule, 'type' | 'conditions' | 'conditionLogic' | 'scope'>;
}

export function PreviewPanel({ values }: PreviewPanelProps) {
	const { t } = useTranslation('qa.triggers');
	const [showAgents, setShowAgents] = useState(false);

	const preview = useMemo(() => evaluateRulePreview(values, TRIGGER_AGENTS), [values]);

	const isWeeklySummary = values.type === 'WEEKLY_SUMMARY';
	const total = isWeeklySummary ? preview.inScope.length : preview.inScope.length;
	const matching = isWeeklySummary ? preview.inScope.length : preview.matching.length;

	return (
		<Paper withBorder p='sm' radius='md' className={classes.preview}>
			<Group justify='space-between'>
				<Group gap='xs'>
					<ThemeIcon
						variant='light'
						color={matching > 0 ? 'blue' : 'gray'}
						size='lg'
					>
						<IconUsers size={16} />
					</ThemeIcon>
					<Stack gap={0}>
						<Text size='sm' fw={600}>
							{isWeeklySummary
								? t('editor.preview.matchingWeekly', { total: matching })
								: t('editor.preview.matching', { matching, total })}
						</Text>
					</Stack>
				</Group>
				{matching > 0 && (
					<Button
						variant='subtle'
						size='xs'
						onClick={() => setShowAgents(!showAgents)}
					>
						{showAgents ? t('editor.preview.hideAgents') : t('editor.preview.viewAgents')}
					</Button>
				)}
			</Group>

			{showAgents && (
				<div style={{ marginTop: 'var(--mantine-spacing-sm)' }}>
					{matching > 0 ? (
						<Group gap={4}>
							{preview.matching.map((agent) => (
								<Badge key={agent.agentId} variant='light'>
									{agent.agentName} · {agent.team}
								</Badge>
							))}
						</Group>
					) : (
						<Text size='xs' c='dimmed'>
							{t('editor.preview.noMatches')}
						</Text>
					)}
				</div>
			)}
		</Paper>
	);
}
