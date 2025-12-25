import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AddShedulerForm from './AddShedulerForm';
import styles from './AddScheduler.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useParams } from 'react-router';

interface AddSchedulerProps {
	campaignId?: string | number;
	handleReload?: () => void;
}

const AddScheduler: React.FC<AddSchedulerProps> = ({
	campaignId: propCampaignId,
	handleReload,
}) => {
	const { t } = useTranslation('campaigns');
	const { selectedCampaign } = useCampaignsStore((state) => state);
	const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
	const campaignId = propCampaignId ?? selectedCampaign?.id ?? paramCampaignId;
	const handleClick = () => {
		modals.open({
			modalId: 'add-schedule-modal',
			centered: true,
			size: '60%',
			title: t('scheduler.add.modalTitle'),
			children: (
				<AddShedulerForm
					campaignId={campaignId}
					onSuccess={() => {
						handleReload?.();
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
			disabled={!campaignId}
		>
			{t('scheduler.add.button')}
		</Button>
	);
};

export default AddScheduler;
