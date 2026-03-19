import { Tabs } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useEdgeConditionModal } from './EdgeConditionModalContext';
import ConditionFields from './ConditionFields';

const EdgeConditionTabs = () => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const { activeTab, setActiveTab } = useEdgeConditionModal();

	return (
		<Tabs
			value={activeTab}
			onChange={(value: string | null) =>
				setActiveTab(() => value as 'forward' | 'backward')
			}
		>
			<Tabs.List>
				<Tabs.Tab value='forward'>
					{t('form.workflow.edge.forward', { defaultValue: 'Forward' })}
				</Tabs.Tab>
				<Tabs.Tab value='backward'>
					{t('form.workflow.edge.backward', { defaultValue: 'Backward' })}
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value='forward' pt='md'>
				<ConditionFields direction='forward' />
			</Tabs.Panel>

			<Tabs.Panel value='backward' pt='md'>
				<ConditionFields direction='backward' />
			</Tabs.Panel>
		</Tabs>
	);
};

export default EdgeConditionTabs;
