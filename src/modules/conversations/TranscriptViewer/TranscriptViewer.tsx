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
	IconMessageOff,
	IconRobot,
	IconTool,
	IconUser,
} from '@tabler/icons-react';
import { ModuleEnum } from '~/contants/ModuleEnum';
import { PermissionEnum } from '~/contants/PermissionEnum';
import { usePermissions } from '~/hooks/usePermissions';
import type {
	AgentMetadata,
	LlmUsage,
	ToolCall,
	TranscriptEntry,
} from '~/models/ConversationsModels';
import styles from './TranscriptViewer.module.css';

interface TranscriptViewerProps {
	transcript: TranscriptEntry[];
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
	const { canPerformAction } = usePermissions();
	const canViewTechnicalDetails = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.MANAGE
	);

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
						No transcript entries available
					</Text>
					<Text size='xs' c='dimmed' mt={4}>
						Conversation data will appear here once available
					</Text>
				</Box>
			</Paper>
		);
	}

	return (
		<Stack gap='xs' className={styles.transcriptContainer}>
			{transcript
				.filter((entry) => {
					// Skip entries that have no message and no tool calls
					const hasMessage = entry.message && entry.message.trim().length > 0;
					const hasToolCalls = entry.tool_calls && entry.tool_calls.length > 0;
					return hasMessage || hasToolCalls;
				})
				.map((entry, index) => {
					const isAgent = entry.role.toLowerCase() === 'agent';
					const isUser =
						entry.role.toLowerCase() === 'user' ||
						entry.role.toLowerCase() === 'human';
					const isSystem = !isAgent && !isUser;

					return (
						<Box
							key={`transcript-${index}`}
							className={
								`${styles.messageRow} ` +
								(isSystem
									? styles.centerAligned
									: isAgent
										? styles.rightAligned
										: styles.leftAligned)
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
										{/* Header with role and timestamp */}
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
													{isAgent ? 'Agent' : 'User'}
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

										{/* Message content */}
										<Text size='sm' className={styles.message}>
											{entry.message}
										</Text>

										{/* Interrupted indicator */}
										{entry.interrupted && (
											<Group gap={4} mt='xs' className={styles.interrupted}>
												<IconAlertCircle
													size={12}
													color='var(--mantine-color-orange-6)'
												/>
												<Text size='xs' c='orange.6' fw={500}>
													Interrupted
												</Text>
											</Group>
										)}

										{/* Tool calls section - only visible with MANAGE permission */}
										{canViewTechnicalDetails &&
											isAgent &&
											entry.tool_calls &&
											entry.tool_calls.length > 0 && (
												<ToolCallsDisplay toolCalls={entry.tool_calls} />
											)}

										{/* Technical details section - only visible with MANAGE permission */}
										{canViewTechnicalDetails && (
											<TechnicalDetailsSection
												entry={entry}
												isAgent={isAgent}
											/>
										)}
									</Box>
								</Box>
							)}
						</Box>
					);
				})}
		</Stack>
	);
}

interface ToolCallsDisplayProps {
	toolCalls: ToolCall[];
}

function ToolCallsDisplay({ toolCalls }: ToolCallsDisplayProps) {
	return (
		<Box className={styles.toolCallsSection}>
			<Group gap={6} align='center'>
				<IconTool size={12} color='var(--mantine-color-violet-6)' stroke={2} />
				<Text size='xs' c='dimmed' fw={500}>
					Tool calls:
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
								Tool Name
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
							{tool.tool_has_been_called ? 'Called' : 'Pending'}
						</Badge>
					</Group>

					{tool.type && (
						<Box>
							<Text size='xs' c='dimmed' fw={500}>
								Type
							</Text>
							<Text size='sm'>{tool.type}</Text>
						</Box>
					)}

					{formattedParams && (
						<Box>
							<Text size='xs' c='dimmed' fw={500} mb={4}>
								Parameters
							</Text>
							<Box className={styles.toolDetailsCode}>{formattedParams}</Box>
						</Box>
					)}

					{tool.request_id && (
						<Box>
							<Text size='xs' c='dimmed' fw={500}>
								Request ID
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
							Technical Details
						</Text>
						{hasLlmUsage && (
							<Badge
								size='xs'
								variant='light'
								color='cyan'
								className={styles.costBadge}
							>
								{formatTotalCost(entry.llm_usage!)}
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
									Source Medium
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
									Original Message
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
									RAG Retrieval Info
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
									Turn Metrics
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
	const models = Object.entries(llmUsage.model_usage || {});

	if (models.length === 0) return null;

	return (
		<Box>
			<Text size='xs' c='dimmed' fw={500} mb={4}>
				LLM Usage
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
									Input Tokens
								</Text>
								<Text size='xs' fw={500}>
									{usage.input.tokens.toLocaleString()}
								</Text>
							</Box>
							<Box className={styles.llmUsageItem}>
								<Text size='xs' c='dimmed'>
									Output Tokens
								</Text>
								<Text size='xs' fw={500}>
									{usage.output_total.tokens.toLocaleString()}
								</Text>
							</Box>
							<Box className={styles.llmUsageItem}>
								<Text size='xs' c='dimmed'>
									Cache Read
								</Text>
								<Text size='xs' fw={500}>
									{usage.input_cache_read.tokens.toLocaleString()}
								</Text>
							</Box>
							<Box className={styles.llmUsageItem}>
								<Text size='xs' c='dimmed'>
									Cache Write
								</Text>
								<Text size='xs' fw={500}>
									{usage.input_cache_write.tokens.toLocaleString()}
								</Text>
							</Box>
						</Box>
						<Group gap='xs' mt={4}>
							<Text size='xs' c='dimmed'>
								Total Cost:
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
	return (
		<Box>
			<Text size='xs' c='dimmed' fw={500} mb={4}>
				Agent Metadata
			</Text>
			<Stack gap={2}>
				{metadata.agent_id && (
					<Group gap='xs'>
						<Text size='xs' c='dimmed' w={80}>
							Agent ID
						</Text>
						<Text size='xs' className={styles.monoText}>
							{metadata.agent_id}
						</Text>
					</Group>
				)}
				{metadata.branch_id && (
					<Group gap='xs'>
						<Text size='xs' c='dimmed' w={80}>
							Branch ID
						</Text>
						<Text size='xs' className={styles.monoText}>
							{metadata.branch_id}
						</Text>
					</Group>
				)}
				{metadata.workflow_node_id && (
					<Group gap='xs'>
						<Text size='xs' c='dimmed' w={80}>
							Workflow Node
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

function formatTotalCost(llmUsage: LlmUsage): string {
	const totalCost = Object.values(llmUsage.model_usage || {}).reduce(
		(sum, usage) => sum + calculateModelCost(usage),
		0
	);
	return `$${totalCost.toFixed(4)}`;
}

export default TranscriptViewer;
