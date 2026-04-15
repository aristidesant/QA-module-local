import React from 'react';
import { Stack, LoadingOverlay, Text, Box } from '@mantine/core';
import styles from './ParametersSection.module.css';
import { IconCalendarTime } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SchedulerCard } from './SchedulerCard';
import { useCampaignSchedules } from '~/queries/schedulerQueries';
import AddShedulerForm from './AddScheduler/AddShedulerForm';
import SectionCard from '~/components/SectionCard';
import { useParams } from 'react-router';
import { modals } from '@mantine/modals';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useGetCampaign } from '~/queries/campaignsQueries';

interface ParametersSectionProps {
	campaignId?: string | number;
	onCalculate?: () => void;
}

const ParametersSection: React.FC<ParametersSectionProps> = ({
	campaignId: propCampaignId,
	onCalculate,
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);
	const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
	const campaignId = propCampaignId ?? paramCampaignId;
	const { selectedCampaign } = useCampaignsStore((state) => state);
	const { data: campaignData } = useGetCampaign(String(campaignId ?? ''));
	const campaignType = campaignData?.type ?? selectedCampaign?.type;

	const {
		data: campaignSchedule,
		refetch: reloadCampaignSchedule,
		isLoading: campaignScheduleLoading,
		isFetching: campaignScheduleFetching,
	} = useCampaignSchedules(campaignId);

	const handleReloading = () => {
		reloadCampaignSchedule();
	};

	const handleAddSchedule = () => {
		modals.open({
			modalId: 'add-schedule-modal',
			centered: true,
			size: '60%',
			title: t('scheduler.add.modalTitle'),
			children: (
				<AddShedulerForm
					campaignId={campaignId}
					campaignType={campaignType}
					onSuccess={() => {
						handleReloading();
						modals.close('add-schedule-modal');
					}}
					onCancel={() => modals.close('add-schedule-modal')}
				/>
			),
		});
	};

	return (
		<SectionCard
			icon={IconCalendarTime}
			title={t('scheduler.section.title', 'Schedules')}
			description={t(
				'scheduler.section.description',
				'Configure campaign operating hours and capacity'
			)}
			onAdd={campaignId ? handleAddSchedule : undefined}
			onCalculate={onCalculate}
		>
			<Stack gap='md'>
				<LoadingOverlay
					visible={campaignScheduleLoading || campaignScheduleFetching}
				/>

				{campaignSchedule && campaignSchedule.length > 0 && (
					<Box className={styles.cardsBox}>
						<Stack gap='md'>
							{campaignSchedule.map((schedule) => (
								<SchedulerCard
									key={JSON.stringify(schedule)}
									scheduler={schedule}
									campaignId={String(campaignId)}
									handleReload={handleReloading}
								/>
							))}
						</Stack>
					</Box>
				)}

				{(!campaignSchedule || campaignSchedule.length === 0) &&
					!campaignScheduleLoading && (
						<Stack
							gap='xs'
							align='center'
							py='xl'
							className={styles.emptyState}
						>
							<Text size='sm' c='dimmed'>
								{t('scheduler.section.empty', 'No schedules configured yet')}
							</Text>
						</Stack>
					)}
			</Stack>
		</SectionCard>
	);
};

export default ParametersSection;
