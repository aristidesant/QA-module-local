import { Badge, Group, Progress, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { WaveProgress } from '~/models/ContactsModel';
import styles from './WaveProgressHeader.module.css';

interface WaveProgressHeaderProps {
	wave: WaveProgress;
}

const WaveProgressHeader = ({ wave }: WaveProgressHeaderProps) => {
	const { t } = useTranslation('campaign.contact-list');

	const pct = Math.round(wave.contactProgress ?? 0);

	return (
		<div className={styles.root}>
			<Group justify='space-between' align='center' wrap='nowrap'>
				<Group gap='sm' align='center'>
					<Text size='sm' fw={600}>
						{t('queue.wave', { number: wave.waveNumber })}
					</Text>
					<Badge variant='light' size='sm' color='blue'>
						{t('queue.waveTaskCount', { count: wave.totalTasks })}
					</Badge>
					<Text size='xs' c='dimmed'>
						{t('queue.progress.contacted', {
							contacted: wave.contactedContacts,
							total: wave.totalContacts,
						})}
					</Text>
				</Group>
				<Text size='xs' fw={600} c='blue'>
					{pct}%
				</Text>
			</Group>
			<Progress value={pct} size='xs' radius='sm' mt={4} />
		</div>
	);
};

export default WaveProgressHeader;
