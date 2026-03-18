import { Box, Card, Text } from '@mantine/core';
import styles from '../../CampaignDashboardViewerWidgetContent.module.css';

interface DashboardWidgetCardProps {
	title: string;
	accentColor: string;
	children: React.ReactNode;
	groupByLabel?: string;
}

const DashboardWidgetCard = ({
	title,
	accentColor,
	children,
	groupByLabel,
}: DashboardWidgetCardProps) => (
	<Card
		radius='lg'
		padding='lg'
		className={styles.widgetCard}
		style={{ '--widget-accent': accentColor } as React.CSSProperties}
	>
		<div className={styles.widgetCardHeader}>
			<Box className={styles.widgetHeaderCopy}>
				<Text fw={700} size='sm' className={styles.widgetTitle}>
					{title}
				</Text>
				{groupByLabel ? (
					<div className={styles.widgetMeta}>
						{groupByLabel ? (
							<span className={styles.groupByLabel}>{groupByLabel}</span>
						) : null}
					</div>
				) : null}
			</Box>
		</div>
		{children}
	</Card>
);

export default DashboardWidgetCard;
