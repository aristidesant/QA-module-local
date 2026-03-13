import { Collapse, Switch, Text } from '@mantine/core';
import { IconLayoutDashboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import CampaignDashboardViewer from '~/modules/campaigns/CampaignDashboardViewer';
import {
	DashboardSectionProvider,
	useDashboardSectionSelection,
} from './DashboardSection.context';
import DashboardListPanel from './DashboardListPanel';
import DashboardModals from './DashboardModals';
import WidgetListPanel from './WidgetListPanel';
import styles from './DashboardSection.module.css';

const DashboardSectionContent = () => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const { campaignId, selectedDashboardId, isPreviewOpen, setIsPreviewOpen } =
		useDashboardSectionSelection();

	return (
		<>
			<SectionCard
				title={t('dashboardBuilder.title')}
				description={t('dashboardBuilder.description')}
				icon={IconLayoutDashboard}
				contentSpacing={0}
				headerActions={
					<Switch
						classNames={{
							root: styles.previewSwitch,
							body: styles.previewSwitchBody,
							track: styles.previewSwitchTrack,
							thumb: styles.previewSwitchThumb,
							label: styles.previewSwitchLabel,
						}}
						label={t('dashboardBuilder.mode.preview')}
						checked={isPreviewOpen}
						onChange={(event) => setIsPreviewOpen(event.currentTarget.checked)}
						size='xs'
					/>
				}
			>
				<div className={styles.manageLayout}>
					<div className={styles.sidebar}>
						<DashboardListPanel />
					</div>
					<div className={styles.main}>
						<WidgetListPanel />
					</div>
				</div>
			</SectionCard>

			<Collapse in={isPreviewOpen}>
				<div className={styles.previewDivider}>
					<div className={styles.previewDividerLine} />
					<div className={styles.previewDividerLabel}>
						<IconLayoutDashboard size={11} stroke={2} />
						<span>{t('dashboardBuilder.previewDivider')}</span>
					</div>
					<div className={styles.previewDividerLine} />
				</div>
				<CampaignDashboardViewer
					campaignId={campaignId}
					initialDashboardId={selectedDashboardId ?? undefined}
				/>
			</Collapse>

			<DashboardModals />
		</>
	);
};

const DashboardSection = ({
	campaignId,
	attributeMetricKeys = [],
	allowGlobal = false,
}: {
	campaignId?: number | null;
	attributeMetricKeys?: string[];
	allowGlobal?: boolean;
}) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);

	if (!campaignId && !allowGlobal) {
		return (
			<SectionCard
				title={t('dashboardBuilder.emptyDraftTitle')}
				description={t('dashboardBuilder.emptyDraftDescription')}
				icon={IconLayoutDashboard}
			>
				<Text size='sm' c='dimmed'>
					{t('dashboardBuilder.emptyDraftMessage')}
				</Text>
			</SectionCard>
		);
	}

	return (
		<DashboardSectionProvider
			campaignId={campaignId ?? null}
			attributeMetricKeys={attributeMetricKeys}
		>
			<DashboardSectionContent />
		</DashboardSectionProvider>
	);
};

export default DashboardSection;
