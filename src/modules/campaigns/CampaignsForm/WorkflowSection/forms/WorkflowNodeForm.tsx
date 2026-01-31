import { ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import RightSectionCard from '~/components/RightSectionCard';
import { useCampaignsStore } from '~/stores/campaignsStore';

interface WorkflowNodeFormProps {
	title: string;
	description?: string;
	children: React.ReactNode;
}

const WorkflowNodeForm = ({
	title,
	description,
	children,
}: WorkflowNodeFormProps) => {
	const { t } = useTranslation('campaigns');
	const { setRightComponent } = useCampaignsStore();

	return (
		<RightSectionCard
			title={title}
			description={description}
			rightSection={
				<ActionIcon
					variant='subtle'
					color='gray'
					size='sm'
					onClick={() => setRightComponent(null)}
					aria-label={t('form.workflow.sidePanel.close')}
				>
					<IconX size={16} />
				</ActionIcon>
			}
		>
			{children}
		</RightSectionCard>
	);
};

export default WorkflowNodeForm;
