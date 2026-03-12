import {
	Avatar,
	Badge,
	Box,
	Group,
	HoverCard,
	Paper,
	Popover,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconCpu,
	IconGitBranch,
	IconMessageOff,
	IconRobot,
	IconTool,
	IconUser,
} from '@tabler/icons-react';
import { useMemo, useRef, useEffect } from 'react';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { usePermissions } from '~/hooks/usePermissions';
import type {
	AgentMetadata,
	LlmUsage,
	ToolCall,
	TranscriptEntry,
} from '~/models/ConversationsModels';
import styles from './TranscriptViewer.module.css';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

interface TranscriptViewerProps {
	transcript: TranscriptEntry[];
	audioCurrentTime?: number;
	isAudioPlaying?: boolean;
	onSeekToTime?: (time: number) => void;
}

export function TranscriptViewer({
	transcript,
	audioCurrentTime,
	isAudioPlaying,
	onSeekToTime,
}: TranscriptViewerProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const { canPerformAction } = usePermissions();
	const canViewTechnicalDetails = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.MANAGE
	);

	const visibleEntries = transcript.filter((entry) => {
		const hasMessage = entry.message && entry.message.trim().length > 0;
		const hasToolCalls = entry.tool_calls && entry.tool_calls.length > 0;
		const hasToolResults = entry.tool_results && entry.tool_results.length > 0;
		return hasMessage || hasToolCalls || hasToolResults;
	});

	let lastWorkflowNodeId: string | null = null;
	const entriesWithWorkflowChanges = visibleEntries.map((entry) => {
		const currentWorkflowNodeId =
			entry.agent_metadata?.workflow_node_id ?? null;
		const hasWorkflowChanged =
			!!currentWorkflowNodeId &&
			!!lastWorkflowNodeId &&
			currentWorkflowNodeId !== lastWorkflowNodeId;

		const workflowChange = hasWorkflowChanged
			? {
					from: lastWorkflowNodeId as string,
					to: currentWorkflowNodeId,
				}
			: null;

		if (currentWorkflowNodeId) {
			lastWorkflowNodeId = currentWorkflowNodeId;
		}

		return {
			entry,
			workflowChange,
		};
	});

	const activeEntryIndex = useMemo(() => {
		if (audioCurrentTime === undefined || audioCurrentTime < 0) return -1;
		let lastIndex = -1;
		for (let i = 0; i < visibleEntries.length; i++) {
			if (visibleEntries[i].time_in_call_secs <= audioCurrentTime) {
				lastIndex = i;
			}
		}
		return lastIndex;
	}, [audioCurrentTime, visibleEntries]);

	const activeEntryRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isAudioPlaying && activeEntryRef.current) {
			activeEntryRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			});
		}
	}, [activeEntryIndex, isAudioPlaying]);

	if (!transcript || transcript.length === 0) {
		return (
			<Paper p='xl' radius='md' className={styles.transcriptContainer}>
				<Box className={styles.emptyState}>
					<IconMessageOff
						size={48}
						className={styles.emptyStateIcon}
						stroke={1.5}
					/>
					<Text size='sm' c='dimmed' fw={500}>
						{t('transcript.empty.message')}
					</Text>
					<Text size='xs' c='dimmed' mt={4}>
						{t('transcript.empty.description')}
					</Text>
				</Box>
			</Paper>
		);
	}

	return (
		<Stack gap='xs' className={styles.transcriptContainer}>
			{entriesWithWorkflowChanges.map(({ entry, workflowChange }, index) => {
				const isAgent = entry.role.toLowerCase() === 'agent';
				const isUser =
					entry.role.toLowerCase() === 'user' ||
					entry.role.toLowerCase() === 'human';
				const isSystem = !isAgent && !isUser;
				const hasMessage = !!(entry.message && entry.message.trim().length > 0);
				const visibleToolCalls = isAgent
					? (entry.tool_calls || []).filter((tool) => tool.type !== 'workflow')
					: [];
				const hasVisibleToolCalls =
					canViewTechnicalDetails && visibleToolCalls.length > 0;
				const shouldRenderMessageBubble =
					isSystem || hasMessage || hasVisibleToolCalls;

				if (!workflowChange && !shouldRenderMessageBubble) {
					return null;
				}

				return (
					<Stack key={`transcript-${index}`} gap='xs'>
						{workflowChange && (
							<WorkflowChangeBanner timeInCallSecs={entry.time_in_call_secs} />
						)}
						{shouldRenderMessageBubble && (
							<Box
								ref={
									visibleEntries.indexOf(entry) === activeEntryIndex
										? activeEntryRef
										: undefined
								}
								className={
									`${styles.messageRow} ` +
									(isSystem
										? styles.centerAligned
										: isAgent
											? styles.rightAligned
											: styles.leftAligned) +
									(visibleEntries.indexOf(entry) === activeEntryIndex
										? ` ${styles.activeEntry}`
										: '') +
									(onSeekToTime && !isSystem ? ` ${styles.seekableEntry}` : '')
								}
								onClick={
									onSeekToTime && !isSystem
										? () => onSeekToTime(entry.time_in_call_secs)
										: undefined
								}
							>
								{isSystem ? (
									<Paper radius='xl' p='xs' className={styles.systemBanner}>
										<Group gap={6} justify='center'>
											<Text size='xs' c='dimmed'>
												{entry.message}
											</Text>
											{entry.time_in_call_secs !== undefined && (
												<Text size='xs' c='dimmed' className={styles.timestamp}>
													• {formatTime(entry.time_in_call_secs)}
												</Text>
											)}
										</Group>
									</Paper>
								) : (
									<Box className={styles.messageGroup}>
										<Box
											className={`${styles.messageBubble} ${
												isAgent ? styles.agentBubble : styles.userBubble
											}`}
										>
											<Group justify='space-between' className={styles.meta}>
												<Group gap={6} align='center'>
													<Avatar
														size={20}
														radius='xl'
														color={isAgent ? 'blue' : 'green'}
														variant='light'
														className={styles.avatar}
													>
														{isAgent ? (
															<IconRobot size={12} stroke={2} />
														) : (
															<IconUser size={12} stroke={2} />
														)}
													</Avatar>
													<Text
														size='xs'
														fw={600}
														c={isAgent ? 'blue.7' : 'green.7'}
													>
														{isAgent
															? t('transcript.roles.agent')
															: t('transcript.roles.user')}
													</Text>
												</Group>
												{entry.time_in_call_secs !== undefined && (
													<Text
														size='xs'
														c='dimmed'
														fw={500}
														className={styles.timestamp}
													>
														{formatTime(entry.time_in_call_secs)}
													</Text>
												)}
											</Group>

											{hasMessage && (
												<Text size='sm' className={styles.message}>
													{entry.message}
												</Text>
											)}

											{entry.interrupted && (
												<Group gap={4} mt='xs' className={styles.interrupted}>
													<IconAlertCircle
														size={12}
														color='var(--mantine-color-orange-6)'
													/>
													<Text size='xs' c='orange.6' fw={500}>
														{t('transcript.interrupted')}
													</Text>
												</Group>
											)}

											{hasVisibleToolCalls && (
												<ToolCallsDisplay toolCalls={visibleToolCalls} />
											)}

											{canViewTechnicalDetails && hasMessage && (
												<TechnicalDetailsSection
													entry={entry}
													isAgent={isAgent}
												/>
											)}
										</Box>
									</Box>
								)}
							</Box>
						)}
					</Stack>
				);
			})}
		</Stack>
	);
}

