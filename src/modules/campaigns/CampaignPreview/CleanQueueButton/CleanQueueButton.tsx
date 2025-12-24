import React, { useCallback, useMemo } from 'react';
import { Button, type ButtonProps } from '@mantine/core';
import { IconRotateClockwise } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCleanOutboundQueue } from '~/queries/outboundQueries';

type CleanQueueButtonProps = {
	campaignId: number;
	contactGroupId?: number;
} & Omit<ButtonProps, 'leftSection' | 'onClick' | 'loading' | 'children'>;

const CleanQueueButton: React.FC<CleanQueueButtonProps> = ({
	campaignId,
	contactGroupId,
	disabled: disabledProp,
	variant = 'light',
	color = 'red',
	size = 'sm',
	...rest
}) => {
	const { mutate, isPending } = useCleanOutboundQueue();

	const isValid = useMemo(
		() => Number.isFinite(campaignId) && Number.isFinite(contactGroupId),
		[campaignId, contactGroupId]
	);

	const handleClick = useCallback(() => {
		if (!isValid) {
			return;
		}

		mutate({ campaignId, contactGroupId: contactGroupId! });
	}, [campaignId, contactGroupId, isValid, mutate]);

	const { t } = useTranslation();

	return (
		<Button
			leftSection={<IconRotateClockwise size={14} />}
			variant={variant}
			color={color}
			size={size}
			loading={isPending}
			disabled={isPending || disabledProp || !isValid}
			onClick={handleClick}
			{...rest}
		>
			{t('campaigns.form.contacts.details.confirm.cleanQueueConfirm')}
		</Button>
	);
};

export default CleanQueueButton;
