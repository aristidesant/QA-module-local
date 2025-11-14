import { Badge, Text, Title } from '@mantine/core';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import classes from './SIPTrunk.module.css';

const SIPTrunk = () => {
	const { data, isLoading, error } = useClientConfigByName('sip_monitor_url');

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
				{data && (
					<iframe
						src={data.value}
						style={{ width: '100%', height: '600px', border: 'none' }}
						title='SIP Monitor'
					/>
				)}
			</section>
		</div>
	);
};

export default SIPTrunk;
