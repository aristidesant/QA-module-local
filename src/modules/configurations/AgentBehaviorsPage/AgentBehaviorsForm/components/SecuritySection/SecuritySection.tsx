import { useMemo } from 'react';
import {
	Badge,
	Paper,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconBolt,
	IconClockHour4,
	IconMessageCircle2,
	IconRobot,
	IconSettings2,
	IconShieldLock,
	IconVolume2,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import styles from '../../CampaignPredefinedParamsForm.module.css';

type ToggleItem = {
	path: string;
	labelKey: string;
	descriptionKey: string;
	defaultLabel: string;
	defaultDescription: string;
};

type ToggleGroupConfig = {
	id: string;
	titleKey: string;
	descriptionKey: string;
	icon: typeof IconSettings2;
	iconColor: string;
	items: ToggleItem[];
	span: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
};

const GLOBAL_ITEMS: ToggleItem[] = [
	{
		path: 'platformSettingsOverrides.customLlmExtraBody',
		labelKey: 'form.platformSettings.fields.customLlmExtraBody.label',
		descriptionKey:
			'form.platformSettings.fields.customLlmExtraBody.description',
		defaultLabel: 'Custom LLM extra body',
		defaultDescription:
			'Allow custom request body fields for the agent runtime.',
	},
	{
		path: 'platformSettingsOverrides.enableStartingWorkflowNodeIdFromClient',
		labelKey:
			'form.platformSettings.fields.enableStartingWorkflowNodeIdFromClient.label',
		descriptionKey:
			'form.platformSettings.fields.enableStartingWorkflowNodeIdFromClient.description',
		defaultLabel: 'Starting workflow node from client',
		defaultDescription:
			'Allow the client to set the workflow node that starts the session.',
	},
	{
		path: 'platformSettingsOverrides.enableConversationInitiationClientDataFromWebhook',
		labelKey:
			'form.platformSettings.fields.enableConversationInitiationClientDataFromWebhook.label',
		descriptionKey:
			'form.platformSettings.fields.enableConversationInitiationClientDataFromWebhook.description',
		defaultLabel: 'Conversation initiation client data',
		defaultDescription:
			'Allow webhook payloads to seed client data on conversation start.',
	},
];

const GROUPS: ToggleGroupConfig[] = [
	{
		id: 'tts',
		titleKey: 'form.platformSettings.groups.tts.title',
		descriptionKey: 'form.platformSettings.groups.tts.description',
		icon: IconVolume2,
		iconColor: 'cyan',
		span: 7,
		items: [
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.tts.speed',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.tts.speed.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.tts.speed.description',
				defaultLabel: 'TTS speed',
				defaultDescription: 'Expose the text-to-speech speed override.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.tts.voiceId',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.tts.voiceId.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.tts.voiceId.description',
				defaultLabel: 'TTS voice ID',
				defaultDescription:
					'Expose the text-to-speech voice selection override.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.tts.stability',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.tts.stability.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.tts.stability.description',
				defaultLabel: 'TTS stability',
				defaultDescription: 'Expose the text-to-speech stability override.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.tts.similarityBoost',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.tts.similarityBoost.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.tts.similarityBoost.description',
				defaultLabel: 'TTS similarity boost',
				defaultDescription:
					'Expose the text-to-speech similarity boost override.',
			},
		],
	},
	{
		id: 'turn',
		titleKey: 'form.platformSettings.groups.turn.title',
		descriptionKey: 'form.platformSettings.groups.turn.description',
		icon: IconClockHour4,
		iconColor: 'orange',
		span: 5,
		items: [
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.turn.softTimeoutConfig.message',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.turn.softTimeoutConfig.message.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.turn.softTimeoutConfig.message.description',
				defaultLabel: 'Soft timeout message',
				defaultDescription: 'Allow the soft timeout message to be overridden.',
			},
		],
	},
	{
		id: 'agentPrompt',
		titleKey: 'form.platformSettings.groups.agentPrompt.title',
		descriptionKey: 'form.platformSettings.groups.agentPrompt.description',
		icon: IconRobot,
		iconColor: 'green',
		span: 12,
		items: [
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.agent.prompt.llm',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.llm.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.llm.description',
				defaultLabel: 'Prompt LLM',
				defaultDescription: 'Allow the prompt LLM value to be overridden.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.agent.prompt.prompt',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.prompt.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.prompt.description',
				defaultLabel: 'Prompt text',
				defaultDescription: 'Allow the agent prompt text to be overridden.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.agent.prompt.toolIds',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.toolIds.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.toolIds.description',
				defaultLabel: 'Prompt tool IDs',
				defaultDescription: 'Allow the prompt tool IDs to be overridden.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.agent.prompt.knowledgeBase',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.knowledgeBase.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.knowledgeBase.description',
				defaultLabel: 'Prompt knowledge base',
				defaultDescription: 'Allow the prompt knowledge base to be overridden.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.agent.prompt.nativeMcpServerIds',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.nativeMcpServerIds.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.prompt.nativeMcpServerIds.description',
				defaultLabel: 'Prompt MCP servers',
				defaultDescription: 'Allow the native MCP server IDs to be overridden.',
			},
		],
	},
	{
		id: 'runtime',
		titleKey: 'form.platformSettings.groups.runtime.title',
		descriptionKey: 'form.platformSettings.groups.runtime.description',
		icon: IconBolt,
		iconColor: 'blue',
		span: 6,
		items: [
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.agent.language',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.language.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.language.description',
				defaultLabel: 'Agent language',
				defaultDescription: 'Allow the agent language to be overridden.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.agent.firstMessage',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.firstMessage.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.firstMessage.description',
				defaultLabel: 'First message',
				defaultDescription: 'Allow the first message to be overridden.',
			},
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.agent.maxConversationDurationMessage',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.maxConversationDurationMessage.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.agent.maxConversationDurationMessage.description',
				defaultLabel: 'Max duration message',
				defaultDescription:
					'Allow the max conversation duration message to be overridden.',
			},
		],
	},
	{
		id: 'conversation',
		titleKey: 'form.platformSettings.groups.conversation.title',
		descriptionKey: 'form.platformSettings.groups.conversation.description',
		icon: IconMessageCircle2,
		iconColor: 'grape',
		span: 6,
		items: [
			{
				path: 'platformSettingsOverrides.conversationConfigOverride.conversation.textOnly',
				labelKey:
					'form.platformSettings.fields.conversationConfigOverride.conversation.textOnly.label',
				descriptionKey:
					'form.platformSettings.fields.conversationConfigOverride.conversation.textOnly.description',
				defaultLabel: 'Conversation text only',
				defaultDescription: 'Allow text-only conversations to be overridden.',
			},
		],
	},
];

