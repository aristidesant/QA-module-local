import { Skeleton, Stack } from '@mantine/core';
import styles from './DashboardListSkeleton.module.css';

const DashboardListSkeleton = () => (
	<Stack gap='xs'>
		{Array.from({ length: 4 }, (_, index) => (
			<div key={index} className={styles.dashboardCard}>
				<div className={styles.headerRow}>
					<div className={styles.skeletonContent}>
						<Skeleton height={16} width='42%' radius='sm' />
						<Skeleton height={12} width='78%' radius='sm' />
					</div>
					<div className={styles.skeletonActions}>
						<Skeleton height={24} width={24} radius='sm' />
						<Skeleton height={24} width={24} radius='sm' />
					</div>
				</div>
			</div>
		))}
	</Stack>
);

export default DashboardListSkeleton;
