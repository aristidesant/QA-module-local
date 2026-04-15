import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AddShedulerForm from './AddShedulerForm';
import styles from './AddScheduler.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useParams } from 'react-router';
import { useGetCampaign } from '~/queries/campaignsQueries';

interface AddSchedulerProps {
	campaignId?: string | number;
	handleReload?: () => void;
}

const AddScheduler: React.FC<AddSchedulerProps> = ({
	campaignId: propCampaignId,
	handleReload,
}) => {
	const { t } = useTranslation(['campaign.form.params', 'common']);
	const { selectedCampaign } = useCampaignsStore((state) => state);
	const { campaignId: paramCampaignId } = useParams<{ campaignId: string }>();
	const campaignId = propCampaignId ?? selectedCampaign?.id ?? paramCampaignId;

	// Fetch campaign data so the type is always available (even after hard reload)
	const { data: campaignData } = useGetCampaign(String(campaignId ?? ''));
	const campaignType = campaignData?.type ?? selectedCampaign?.type;

	const handleClick = () => {
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
			variant='light'
			onClick={handleClick}
			size='sm'
			className={styles.addButton}
			leftSection={<IconPlus size={14} />}
			disabled={!campaignId}
		>
			{t('scheduler.add.button')}
		</Button>
	);
};

export default AddScheduler;
