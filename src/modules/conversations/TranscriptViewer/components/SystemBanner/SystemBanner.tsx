import { Group, Paper, Text } from '@mantine/core';
import { formatTime } from '../../helpers/formatUtils';
import styles from './SystemBanner.module.css';

interface SystemBannerProps {
	message: string;
	timeInCallSecs?: number;
}

export const SystemBanner = ({
	message,
	timeInCallSecs,
}: SystemBannerProps) => (
	<Paper radius='xl' p='xs' className={styles.systemBanner}>
		<Group gap={6} justify='center'>
			<Text size='xs' c='dimmed'>
				{message}
			</Text>
			{timeInCallSecs !== undefined && (
				<Text size='xs' c='dimmed' className={styles.timestamp}>
					• {formatTime(timeInCallSecs)}
				</Text>
			)}
		</Group>
	</Paper>
);
