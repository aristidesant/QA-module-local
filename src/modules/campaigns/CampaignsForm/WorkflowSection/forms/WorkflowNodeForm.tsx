import { ActionIcon } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import RightSectionCard from '~/components/RightSectionCard';
import { useCampaignsStore } from '~/stores/campaignsStore';

interface WorkflowNodeFormProps {
	title: string;
	description?: string;
	icon?: TablerIcon;
	iconColor?: string;
	children: React.ReactNode;
}

const WorkflowNodeForm = ({
	title,
	description,
	children,
	icon,
	iconColor,
}: WorkflowNodeFormProps) => {
	const { t } = useTranslation('campaigns');
	const { setRightComponent } = useCampaignsStore();

	return (
		<RightSectionCard
			title={title}
			description={description}
			icon={icon}
			iconColor={iconColor}
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
