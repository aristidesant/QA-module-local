import { Badge, Group, Progress, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { GlobalProgress } from '~/models/ContactsModel';
import SectionCard from '~/components/SectionCard';
import styles from './QueueProgressBar.module.css';

interface QueueProgressBarProps {
	progress: GlobalProgress;
}

const QueueProgressBar = ({ progress }: QueueProgressBarProps) => {
	const { t } = useTranslation('campaign.contact-list');

	const pct = Math.round(progress.contactProgress ?? 0);

	return (
		<SectionCard
			title={t('queue.progress.title')}
			description={t('queue.progress.description')}
		>
			<Stack gap='xs'>
				<Group justify='space-between' align='center'>
					<Text size='sm' fw={600}>
						{t('queue.progress.contacted', {
							contacted: progress.contactedContacts,
							total: progress.totalContacts,
						})}
					</Text>
					<Text size='sm' fw={600} c='blue'>
						{pct}%
					</Text>
				</Group>

				<Progress value={pct} size='md' radius='sm' />

				<Group gap='xs' className={styles.statusBadges}>
					{progress.tasksByStatus.map((s) => (
						<Badge key={s.status} variant='light' size='sm'>
							{t(`queue.status.${s.status}`, { defaultValue: s.status })}:{' '}
							{s.count}
						</Badge>
					))}
					<Badge variant='outline' size='sm' color='gray'>
						{t('queue.progress.totalTasks', { count: progress.totalTasks })}
					</Badge>
				</Group>
			</Stack>
		</SectionCard>
	);
};

export default QueueProgressBar;
