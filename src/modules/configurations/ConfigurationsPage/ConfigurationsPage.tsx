import { Tabs } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import {
	IconSettings,
	IconList,
	IconGlobe,
	IconClockHour4,
	IconPhone,
	IconChartBar,
	IconBook2,
} from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import styles from './ConfigurationsPage.module.css';
export default function ConfigurationsPage() {
	const { t } = useTranslation('configurations');
	const location = useLocation();
	const navigate = useNavigate();
	const isMasterClient = useIsMasterClient();
	const { canPerformAction } = usePermissions();
	const canManageSettings = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.MANAGE
	);

	const getActiveTab = () => {
		if (isMasterClient && location.pathname.includes('client-configs'))
			return 'client-configs';
		if (location.pathname.includes('scheduler-predefined-params'))
			return 'scheduler-predefined-params';
		if (location.pathname.includes('campaign-predefined-params'))
			return 'campaign-predefined-params';
		if (location.pathname.includes('metric-catalog')) return 'metric-catalog';
		if (location.pathname.includes('regional-settings-params'))
			return 'regional-settings-params';
		if (location.pathname.includes('phone-numbers')) return 'phone-numbers';
		if (location.pathname.includes('dictionary-rules'))
			return 'dictionary-rules';
		return isMasterClient ? 'client-configs' : 'campaign-predefined-params';
	};

	useEffect(() => {
		if (!isMasterClient && location.pathname.includes('client-configs')) {
			navigate('/configurations/campaign-predefined-params', { replace: true });
		}
		if (
			!canManageSettings &&
			location.pathname.includes('scheduler-predefined-params')
		) {
			navigate('/configurations/client-configs', { replace: true });
		}
	}, [canManageSettings, isMasterClient, location.pathname, navigate]);

	return (
		<ContentContainer
			title={t('title')}
			description={t('description')}
			titleIcon={<IconSettings size={24} />}
		>
			<Tabs
				value={getActiveTab()}
				variant='outline'
				radius='md'
				classNames={{ tab: styles.tab }}
			>
				<Tabs.List>
					{isMasterClient && (
						<Tabs.Tab
							value='client-configs'
							leftSection={<IconSettings size={16} />}
							onClick={() => navigate('/configurations/client-configs')}
						>
							{t('tabs.global')}
						</Tabs.Tab>
					)}
					<Tabs.Tab
						value='campaign-predefined-params'
						leftSection={<IconList size={16} />}
						onClick={() =>
							navigate('/configurations/campaign-predefined-params')
						}
					>
						{t('tabs.campaign')}
					</Tabs.Tab>
					<Tabs.Tab
						value='metric-catalog'
						leftSection={<IconChartBar size={16} />}
						onClick={() => navigate('/configurations/metric-catalog')}
					>
						{t('tabs.metricCatalog')}
					</Tabs.Tab>
					<Tabs.Tab
						value='regional-settings-params'
						leftSection={<IconGlobe size={16} />}
						onClick={() => navigate('/configurations/regional-settings-params')}
					>
						{t('tabs.regional')}
					</Tabs.Tab>
					{canManageSettings && (
						<Tabs.Tab
							value='scheduler-predefined-params'
							leftSection={<IconClockHour4 size={16} />}
							onClick={() =>
								navigate('/configurations/scheduler-predefined-params')
							}
						>
							{t('tabs.scheduler')}
						</Tabs.Tab>
					)}
					<Tabs.Tab
						value='phone-numbers'
						leftSection={<IconPhone size={16} />}
						onClick={() => navigate('/configurations/phone-numbers')}
					>
						{t('tabs.phoneNumbers')}
					</Tabs.Tab>
					<Tabs.Tab
						value='dictionary-rules'
						leftSection={<IconBook2 size={16} />}
						onClick={() => navigate('/configurations/dictionary-rules')}
					>
						{t('tabs.dictionaryRules')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value={getActiveTab()} py='xs'>
					<Outlet />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
}
