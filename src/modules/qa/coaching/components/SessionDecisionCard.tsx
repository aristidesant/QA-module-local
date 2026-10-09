import type { ReactNode } from 'react';
import { SegmentedControl, Stack, Text, Tooltip } from '@mantine/core';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type {
	CoachingBatchDecision,
	CoachingBatchItem,
	CoachingSessionRecord,
} from '~/models/qa';

interface SessionDecisionCardProps {
	session: CoachingSessionRecord;
	/** The batch row behind this session. */
	item: CoachingBatchItem;
	onDecisionChange: (decision: CoachingBatchDecision) => void;
	/** The 1:1 details (date, place, confirm) while the 1:1 is still being arranged. */
	children?: ReactNode;
}

/**
 * The platform's call for this agent this week, as one exclusive choice:
 * a 1:1 or an automated AI message. The platform's pick is pre-selected and the
 * supervisor keeps it or flips it. Locked once the session is held, sent,
 * missed or cancelled.
 */
export function SessionDecisionCard({
	session,
	item,
	onDecisionChange,
	children,
}: SessionDecisionCardProps) {
	const { t } = useTranslation('qa.coaching');
	const locked =
		session.status === 'COMPLETED' ||
		session.status === 'MISSED' ||
		session.status === 'CANCELLED';

	const control = (
		<SegmentedControl
			size='sm'
			fullWidth
			value={item.decision}
			disabled={locked}
			aria-label={t('sessions.decision.title')}
			data={[
				{
					value: 'ONE_ON_ONE',
					label: t('sessions.batch.decisionShort.ONE_ON_ONE'),
				},
				{
					value: 'AI_MESSAGE',
					label: t('sessions.batch.decisionShort.AI_MESSAGE'),
				},
			]}
			onChange={(v) => onDecisionChange(v as CoachingBatchDecision)}
		/>
	);

	return (
		<SectionCard
			title={t('sessions.decision.title')}
			description={t('sessions.decision.hint')}
			padding='md'
		>
			<Stack gap='sm'>
				{locked ? (
					<Tooltip withArrow label={t('sessions.batch.locked')}>
						<div>{control}</div>
					</Tooltip>
				) : (
					control
				)}
				<Text size='xs' c='dimmed'>
					{t('sessions.decision.reason', {
						reason: t(`sessions.batch.reason.${item.reason}`),
					})}
				</Text>
				{item.decision === 'AI_MESSAGE' ? (
					<Text size='sm'>
						{t(
							session.status === 'COMPLETED'
								? 'sessions.batch.sentOn'
								: 'sessions.decision.sendsOn',
							{ date: dayjs(session.date).format('ddd D MMM') }
						)}
					</Text>
				) : (
					children
				)}
			</Stack>
		</SectionCard>
	);
}
