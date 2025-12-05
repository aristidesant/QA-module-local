import React from 'react';
import { Stack, LoadingOverlay } from '@mantine/core';
import { SchedulerCard } from './SchedulerCard';
import { useCampaignSchedules } from '~/queries/schedulerQueries';
import type { Scheduler } from '~/models/SchedulerModel';
import AddScheduler from './AddScheduler';
import { useParams } from 'react-router';

interface DaySchedule {
	enabled: boolean;
	from: string;
	to: string;
}

interface ParametersSectionProps {
	workingHours: Record<string, DaySchedule>;
	onChange: (day: string, field: keyof DaySchedule, value: any) => void;
	onCopyToAll: (day: string) => void;
	onSchedulerUpdate?: (scheduler: Scheduler) => void;
}

export const ParametersSection: React.FC<ParametersSectionProps> = ({}) => {
	const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
	const {
		data: campaignSchedule,
		refetch: reloadCampaignSchedule,
		isLoading: campaignScheduleLoading,
		isFetching: campaignScheduleFetching,
	} = useCampaignSchedules(paramCampaignId);

	const handleReloading = () => {
		reloadCampaignSchedule();
	};
	return (
		<Stack gap='md'>
			<LoadingOverlay
				visible={campaignScheduleLoading || campaignScheduleFetching}
			/>
			{/* Schedulers Section */}
			{campaignSchedule && campaignSchedule.length > 0 && (
				<>
					<Stack gap='sm'>
						{campaignSchedule.map((scheduler) => (
							<SchedulerCard
								key={JSON.stringify(scheduler)}
								scheduler={scheduler}
								campaignId={paramCampaignId!}
								handleReload={handleReloading}
							/>
						))}
					</Stack>
				</>
			)}
			<AddScheduler />
		</Stack>
	);
};

export default ParametersSection;
