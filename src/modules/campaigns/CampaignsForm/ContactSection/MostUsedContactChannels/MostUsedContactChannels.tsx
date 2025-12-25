import { Group, Text, Box, Card } from '@mantine/core';
import styles from './MostUsedContactChannels.module.css';
import { useTranslation } from 'react-i18next';

interface MostUsedContactChannelsProps {
	score?: number;
	maxScore?: number;
}

export const MostUsedContactChannels = ({
	score = 82,
	maxScore = 100,
}: MostUsedContactChannelsProps) => {
	const { t } = useTranslation('campaigns');
	return (
		<Card className={styles.card}>
			<Group gap='xs' mb='xs'>
				<Box className={styles.greenDot} />
				<Text size='sm' fw={600} className={styles.title}>
					{t('form.contacts.mostUsedChannels.title')}
				</Text>
			</Group>
			<Text size='xs' c='dimmed' mb='sm' className={styles.subtitle}>
				{t('form.contacts.mostUsedChannels.subtitle')}
			</Text>
			<Text size='xl' fw={700} className={styles.score}>
				{score}/{maxScore}
			</Text>
		</Card>
	);
};