const getValueAtPath = (source: Record<string, unknown>, path: string) =>
	path.split('.').reduce<unknown>((accumulator, key) => {
		if (!accumulator || typeof accumulator !== 'object') {
			return undefined;
		}

		return (accumulator as Record<string, unknown>)[key];
	}, source);

const getBooleanAtPath = (source: Record<string, unknown>, path: string) =>
	Boolean(getValueAtPath(source, path));

const countEnabled = (source: Record<string, unknown>, items: ToggleItem[]) =>
	items.reduce(
		(total, item) => total + (getBooleanAtPath(source, item.path) ? 1 : 0),
		0
	);

const SecuritySection = () => {
	const { form } = useFormContext();
	const { t } = useTranslation('campaign-predefined-params');

	const values = form.values as unknown as Record<string, unknown>;
	const globalEnabled = countEnabled(values, GLOBAL_ITEMS);
	const groupCount = GROUPS.length + 1;
	const totalToggles =
		GLOBAL_ITEMS.length +
		GROUPS.reduce((sum, group) => sum + group.items.length, 0);
	const enabledToggles =
		globalEnabled +
		GROUPS.reduce((sum, group) => sum + countEnabled(values, group.items), 0);

	const summaryStats = useMemo(
		() => [
			{
				label: t('form.platformSettings.summary.stats.groups', 'Domains'),
				value: String(groupCount),
			},
			{
				label: t('form.platformSettings.summary.stats.toggles', 'Toggles'),
				value: String(totalToggles),
			},
			{
				label: t('form.platformSettings.summary.stats.enabled', 'Enabled'),
				value: String(enabledToggles),
			},
		],
		[enabledToggles, groupCount, t, totalToggles]
	);

	const setToggleValue = (path: string, checked: boolean) => {
		form.setFieldValue(path, checked);
	};

	const renderToggleGroup = (group: ToggleGroupConfig) => {
		const enabledCount = countEnabled(values, group.items);

		return (
			<Paper
				key={group.id}
				withBorder
				radius='lg'
				p='md'
				className={styles.groupCard}
				data-span={group.span}
			>
				<Stack gap='sm'>
					<div className={styles.groupHeader}>
						<div className={styles.groupHeaderLeft}>
							<ThemeIcon
								variant='light'
								color={group.iconColor}
								radius='md'
								size='lg'
								className={styles.groupIcon}
							>
								<group.icon size={16} />
							</ThemeIcon>
							<div className={styles.groupHeaderCopy}>
								<Text size='sm' fw={700} className={styles.groupTitle}>
									{t(group.titleKey)}
								</Text>
								<Text size='xs' c='dimmed' className={styles.groupDescription}>
									{t(group.descriptionKey)}
								</Text>
							</div>
						</div>
						<Badge
							variant='light'
							color={group.iconColor}
							radius='sm'
							size='sm'
						>
							{enabledCount}/{group.items.length}
						</Badge>
					</div>

					<div className={styles.toggleList}>
						{group.items.map((item) => (
							<div key={item.path} className={styles.toggleRow}>
								<div className={styles.toggleCopy}>
									<Text size='sm' fw={600} className={styles.toggleLabel}>
										{t(item.labelKey, item.defaultLabel)}
									</Text>
									<Text
										size='xs'
										c='dimmed'
										className={styles.toggleDescription}
									>
										{t(item.descriptionKey, item.defaultDescription)}
									</Text>
								</div>
								<Switch
									checked={getBooleanAtPath(values, item.path)}
									onChange={(event) =>
										setToggleValue(item.path, event.currentTarget.checked)
									}
									size='sm'
								/>
							</div>
						))}
					</div>
				</Stack>
			</Paper>
		);
	};

	return (
		<Stack className={styles.platformSettingsStack} gap='md'>
			<Paper withBorder radius='xl' p='lg' className={styles.summaryCard}>
				<Stack gap='sm'>
					<div className={styles.summaryHeader}>
						<div className={styles.summaryHeaderCopy}>
							<Badge size='sm' radius='sm' variant='light' color='green'>
								{t('form.platformSettings.summary.badge', 'Platform controls')}
							</Badge>
							<Text size='sm' fw={700} className={styles.summaryTitle}>
								{t(
									'form.platformSettings.summary.title',
									'Client-facing override surface'
								)}
							</Text>
							<Text size='xs' c='dimmed' className={styles.summaryDescription}>
								{t(
									'form.platformSettings.summary.description',
									'Group the booleans by behavior domain so the editor reads like a settings console, not a raw JSON dump.'
								)}
							</Text>
						</div>
						<ThemeIcon variant='light' color='green' radius='xl' size='xl'>
							<IconShieldLock size={20} />
						</ThemeIcon>
					</div>

					<SimpleGrid cols={{ base: 1, sm: 3 }} spacing='sm'>
						{summaryStats.map((stat) => (
							<div key={stat.label} className={styles.summaryStat}>
								<Text size='lg' fw={700} className={styles.summaryStatValue}>
									{stat.value}
								</Text>
								<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
									{stat.label}
								</Text>
							</div>
						))}
					</SimpleGrid>
				</Stack>
			</Paper>

			<Paper withBorder radius='lg' p='md' className={styles.groupCard}>
				<Stack gap='sm'>
					<div className={styles.groupHeader}>
						<div className={styles.groupHeaderLeft}>
							<ThemeIcon
								variant='light'
								color='blue'
								radius='md'
								size='lg'
								className={styles.groupIcon}
							>
								<IconSettings2 size={16} />
							</ThemeIcon>
							<div className={styles.groupHeaderCopy}>
								<Text size='sm' fw={700} className={styles.groupTitle}>
									{t(
										'form.platformSettings.groups.global.title',
										'Global overrides'
									)}
								</Text>
								<Text size='xs' c='dimmed' className={styles.groupDescription}>
									{t(
										'form.platformSettings.groups.global.description',
										'General switches that affect the platform-level payload.'
									)}
								</Text>
							</div>
						</div>
						<Badge variant='light' color='blue' radius='sm' size='sm'>
							{globalEnabled}/{GLOBAL_ITEMS.length}
						</Badge>
					</div>

					<div className={styles.toggleList}>
						{GLOBAL_ITEMS.map((item) => (
							<div key={item.path} className={styles.toggleRow}>
								<div className={styles.toggleCopy}>
									<Text size='sm' fw={600} className={styles.toggleLabel}>
										{t(item.labelKey, item.defaultLabel)}
									</Text>
									<Text
										size='xs'
										c='dimmed'
										className={styles.toggleDescription}
									>
										{t(item.descriptionKey, item.defaultDescription)}
									</Text>
								</div>
								<Switch
									checked={getBooleanAtPath(values, item.path)}
									onChange={(event) =>
										setToggleValue(item.path, event.currentTarget.checked)
									}
									size='sm'
								/>
							</div>
						))}
					</div>
				</Stack>
			</Paper>

			<div className={styles.groupGrid}>{GROUPS.map(renderToggleGroup)}</div>
		</Stack>
	);
};

export default SecuritySection;
