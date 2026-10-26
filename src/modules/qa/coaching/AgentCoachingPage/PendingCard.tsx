import { Button, Group, Text } from '@mantine/core';
import { IconChecklist, IconUserCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import rowClasses from '~/modules/qa/lms/components/LearningRow.module.css';
import { formatDay } from '~/modules/qa/lms/helpers';
import type { PendingItem } from './useAgentSessions';

interface PendingCardProps {
	pending: PendingItem[];
	overdueCount: number;
	onAcknowledgeItem: (sessionId: string, itemId: string) => void;
	onCommit: (sessionId: string) => void;
}

/** The status line of one row: how late or how soon, or that a commitment is waiting. */
const statusLabel = (t: TFunction, p: PendingItem): string => {
	if (p.kind === 'COMMITMENT')
		return t('agent.coaching.pending.needsCommitment');
	const days = p.daysLeft ?? 0;
	if (days < 0) return t('agent.coaching.pending.overdueBy', { count: -days });
	if (days === 0) return t('agent.coaching.pending.dueToday');
	if (days <= 7) return t('agent.coaching.pending.dueIn', { count: days });
	return t('agent.coaching.pending.dueOn', {
		date: formatDay(p.dueDate ?? ''),
	});
};

/** Everything the agent still owes, most urgent first: overdue, then commitments, then by due date. */
export function PendingCard({
	pending,
	overdueCount,
	onAcknowledgeItem,
	onCommit,
}: PendingCardProps) {
	const { t } = useTranslation('qa.lms');

	return (
		<SectionCard
			title={t('agent.coaching.pending.title')}
			icon={IconChecklist}
			contentSpacing={0}
			fullHeight
			headerActions={
				pending.length > 0 ? (
					<Group gap='sm' wrap='nowrap'>
						<Text size='sm' c='dimmed'>
							{t('agent.coaching.pending.summaryNoOverdue', {
								count: pending.length,
							})}
						</Text>
						{overdueCount > 0 && (
							<Text size='sm' className={rowClasses.due}>
								{t('agent.coaching.pending.overdueCount', {
									count: overdueCount,
								})}
							</Text>
						)}
					</Group>
				) : undefined
			}
		>
			{pending.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('agent.coaching.commitments.empty')}
				</Text>
			) : (
				pending.map((p) => {
					const overdue = p.daysLeft !== null && p.daysLeft < 0;
					const Icon = p.kind === 'COMMITMENT' ? IconUserCheck : IconChecklist;
					return (
						<div key={p.id} className={rowClasses.row}>
							<span className={rowClasses.icon}>
								<Icon
									size={16}
									color='var(--mantine-color-dimmed)'
									aria-hidden
								/>
							</span>
							<div className={rowClasses.main}>
								<Text
									size='sm'
									fw={600}
									className={overdue ? rowClasses.due : undefined}
								>
									{statusLabel(t, p)}
								</Text>
								<Text size='sm'>
									{p.kind === 'COMMITMENT'
										? t('agent.coaching.commitments.commitTo', {
												topic: p.session.topic,
											})
										: p.item?.text}
								</Text>
								<Text size='xs' c='dimmed'>
									{t('agent.coaching.pending.from', {
										topic: p.session.topic,
										date: dayjs(p.session.date).format('D MMM'),
									})}
								</Text>
							</div>
							<Button
								size='xs'
								variant='light'
								onClick={() =>
									p.kind === 'COMMITMENT'
										? onCommit(p.session.id)
										: p.item && onAcknowledgeItem(p.session.id, p.item.id)
								}
							>
								{p.kind === 'COMMITMENT'
									? t('agent.coaching.acknowledge')
									: t('agent.coaching.pending.acknowledge')}
							</Button>
						</div>
					);
				})
			)}
		</SectionCard>
	);
}

export default PendingCard;
