import { Alert, Badge, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import classes from './SIPTrunk.module.css';

const ALLOWED_SIP_MONITOR_ORIGIN =
	import.meta.env.VITE_APP_SIP_MONITOR_ORIGIN?.trim();

const getAllowedOrigin = () => {
	if (!ALLOWED_SIP_MONITOR_ORIGIN) {
		return window.location.origin;
	}

	try {
		return new URL(ALLOWED_SIP_MONITOR_ORIGIN).origin;
	} catch {
		return window.location.origin;
	}
};

const resolveMonitorUrl = (value: string) => {
	try {
		return new URL(value, window.location.origin);
	} catch {
		return null;
	}
};

const SIPTrunk = () => {
	const { data, isLoading, error } = useClientConfigByName('sip_monitor_url');
	const allowedOrigin = getAllowedOrigin();
	const monitorUrl = data?.value ? resolveMonitorUrl(data.value) : null;
	const isAllowedOrigin =
		Boolean(monitorUrl) && monitorUrl?.origin === allowedOrigin;

	return (
		<div className={classes.root}>
			<header className={classes.header}>
				<div>
					<Title order={2}>SIP Trunk</Title>
					<Text className={classes.subtitle}>
						Monitor SIP connectivity and review every active call handled by the
						agent service.
					</Text>
				</div>
				<Badge color='blue' size='lg'>
					SIP Monitor
				</Badge>
			</header>

			<section>
				{isLoading && <Text>Loading SIP monitor...</Text>}
				{error && <Text c='red'>Error loading SIP monitor URL</Text>}
				{monitorUrl && !isAllowedOrigin && (
					<Alert
						color='red'
						title='Invalid SIP monitor configuration'
						icon={<IconAlertTriangle size={16} />}
					>
						The configured SIP monitor URL is not allowed for this environment.
						Expected origin:{' '}
						<Text component='span' fw={600}>
							{allowedOrigin}
						</Text>
					</Alert>
				)}
				{monitorUrl && isAllowedOrigin && (
					<iframe
						src={monitorUrl.href}
						style={{ width: '100%', height: '600px', border: 'none' }}
						title='SIP Monitor'
					/>
				)}
			</section>
		</div>
	);
};

export default SIPTrunk;