interface WorkflowChangeBannerProps {
	timeInCallSecs?: number;
}

function WorkflowChangeBanner({ timeInCallSecs }: WorkflowChangeBannerProps) {
	const { t } = useTranslation(['conversations', 'common']);

	return (
		<Box className={`${styles.messageRow} ${styles.workflowChangeRow}`}>
			<Paper radius='sm' p='xs' className={styles.workflowChangeBanner}>
				<Stack gap={4}>
					<Group gap={6} justify='space-between' wrap='nowrap'>
						<Group gap={6} align='center' wrap='nowrap'>
							<IconGitBranch
								size={12}
								color='var(--mantine-color-blue-6)'
								stroke={2}
							/>
							<Text size='xs' fw={600} c='gray.8'>
								{t('transcript.workflow.changed')}
							</Text>
						</Group>
						{timeInCallSecs !== undefined && (
							<Text size='xs' c='dimmed' className={styles.timestamp}>
								• {formatTime(timeInCallSecs)}
							</Text>
						)}
					</Group>
				</Stack>
			</Paper>
		</Box>
	);
}

interface ToolCallsDisplayProps {
	toolCalls: ToolCall[];
}

function ToolCallsDisplay({ toolCalls }: ToolCallsDisplayProps) {
	const { t } = useTranslation(['conversations', 'common']);
	return (
		<Box className={styles.toolCallsSection}>
			<Group gap={6} align='center'>
				<IconTool size={12} color='var(--mantine-color-violet-6)' stroke={2} />
				<Text size='xs' c='dimmed' fw={500}>
					{t('transcript.technical.toolCalls')}
				</Text>
			</Group>
			<Group gap={6} mt={4} wrap='wrap'>
				{toolCalls.map((tool, idx) => (
					<ToolCallBadge key={`${tool.request_id}-${idx}`} tool={tool} />
				))}
			</Group>
		</Box>
	);
}

