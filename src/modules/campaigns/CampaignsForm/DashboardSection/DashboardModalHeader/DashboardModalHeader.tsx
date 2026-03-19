import { Text } from '@mantine/core';
import styles from './DashboardModalHeader.module.css';

type DashboardModalHeaderProps = {
	title: string;
	description?: string;
};

const DashboardModalHeader = ({
	title,
	description,
}: DashboardModalHeaderProps) => {
	return (
		<div className={styles.modalHeader}>
			<Text className={styles.modalTitle}>{title}</Text>
			{description ? (
				<Text className={styles.modalDescription}>{description}</Text>
			) : null}
		</div>
	);
};

export default DashboardModalHeader;
