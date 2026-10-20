import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Paper, Select, Stack, Text } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import EmptyState from '~/components/EmptyState';
import {
	selectContextRules,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import { CodeText } from './CodeText';
import { effectiveRulesFor } from '../helpers';
import { SEED_CAMPAIGNS } from '../seed';

interface RulePreviewDrawerProps {
	opened: boolean;
	onClose: () => void;
}

/** The context an evaluator receives for one campaign once every level has been merged. */
export const RulePreviewDrawer: React.FC<RulePreviewDrawerProps> = ({
	opened,
	onClose,
}) => {
	const { t } = useTranslation('qa.globalConfig');
	const rules = useGlobalConfigStore(selectContextRules);
	const [campaignId, setCampaignId] = useState<string | null>(
		SEED_CAMPAIGNS[0].id
	);

	const campaign = SEED_CAMPAIGNS.find((c) => c.id === campaignId);
	const effective = useMemo(
		() => (campaign ? effectiveRulesFor(campaign, rules) : []),
		[campaign, rules]
	);

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			icon={<IconEye size={20} />}
			title={t('contextRules.previewDrawer.title')}
			description={t('contextRules.previewDrawer.description')}
		>
			<Stack gap='md'>
				<Select
					label={t('contextRules.previewDrawer.campaign')}
					data={SEED_CAMPAIGNS.map((c) => ({
						value: c.id,
						label: `${c.name} · ${c.campaignType}`,
					}))}
					value={campaignId}
					onChange={setCampaignId}
					allowDeselect={false}
					comboboxProps={{ withinPortal: true }}
				/>

				{effective.length === 0 ? (
					<EmptyState
						icon={<IconEye size={40} stroke={1.5} />}
						message={t('contextRules.previewDrawer.empty')}
					/>
				) : (
					<Stack gap='sm'>
						{effective.map((rule) => (
							<Paper key={rule.id} withBorder p='sm' radius='md'>
								<Stack gap={6}>
									<Group justify='space-between' wrap='nowrap'>
										<CodeText fw={600}>{rule.topic}</CodeText>
										<Badge variant='light' color='gray' size='sm'>
											{t(`contextRules.scope.${rule.scope}`)}
										</Badge>
									</Group>
									<Text size='sm'>{rule.context}</Text>
								</Stack>
							</Paper>
						))}
					</Stack>
				)}
			</Stack>
		</AppDrawer>
	);
};

export default RulePreviewDrawer;
