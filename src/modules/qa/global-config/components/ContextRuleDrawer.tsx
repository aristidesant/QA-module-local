import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Group,
	SegmentedControl,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import {
	selectCampaignTypes,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import {
	ACTIVE_CLIENT_NAME,
	RULE_AGENT_TYPES,
	RULE_SCOPES,
} from '../constants';
import { nextId } from '../helpers';
import { SEED_CAMPAIGNS } from '../seed';
import type { ContextRule, RuleAgentType, RuleScope } from '../types';

interface ContextRuleDrawerProps {
	opened: boolean;
	onClose: () => void;
	rule?: ContextRule;
	onSave: (rule: ContextRule) => void;
}

const emptyRule = (): ContextRule => ({
	id: nextId('rule'),
	topic: '',
	scope: 'CAMPAIGN_TYPE',
	target: '',
	agentType: 'ALL',
	context: '',
	status: 'ACTIVE',
	updatedAt: '',
});

/** Create or edit one context rule: a topic, the level it applies to and the context text. */
export const ContextRuleDrawer: React.FC<ContextRuleDrawerProps> = ({
	opened,
	onClose,
	rule,
	onSave,
}) => {
	const { t } = useTranslation('qa.globalConfig');
	const campaignTypes = useGlobalConfigStore(selectCampaignTypes);
	const [draft, setDraft] = useState<ContextRule>(rule ?? emptyRule());

	useEffect(() => {
		if (opened) setDraft(rule ?? emptyRule());
	}, [opened, rule]);

	const targetOptions = useMemo(() => {
		if (draft.scope === 'CLIENT')
			return [{ value: 'ALL', label: ACTIVE_CLIENT_NAME }];
		if (draft.scope === 'CAMPAIGN_TYPE')
			return campaignTypes
				.filter((c) => c.code !== 'ALL')
				.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }));
		return SEED_CAMPAIGNS.map((c) => ({ value: c.name, label: c.name }));
	}, [draft.scope, campaignTypes]);

	const setScope = (scope: RuleScope) =>
		setDraft({ ...draft, scope, target: scope === 'CLIENT' ? 'ALL' : '' });

	const invalid =
		draft.topic.trim() === '' ||
		draft.target === '' ||
		draft.context.trim() === '';

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			icon={<IconBook2 size={20} />}
			title={t(
				rule
					? 'contextRules.drawer.editTitle'
					: 'contextRules.drawer.createTitle'
			)}
			description={t('contextRules.drawer.description')}
		>
			<Stack gap='md'>
				<TextInput
					label={t('contextRules.drawer.topic')}
					description={t('contextRules.drawer.topicHelp')}
					placeholder='glosario.polaridad-si-no'
					value={draft.topic}
					onChange={(event) =>
						setDraft({
							...draft,
							topic: event.currentTarget.value
								.toLowerCase()
								.replace(/\s+/g, '-'),
						})
					}
					required
				/>
				<Stack gap={6}>
					<Text size='sm' fw={500}>
						{t('contextRules.drawer.scope')}
					</Text>
					<SegmentedControl
						data={RULE_SCOPES.map((scope) => ({
							value: scope,
							label: t(`contextRules.scope.${scope}`),
						}))}
						value={draft.scope}
						onChange={(value) => setScope(value as RuleScope)}
					/>
				</Stack>
				<Select
					label={t('contextRules.drawer.target')}
					data={targetOptions}
					value={draft.target || null}
					onChange={(target) => setDraft({ ...draft, target: target ?? '' })}
					disabled={draft.scope === 'CLIENT'}
					comboboxProps={{ withinPortal: true }}
					required
				/>
				<Select
					label={t('contextRules.drawer.agentType')}
					data={RULE_AGENT_TYPES.map((type) => ({
						value: type,
						label: t(`contextRules.agentType.${type}`),
					}))}
					value={draft.agentType}
					onChange={(value) =>
						value && setDraft({ ...draft, agentType: value as RuleAgentType })
					}
					allowDeselect={false}
					comboboxProps={{ withinPortal: true }}
				/>
				<Textarea
					label={t('contextRules.drawer.context')}
					description={t('contextRules.drawer.contextHelp')}
					value={draft.context}
					onChange={(event) =>
						setDraft({ ...draft, context: event.currentTarget.value })
					}
					autosize
					minRows={4}
					required
				/>
				<Switch
					color='gray'
					label={t('common.active')}
					checked={draft.status === 'ACTIVE'}
					onChange={(event) =>
						setDraft({
							...draft,
							status: event.currentTarget.checked ? 'ACTIVE' : 'INACTIVE',
						})
					}
				/>
				<Group justify='flex-end' mt='sm'>
					<Button variant='default' onClick={onClose}>
						{t('common.cancel')}
					</Button>
					<Button
						disabled={invalid}
						onClick={() => {
							onSave(draft);
							onClose();
						}}
					>
						{t('common.save')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
};

export default ContextRuleDrawer;
