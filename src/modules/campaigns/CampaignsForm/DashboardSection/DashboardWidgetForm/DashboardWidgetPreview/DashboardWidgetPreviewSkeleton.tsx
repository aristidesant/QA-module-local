import { Card, Skeleton, Stack, Text } from '@mantine/core';
import type { WidgetPreviewModel } from '../../DashboardSection.types';
import styles from './DashboardWidgetPreview.module.css';

type DashboardWidgetPreviewSkeletonProps = {
	preview: WidgetPreviewModel;
	statusMessage?: string;
	statusTone?: 'muted' | 'danger';
};

const DashboardWidgetPreviewSkeleton = ({
	preview,
	statusMessage,
	statusTone = 'muted',
}: DashboardWidgetPreviewSkeletonProps) => {
	const statusColor = statusTone === 'danger' ? 'red' : 'dimmed';

	return (
		<div
			className={styles.previewFrame}
			data-size={preview.sizePreset}
			data-loading
		>
			<Card radius='lg' padding='lg' className={styles.loadingCard}>
				<Stack gap='xs' className={styles.loadingStack}>
					<Skeleton height={14} width='46%' radius='xl' />
					<Skeleton height={10} width='32%' radius='xl' />
					<Skeleton
						height={
							preview.sizePreset === 'SMALL'
								? 62
								: preview.sizePreset === 'MEDIUM'
									? 78
									: preview.sizePreset === 'LARGE'
										? 92
										: 104
						}
						width='100%'
						radius='md'
					/>
					<Stack gap={6}>
						<Skeleton height={10} width='58%' radius='xl' />
						<Skeleton height={10} width='42%' radius='xl' />
					</Stack>
				</Stack>
			</Card>
			{statusMessage ? (
				<Text size='xs' c={statusColor} className={styles.statusText}>
					{statusMessage}
				</Text>
			) : null}
		</div>
	);
};

export default DashboardWidgetPreviewSkeleton;
