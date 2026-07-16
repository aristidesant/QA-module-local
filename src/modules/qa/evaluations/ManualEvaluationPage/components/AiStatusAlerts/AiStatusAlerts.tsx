import { Alert, Badge, Button, Loader, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { EvaluationDetail } from '~/models/qa';
import classes from './AiStatusAlerts.module.css';

export interface AiStatusAlertsProps {
	detail: EvaluationDetail;
	isAiRunning: boolean;
	isFailed: boolean;
	canRerun: boolean;
	onRerun: () => void;
	rerunning: boolean;
}

export default function AiStatusAlerts({
	detail,
	isAiRunning,
	isFailed,
	canRerun,
	onRerun,
	rerunning,
}: AiStatusAlertsProps) {
	const { t } = useTranslation('qa.evaluations');

	return (
		<>
			{isAiRunning ? (
				<Alert
					color='blue'
					icon={<Loader size={16} />}
					title={t('ai.processingTitle')}
					variant='light'
				>
					{t('ai.processingDescription')}
				</Alert>
			) : null}

			{isFailed ? (
				<Alert
					color='red'
					icon={<IconAlertTriangle size={16} />}
					title={t('ai.failedTitle')}
					variant='light'
				>
					<Stack gap='xs'>
						<Text size='sm'>
							{detail.aiEvaluationError || t('ai.failedFallback')}
						</Text>
						{detail.aiEvaluationErrorType ? (
							<Badge color='red' variant='light' w='fit-content'>
								{t(
									`ai.errorTypes.${detail.aiEvaluationErrorType.toLowerCase()}`
								)}
							</Badge>
						) : null}
						{canRerun ? (
							<Button
								className={classes.retryButton}
								leftSection={<IconRefresh size={14} />}
								loading={rerunning}
								onClick={onRerun}
								size='xs'
								variant='light'
							>
								{t('ai.rerun')}
							</Button>
						) : null}
					</Stack>
				</Alert>
			) : null}
		</>
	);
}
