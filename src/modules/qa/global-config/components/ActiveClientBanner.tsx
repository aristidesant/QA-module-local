import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Stack, Text } from '@mantine/core';
import classes from '../GlobalConfig.module.css';

interface ActiveClientBannerProps {
	title: string;
	description: string;
	configured: boolean;
}

/** "Active client configuration" strip with the Configured / Not configured badge. */
export const ActiveClientBanner: React.FC<ActiveClientBannerProps> = ({
	title,
	description,
	configured,
}) => {
	const { t } = useTranslation('qa.globalConfig');
	return (
		<div className={classes.banner}>
			<Stack gap={2}>
				<Text size='sm' fw={600}>
					{title}
				</Text>
				<Text size='sm' c='dimmed'>
					{description}
				</Text>
			</Stack>
			<Badge
				variant='light'
				color={configured ? 'green' : 'gray'}
				size='md'
				flex='0 0 auto'
			>
				{t(configured ? 'common.configured' : 'common.notConfigured')}
			</Badge>
		</div>
	);
};

export default ActiveClientBanner;
