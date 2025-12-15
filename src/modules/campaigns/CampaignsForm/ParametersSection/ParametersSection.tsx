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
	/** Campaign ID - can be passed directly (e.g., from wizard) or will fall back to URL param */
	campaignId?: string | number;
}

export const ParametersSection: React.FC<ParametersSectionProps> = ({
	campaignId: propCampaignId,
}) => {
	const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
	// Use prop campaignId first (for wizard), then fall back to URL param (for edit page)
	const campaignId = propCampaignId ?? paramCampaignId;
	const {
		data: campaignSchedule,
		refetch: reloadCampaignSchedule,
		isLoading: campaignScheduleLoading,
		isFetching: campaignScheduleFetching,
	} = useCampaignSchedules(campaignId);

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
								campaignId={String(campaignId)}
								handleReload={handleReloading}
							/>
						))}
					</Stack>
				</>
			)}
			<AddScheduler campaignId={campaignId} handleReload={handleReloading} />
		</Stack>
	);
};

export default ParametersSection;
