import React from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Stack, Tabs, Text, Title } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import { DEFAULT_TAB, GLOBAL_CONFIG_TABS } from '../constants';
import type { GlobalConfigTab } from '../types';
import { CallAnalysisTab } from '../tabs/CallAnalysisTab';
import { CampaignTypesTab } from '../tabs/CampaignTypesTab';
import { ContextRulesTab } from '../tabs/ContextRulesTab';
import { EvaluationTab } from '../tabs/EvaluationTab';
import { NamingConventionTab } from '../tabs/NamingConventionTab';
import { ScoreScalesTab } from '../tabs/ScoreScalesTab';
import { SentimentTab } from '../tabs/SentimentTab';

const TAB_KEYS = new Set<string>(GLOBAL_CONFIG_TABS.map((tab) => tab.key));

const PANELS: Record<GlobalConfigTab, React.FC> = {
	callAnalysis: CallAnalysisTab,
	evaluation: EvaluationTab,
	contextRules: ContextRulesTab,
	campaignTypes: CampaignTypesTab,
	namingConvention: NamingConventionTab,
	scoreScales: ScoreScalesTab,
	sentiment: SentimentTab,
};

/**
 * Super admin · Global configuration: the per-client defaults of the active QA
 * workspace (and the sentiment analyzer shared by every client), one tab each.
 */
export const GlobalConfigPage: React.FC = () => {
	const { t } = useTranslation('qa.globalConfig');
	const [searchParams, setSearchParams] = useSearchParams();

	const requested = searchParams.get('tab');
	const tab: GlobalConfigTab =
		requested && TAB_KEYS.has(requested)
			? (requested as GlobalConfigTab)
			: DEFAULT_TAB;
	const setTab = (value: string | null) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (value) next.set('tab', value);
				return next;
			},
			{ replace: true }
		);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Stack gap={0}>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{t('page.eyebrow')}
					</Text>
					<Title order={1}>{t('page.title')}</Title>
					<Text c='dimmed' size='sm'>
						{t(
							tab === 'sentiment'
								? 'page.descriptionShared'
								: 'page.description'
						)}
					</Text>
				</Stack>

				<Tabs value={tab} onChange={setTab} keepMounted={false}>
					<Tabs.List>
						{GLOBAL_CONFIG_TABS.map(({ key, icon: Icon }) => (
							<Tabs.Tab key={key} value={key} leftSection={<Icon size={16} />}>
								{t(`page.tabs.${key}`)}
							</Tabs.Tab>
						))}
					</Tabs.List>

					{GLOBAL_CONFIG_TABS.map(({ key }) => {
						const Panel = PANELS[key];
						return (
							<Tabs.Panel key={key} value={key} pt='lg'>
								<Panel />
							</Tabs.Panel>
						);
					})}
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default GlobalConfigPage;
