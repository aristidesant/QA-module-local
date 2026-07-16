import { Alert, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconGitBranch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router';

import SectionCard from '~/components/SectionCard';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import type { EvaluationDisputeSummary } from '~/models/qa';
import { formatPoints } from '~/modules/qa/utils/format';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './DisputeHistoryCard.module.css';

export interface DisputeHistoryCardProps {
	disputes: EvaluationDisputeSummary[];
	isLoading: boolean;
	isError: boolean;
	error: unknown;
}

export default function DisputeHistoryCard({
	disputes,
	isLoading,
	isError,
	error,
}: DisputeHistoryCardProps) {
	const { t } = useTranslation('qa.evaluations');
	const dateFormatter = useDateFormatter('dateTime');

	return (
		<SectionCard icon={IconGitBranch} title={t('disputes.history.title')}>
			{isLoading ? (
				<Text c='dimmed' size='sm'>
					{t('disputes.history.loading')}
				</Text>
			) : null}

			{isError ? (
				<Alert
					color='red'
					icon={<IconAlertTriangle size={16} />}
					variant='light'
				>
					{getErrorMessage(error)}
				</Alert>
			) : null}

			{!isLoading && !isError && disputes.length === 0 ? (
				<Text c='dimmed' size='sm'>
					{t('disputes.history.empty')}
				</Text>
			) : null}

			<Stack gap='xs'>
				{disputes.map((dispute) => (
					<Stack
						className={classes.disputeHistoryItem}
						gap={4}
						key={dispute.id}
					>
						<Group justify='space-between'>
							<Text fw={700} size='sm'>
								{t('disputes.history.version', {
									version: dispute.resultingVersion,
								})}
							</Text>
							<Badge
								color={dispute.scoreDelta >= 0 ? 'green' : 'red'}
								variant='light'
							>
								{t('disputes.scoreDelta', {
									delta: formatPoints(dispute.scoreDelta),
								})}
							</Badge>
						</Group>
						<Text c='dimmed' lineClamp={2} size='xs'>
							{dispute.reason}
						</Text>
						<Group justify='space-between'>
							<Text c='dimmed' size='xs'>
								{dateFormatter.format(new Date(dispute.createdAt))}
							</Text>
							<Button
								component={RouterLink}
								size='compact-xs'
								to={`/qa/disputes/${dispute.id}`}
								variant='subtle'
							>
								{t('disputes.actions.open')}
							</Button>
						</Group>
					</Stack>
				))}
			</Stack>
		</SectionCard>
	);
}
