import { Text } from '@mantine/core';
import styles from './DashboardModalHeader.module.css';

type DashboardModalHeaderProps = {
	title: string;
	description?: string;
	kicker?: string;
};

const DashboardModalHeader = ({
	title,
	description,
	kicker,
}: DashboardModalHeaderProps) => {
	return (
		<div className={styles.modalHeader}>
			{kicker ? (
				<Text
					size='xs'
					fw={600}
					tt='uppercase'
					c='dimmed'
					className={styles.modalKicker}
				>
					{kicker}
				</Text>
			) : null}
			<Text className={styles.modalTitle}>{title}</Text>
			{description ? (
				<Text className={styles.modalDescription}>{description}</Text>
			) : null}
		</div>
	);
};

export default DashboardModalHeader;
