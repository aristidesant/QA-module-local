import { Alert, Badge, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('common');
	const { data, isLoading, error } = useClientConfigByName('sip_monitor_url');
	const allowedOrigin = getAllowedOrigin();
	const monitorUrl = data?.value ? resolveMonitorUrl(data.value) : null;
	const isAllowedOrigin =
		Boolean(monitorUrl) && monitorUrl?.origin === allowedOrigin;

	return (
		<div className={classes.root}>
			<header className={classes.header}>
				<div>
					<Title order={2}>{t('sipTrunk.title')}</Title>
					<Text className={classes.subtitle}>{t('sipTrunk.subtitle')}</Text>
				</div>
				<Badge color='blue' size='lg'>
					{t('sipTrunk.badge')}
				</Badge>
			</header>

			<section>
				{isLoading && <Text>{t('sipTrunk.loading')}</Text>}
				{error && <Text c='red'>{t('sipTrunk.error')}</Text>}
				{monitorUrl && !isAllowedOrigin && (
					<Alert
						color='red'
						title={t('sipTrunk.invalidConfig')}
						icon={<IconAlertTriangle size={16} />}
					>
						{t('sipTrunk.invalidConfigDesc', { origin: allowedOrigin })}
					</Alert>
				)}
				{monitorUrl && isAllowedOrigin && (
					<iframe
						src={monitorUrl.href}
						className={classes.monitorFrame}
						title={t('sipTrunk.badge')}
					/>
				)}
			</section>
		</div>
	);
};

export default SIPTrunk;
