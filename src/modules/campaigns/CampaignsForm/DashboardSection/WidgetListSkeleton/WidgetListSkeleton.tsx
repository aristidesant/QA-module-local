import { Skeleton } from '@mantine/core';
import styles from './WidgetListSkeleton.module.css';

const WidgetListSkeleton = () => (
	<div className={styles.widgetList}>
		{Array.from({ length: 6 }, (_, index) => (
			<div key={index} className={styles.widgetCard}>
				{/* Type chip placeholder */}
				<div className={styles.typeChipSkeleton} />

				{/* Title + metric */}
				<div className={styles.skeletonContent}>
					<Skeleton height={13} width='68%' radius='sm' />
					<Skeleton height={11} width='82%' radius='sm' />
				</div>

				{/* Footer */}
				<div className={styles.skeletonFooter}>
					<Skeleton height={10} width={50} radius='sm' />
					<Skeleton height={6} width={6} radius='xl' />
				</div>
			</div>
		))}
	</div>
);

export default WidgetListSkeleton;