interface ToolCallBadgeProps {
	tool: ToolCall;
}

function ToolCallBadge({ tool }: ToolCallBadgeProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const formattedParams = formatParams(tool.params_as_json);

	return (
		<Popover width={380} position='top' withArrow radius='md'>
			<Popover.Target>
				<Badge
					size='sm'
					variant='light'
					color={tool.tool_has_been_called ? 'violet' : 'gray'}
					leftSection={<IconTool size={10} />}
					className={styles.toolBadge}
				>
					{tool.tool_name}
				</Badge>
			</Popover.Target>
			<Popover.Dropdown className={styles.toolDetailsPopover}>
				<Stack gap='xs'>
					<Group justify='space-between' align='flex-start'>
						<Box>
							<Text size='xs' c='dimmed' fw={500}>
								{t('transcript.technical.toolName')}
							</Text>
							<Text size='sm' fw={600}>
								{tool.tool_name}
							</Text>
						</Box>
						<Badge
							size='xs'
							variant='dot'
							color={tool.tool_has_been_called ? 'green' : 'orange'}
						>
							{tool.tool_has_been_called
								? t('transcript.technical.called')
								: t('transcript.technical.pending')}
						</Badge>
					</Group>

					{tool.type && (
						<Box>
							<Text size='xs' c='dimmed' fw={500}>
								{t('transcript.technical.type')}
							</Text>
							<Text size='sm'>{tool.type}</Text>
						</Box>
					)}

					{formattedParams && (
						<Box>
							<Text size='xs' c='dimmed' fw={500} mb={4}>
								{t('transcript.technical.parameters')}
							</Text>
							<Box className={styles.toolDetailsCode}>{formattedParams}</Box>
						</Box>
					)}

					{tool.request_id && (
						<Box>
							<Text size='xs' c='dimmed' fw={500}>
								{t('transcript.technical.requestId')}
							</Text>
							<Text size='xs' c='dimmed' className={styles.monoText}>
								{tool.request_id}
							</Text>
						</Box>
					)}
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
}

interface TechnicalDetailsSectionProps {
	entry: TranscriptEntry;
	isAgent: boolean;
}

function TechnicalDetailsSection({
	entry,
	isAgent,
}: TechnicalDetailsSectionProps) {
	const { t } = useTranslation(['conversations', 'common']);
	// Check if there's any technical data to show
	const hasLlmUsage = !!(
		entry.llm_usage && Object.keys(entry.llm_usage.model_usage || {}).length > 0
	);
	const hasSourceMedium = !!entry.source_medium;
	const hasAgentMetadata = !!(
		entry.agent_metadata &&
		(entry.agent_metadata.agent_id ||
			entry.agent_metadata.branch_id ||
			entry.agent_metadata.workflow_node_id)
	);
	const hasOriginalMessage = !!(
		entry.original_message && entry.original_message !== entry.message
	);
	const hasRagInfo = !!(
		entry.rag_retrieval_info &&
		Object.keys(entry.rag_retrieval_info as object).length > 0
	);
	const hasTurnMetrics = !!(
		entry.conversation_turn_metrics &&
		Object.keys(entry.conversation_turn_metrics).length > 0
	);

	const hasTechnicalData =
		hasLlmUsage ||
		hasSourceMedium ||
		hasAgentMetadata ||
		hasOriginalMessage ||
		hasRagInfo ||
		hasTurnMetrics;

	// Only show for agent messages with technical data
	if (!isAgent || !hasTechnicalData) {
		return null;
	}

	return (
		<Box className={styles.technicalDetails}>
			<HoverCard width={400} position='left' withArrow shadow='md' radius='md'>
				<HoverCard.Target>
					<Group
						gap={4}
						align='center'
						className={styles.technicalDetailsHeader}
					>
						<IconCpu size={12} color='var(--mantine-color-gray-6)' />
						<Text size='xs' c='dimmed' fw={500}>
							{t('transcript.technical.title')}
						</Text>
						{hasLlmUsage && (
							<Badge
								size='xs'
								variant='light'
								color='cyan'
								className={styles.costBadge}
							>
								{formatTotalCost(entry.llm_usage!, t)}
							</Badge>
						)}
					</Group>
				</HoverCard.Target>
				<HoverCard.Dropdown className={styles.technicalDetailsContent}>
					<Stack gap='xs'>
						{/* LLM Usage */}
						{hasLlmUsage && <LlmUsageDisplay llmUsage={entry.llm_usage!} />}

						{/* Source Medium */}
						{hasSourceMedium && (
							<Box className={styles.detailRow}>
								<Text
									size='xs'
									c='dimmed'
									fw={500}
									className={styles.detailLabel}
								>
									{t('transcript.technical.sourceMedium')}
								</Text>
								<Badge size='xs' variant='light' color='gray'>
									{entry.source_medium}
								</Badge>
							</Box>
						)}

						{/* Agent Metadata */}
						{hasAgentMetadata && (
							<AgentMetadataDisplay metadata={entry.agent_metadata!} />
						)}

						{/* Original Message */}
						{hasOriginalMessage && (
							<Box>
								<Text size='xs' c='dimmed' fw={500} mb={4}>
									{t('transcript.technical.originalMessage')}
								</Text>
								<Text size='xs' c='gray.7' className={styles.monoText}>
									{entry.original_message}
								</Text>
							</Box>
						)}

						{/* RAG Retrieval Info */}
						{hasRagInfo && (
							<Box>
								<Text size='xs' c='dimmed' fw={500} mb={4}>
									{t('transcript.technical.ragInfo')}
								</Text>
								<Box className={styles.toolDetailsCode}>
									{JSON.stringify(entry.rag_retrieval_info, null, 2)}
								</Box>
							</Box>
						)}

						{/* Conversation Turn Metrics */}
						{hasTurnMetrics && (
							<Box>
								<Text size='xs' c='dimmed' fw={500} mb={4}>
									{t('transcript.technical.turnMetrics')}
								</Text>
								<Box className={styles.toolDetailsCode}>
									{JSON.stringify(entry.conversation_turn_metrics, null, 2)}
								</Box>
							</Box>
						)}
					</Stack>
				</HoverCard.Dropdown>
			</HoverCard>
		</Box>
	);
}

interface LlmUsageDisplayProps {
	llmUsage: LlmUsage;
}

function LlmUsageDisplay({ llmUsage }: LlmUsageDisplayProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const models = Object.entries(llmUsage.model_usage || {});

	if (models.length === 0) return null;

	return (
		<Box>
			<Text size='xs' c='dimmed' fw={500} mb={4}>
				{t('transcript.technical.llmUsage')}
			</Text>
			<Stack gap={4}>
				{models.map(([modelName, usage]) => (
					<Box key={modelName} className={styles.llmUsageCard}>
						<Text size='xs' fw={600} c='gray.7' mb={4}>
							{modelName}
						</Text>
						<Box className={styles.llmUsageGrid}>
							<Box className={styles.llmUsageItem}>
								<Text size='xs' c='dimmed'>
									{t('transcript.technical.inputTokens')}
								</Text>
								<Text size='xs' fw={500}>
									{usage.input.tokens.toLocaleString()}
								</Text>
							</Box>
							<Box className={styles.llmUsageItem}>
								<Text size='xs' c='dimmed'>
									{t('transcript.technical.outputTokens')}
								</Text>
								<Text size='xs' fw={500}>
									{usage.output_total.tokens.toLocaleString()}
								</Text>
							</Box>
							<Box className={styles.llmUsageItem}>
								<Text size='xs' c='dimmed'>
									{t('transcript.technical.cacheRead')}
								</Text>
								<Text size='xs' fw={500}>
									{usage.input_cache_read.tokens.toLocaleString()}
								</Text>
							</Box>
							<Box className={styles.llmUsageItem}>
								<Text size='xs' c='dimmed'>
									{t('transcript.technical.cacheWrite')}
								</Text>
								<Text size='xs' fw={500}>
									{usage.input_cache_write.tokens.toLocaleString()}
								</Text>
							</Box>
						</Box>
						<Group gap='xs' mt={4}>
							<Text size='xs' c='dimmed'>
								{t('transcript.technical.totalCost')}
							</Text>
							<Badge
								size='xs'
								variant='light'
								color='green'
								className={styles.costBadge}
							>
								${calculateModelCost(usage).toFixed(6)}
							</Badge>
						</Group>
					</Box>
				))}
			</Stack>
		</Box>
	);
}

interface AgentMetadataDisplayProps {
	metadata: AgentMetadata;
}

function AgentMetadataDisplay({ metadata }: AgentMetadataDisplayProps) {
	const { t } = useTranslation(['conversations', 'common']);
	return (
		<Box>
			<Text size='xs' c='dimmed' fw={500} mb={4}>
				{t('transcript.technical.agentMetadata')}
			</Text>
			<Stack gap={2}>
				{metadata.agent_id && (
					<Group gap='xs'>
						<Text size='xs' c='dimmed' w={80}>
							{t('transcript.technical.agentId')}
						</Text>
						<Text size='xs' className={styles.monoText}>
							{metadata.agent_id}
						</Text>
					</Group>
				)}
				{metadata.branch_id && (
					<Group gap='xs'>
						<Text size='xs' c='dimmed' w={80}>
							{t('transcript.technical.branchId')}
						</Text>
						<Text size='xs' className={styles.monoText}>
							{metadata.branch_id}
						</Text>
					</Group>
				)}
				{metadata.workflow_node_id && (
					<Group gap='xs'>
						<Text size='xs' c='dimmed' w={80}>
							{t('transcript.technical.workflowNode')}
						</Text>
						<Text size='xs' className={styles.monoText}>
							{metadata.workflow_node_id}
						</Text>
					</Group>
				)}
			</Stack>
		</Box>
	);
}

function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatParams(paramsJson: string | null): string | null {
	if (!paramsJson) return null;
	try {
		const parsed = JSON.parse(paramsJson);
		return JSON.stringify(parsed, null, 2);
	} catch {
		return paramsJson;
	}
}

function calculateModelCost(usage: {
	input: { price: number };
	output_total: { price: number };
	input_cache_read: { price: number };
	input_cache_write: { price: number };
}): number {
	return (
		usage.input.price +
		usage.output_total.price +
		usage.input_cache_read.price +
		usage.input_cache_write.price
	);
}

function formatTotalCost(llmUsage: LlmUsage, t: TFunction): string {
	const totalCost = Object.values(llmUsage.model_usage || {}).reduce(
		(sum, usage) => sum + calculateModelCost(usage),
		0
	);
	return `${t('currency', { ns: 'common' })}${totalCost.toFixed(4)}`;
}

export default TranscriptViewer;
