import { IconMessageOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from '@mantine/core';
import styles from './EmptyTranscript.module.css';

export function EmptyTranscript() {
	const { t } = useTranslation(['conversations', 'common']);

	return (
		<div className={styles.emptyStateWrapper}>
			<Box className={styles.emptyState}>
				<IconMessageOff
					size={48}
					className={styles.emptyStateIcon}
					stroke={1.5}
				/>
				<Text size='sm' c='dimmed' fw={500}>
					{t('transcript.empty.message')}
				</Text>
				<Text size='xs' c='dimmed' mt={4}>
					{t('transcript.empty.description')}
				</Text>
			</Box>
		</div>
	);
}
