import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import type ContactGroup from '~/models/ContactGroup';
import {
	useStartOutboundCampaign,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
} from '~/queries/campaignsQueries';

interface ContactListControlProps {
	contactGroup: ContactGroup;
}

export const ContactListControl = ({
	contactGroup,
}: ContactListControlProps) => {
	const startMutation = useStartOutboundCampaign();
	const pauseMutation = usePauseOutboundCampaign();
	const resumeMutation = useResumeOutboundCampaign();

	const isLoading =
		startMutation.isPending ||
		pauseMutation.isPending ||
		resumeMutation.isPending;

	const handleAction = () => {
		if (contactGroup.queueStatus === 'PENDING') {
			startMutation.mutate({
				campaignId: contactGroup?.schedule?.campaignId || 0,
				contactGroupId: contactGroup.id,
			});
		} else if (contactGroup.queueStatus === 'PAUSED') {
			resumeMutation.mutate({
				campaignId: contactGroup.campaignId,
				contactGroupId: contactGroup.id,
			});
		} else if (contactGroup.queueStatus === 'RUNNING') {
			pauseMutation.mutate({
				campaignId: contactGroup.campaignId,
				contactGroupId: contactGroup.id,
			});
		}
	};

	const isDisabled =
		contactGroup.queueStatus === 'COMPLETED' ||
		contactGroup.queueStatus === 'FAILED';

	let icon = <IconPlayerPlay size={16} />;
	let tooltip = 'Start contact list';

	if (contactGroup.queueStatus === 'PAUSED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = 'Resume contact list';
	} else if (contactGroup.queueStatus === 'RUNNING') {
		icon = <IconPlayerPause size={16} />;
		tooltip = 'Pause contact list';
	} else if (contactGroup.queueStatus === 'COMPLETED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = 'Contact list is complete';
	} else if (contactGroup.queueStatus === 'FAILED') {
		icon = <IconPlayerPlay size={16} />;
		tooltip = 'Contact list has failed';
	}

	return (
		<Tooltip label={tooltip} withArrow>
			<ActionIcon
				variant='subtle'
				onClick={handleAction}
				aria-label={tooltip}
				loading={isLoading}
				disabled={isDisabled || isLoading}
			>
				{icon}
			</ActionIcon>
		</Tooltip>
	);
};

export default ContactListControl;
