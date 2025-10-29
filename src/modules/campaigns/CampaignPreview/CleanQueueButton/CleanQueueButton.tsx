import React, { useCallback, useMemo } from 'react';
import { Button, type ButtonProps } from '@mantine/core';
import { IconRotateClockwise } from '@tabler/icons-react';
import { useCleanOutboundQueue } from '~/queries/outboundQueries';

type CleanQueueButtonProps = {
	campaignId: number;
} & Omit<ButtonProps, 'leftSection' | 'onClick' | 'loading' | 'children'>;

const CleanQueueButton: React.FC<CleanQueueButtonProps> = ({
	campaignId,
	disabled: disabledProp,
	variant = 'light',
	color = 'red',
	size = 'sm',
	...rest
}) => {
	const { mutate, isPending } = useCleanOutboundQueue();

	const isCampaignIdValid = useMemo(
		() => Number.isFinite(campaignId),
		[campaignId]
	);

	const handleClick = useCallback(() => {
		if (!isCampaignIdValid) {
			return;
		}

		mutate({ campaignId });
	}, [campaignId, isCampaignIdValid, mutate]);

	return (
		<Button
			leftSection={<IconRotateClockwise size={14} />}
			variant={variant}
			color={color}
			size={size}
			loading={isPending}
			disabled={isPending || disabledProp || !isCampaignIdValid}
			onClick={handleClick}
			{...rest}
		>
			Clean Queue
		</Button>
	);
};

export default CleanQueueButton;
