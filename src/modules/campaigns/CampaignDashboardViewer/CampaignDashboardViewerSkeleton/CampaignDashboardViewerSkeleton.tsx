import { Skeleton } from '@mantine/core';
import styles from './CampaignDashboardViewerSkeleton.module.css';

const CampaignDashboardViewerSkeleton = () => {
	return (
		<div className={styles.root} aria-hidden='true'>
			<div className={styles.grid}>
				<div className={styles.widgetWide}>
					<Skeleton height='100%' radius='lg' />
				</div>

				<div className={styles.widgetTall}>
					<Skeleton height='100%' radius='lg' />
				</div>

				<div className={styles.widgetMedium}>
					<Skeleton height='100%' radius='lg' />
				</div>

				<div className={styles.widgetShort}>
					<Skeleton height='100%' radius='lg' />
				</div>

				<div className={styles.widgetMedium}>
					<Skeleton height='100%' radius='lg' />
				</div>

				<div className={styles.widgetShort}>
					<Skeleton height='100%' radius='lg' />
				</div>

				<div className={styles.widgetWide}>
					<Skeleton height='100%' radius='lg' />
				</div>

				<div className={styles.widgetMedium}>
					<Skeleton height='100%' radius='lg' />
				</div>
			</div>
		</div>
	);
};

export default CampaignDashboardViewerSkeleton;
