import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import AddShedulerForm from './AddShedulerForm';
import styles from './AddScheduler.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useCampaignSchedules } from '~/queries/schedulerQueries';

interface AddSchedulerProps {}

const AddScheduler: React.FC<AddSchedulerProps> = ({}) => {
	const { selectedCampaign } = useCampaignsStore((state) => state);
	const { refetch: reloadCampaignSchedule } = useCampaignSchedules(
		selectedCampaign?.id
	);
	const handleClick = () => {
		modals.open({
			modalId: 'add-schedule-modal',
			centered: true,
			size: '60%',
			title: 'Add Predefined Schedule',
			children: (
				<AddShedulerForm
					campaignId={selectedCampaign?.id}
					onSuccess={() => {
						reloadCampaignSchedule();
						modals.close('add-schedule-modal');
					}}
					onCancel={() => modals.close('add-schedule-modal')}
				/>
			),
		});
	};
	return (
		<Button
			variant='outline'
			onClick={handleClick}
			size='xl'
			className={`${styles.addButton}`}
			leftSection={<IconPlus size={16} />}
		>
			Add Schedule
		</Button>
	);
};

export default AddScheduler;
