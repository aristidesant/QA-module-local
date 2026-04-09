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
	Tooltip,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconArrowRight,
	IconGitBranch,
	IconMessageOff,
	IconRobot,
	IconTool,
	IconUser,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { usePermissions } from '~/hooks/usePermissions';
import type {
	AgentMetadata,
	ConversationTurnMetrics,
	LlmUsage,
	ToolCall,
	TranscriptEntry,
} from '~/models/ConversationsModels';
import styles from './TranscriptViewer.module.css';

interface TranscriptViewerProps {
	transcript: TranscriptEntry[];
	audioCurrentTime?: number;
	isAudioPlaying?: boolean;
	onSeekToTime?: (time: number) => void;
	nodeLabels?: Record<string, string>;
	nodeMissions?: Record<string, string>;
	/** When false, hides TTS / LLM / ASR metric badges on messages. Defaults to true. */
	showMetrics?: boolean;
}

interface WorkflowTransition {
	from: AgentMetadata;
	to: AgentMetadata;
}

interface VisibleTranscriptEntry {
	entry: TranscriptEntry;
	workflowTransition: WorkflowTransition | null;
}

type FooterMetricKind = 'llm' | 'tts' | 'asr';

interface FooterMetricItem {
	kind: FooterMetricKind;
	label: string;
	latencySeconds: number;
	modelLabel: string;
	costLabel: string;
	details?: {
		name: string;
		cost: string;
	}[];
}

export function TranscriptViewer({
	transcript,
	audioCurrentTime,
	isAudioPlaying,
	onSeekToTime,
	nodeLabels,
	nodeMissions,
	showMetrics = true,
}: TranscriptViewerProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const { canPerformAction } = usePermissions();
	const canViewTechnicalDetails = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.MANAGE
	);

	const visibleEntries = useMemo(
		() =>
			transcript
				.map<VisibleTranscriptEntry | null>((entry, index, allEntries) => {
					const hasMessage = Boolean(entry.message?.trim().length);
					const hasToolCalls = Boolean(entry.tool_calls?.length);
					const hasToolResults = Boolean(entry.tool_results?.length);
					const previousMetadata = findPreviousAgentMetadata(allEntries, index);
					const currentMetadata = sanitizeAgentMetadata(entry.agent_metadata);
					const workflowTransition =
						canViewTechnicalDetails &&
						previousMetadata &&
						currentMetadata &&
						hasAgentContextChanged(previousMetadata, currentMetadata)
							? {
									from: previousMetadata,
									to: currentMetadata,
								}
							: null;

					if (
						!hasMessage &&
						!hasToolCalls &&
						!hasToolResults &&
						!workflowTransition
					) {
						return null;
					}

					return {
						entry,
						workflowTransition,
					};
				})
				.filter((item): item is VisibleTranscriptEntry => item !== null),
		[canViewTechnicalDetails, transcript]
	);

	const activeEntryIndex = useMemo(() => {
		if (audioCurrentTime === undefined || audioCurrentTime < 0) return -1;
		let lastIndex = -1;
		for (let i = 0; i < visibleEntries.length; i++) {
			if (visibleEntries[i].entry.time_in_call_secs <= audioCurrentTime) {
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
			{visibleEntries.map(({ entry, workflowTransition }, index) => {
				const isAgent = entry.role.toLowerCase() === 'agent';
				const isUser =
					entry.role.toLowerCase() === 'user' ||
					entry.role.toLowerCase() === 'human';
				const isSystem = !isAgent && !isUser;
				const hasMessage = Boolean(entry.message?.trim().length);
				const visibleToolCalls = isAgent
					? (entry.tool_calls || []).filter((tool) => tool.type !== 'workflow')
					: [];
				const footerMetrics =
					canViewTechnicalDetails && showMetrics
						? buildFooterMetrics(entry, isAgent, t)
						: [];
				const hasVisibleToolCalls =
					canViewTechnicalDetails && visibleToolCalls.length > 0;
				const shouldRenderMessageBubble =
					isSystem || hasMessage || hasVisibleToolCalls;

				if (!workflowTransition && !shouldRenderMessageBubble) {
					return null;
				}

				return (
					<Stack key={`transcript-${index}`} gap='xs'>
						{workflowTransition && (
							<WorkflowChangeBanner
								timeInCallSecs={entry.time_in_call_secs}
								transition={workflowTransition}
								nodeLabels={nodeLabels}
								nodeMissions={nodeMissions}
							/>
						)}
						{shouldRenderMessageBubble && (
							<Box
								ref={index === activeEntryIndex ? activeEntryRef : undefined}
								className={
									`${styles.messageRow} ` +
									(isSystem
										? styles.centerAligned
										: isAgent
											? styles.rightAligned
											: styles.leftAligned) +
									(index === activeEntryIndex ? ` ${styles.activeEntry}` : '') +
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

											{canViewTechnicalDetails && footerMetrics.length > 0 && (
												<MessageFooterMetrics metrics={footerMetrics} />
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

interface MessageFooterMetricsProps {
	metrics: FooterMetricItem[];
}

function MessageFooterMetrics({ metrics }: MessageFooterMetricsProps) {
	return (
		<Group gap={6} mt='xs' className={styles.messageFooterMetrics}>
			{metrics.map((metric) => (
				<FooterMetricChip key={metric.kind} metric={metric} />
			))}
		</Group>
	);
}

interface FooterMetricChipProps {
	metric: FooterMetricItem;
}

function FooterMetricChip({ metric }: FooterMetricChipProps) {
	const { t } = useTranslation(['conversations', 'common']);

	const metricColor = getFooterMetricColor(metric.kind);

	return (
		<HoverCard width={300} position='top' radius='lg' openDelay={100}>
			<HoverCard.Target>
				<Badge
					size='sm'
					variant='light'
					color={metricColor}
					className={styles.metricChip}
				>
					{metric.label}: {formatFooterLatency(metric.latencySeconds)}
				</Badge>
			</HoverCard.Target>
			<HoverCard.Dropdown className={styles.metricHoverCard}>
				<div className={styles.hoverCardHeader}>
					<Box
						className={styles.hoverCardDot}
						style={{
							backgroundColor: `var(--mantine-color-${metricColor}-5)`,
						}}
					/>
					<Text size='xs' fw={600} c='gray.8'>
						{metric.label}
					</Text>
					<span className={styles.hoverCardLatency}>
						{formatFooterLatency(metric.latencySeconds)}
					</span>
				</div>
				<Stack gap={8}>
					<DetailRow
						label={
							metric.kind === 'asr'
								? t('transcript.footer.provider')
								: t('transcript.footer.model')
						}
						value={<Text size='xs'>{metric.modelLabel}</Text>}
					/>
					<DetailRow
						label={t('transcript.footer.cost')}
						value={
							<Text size='xs' className={styles.monoText}>
								{metric.costLabel}
							</Text>
						}
					/>
				</Stack>
				{metric.details && metric.details.length > 0 && (
					<Box className={styles.breakdownBlock}>
						<span className={styles.breakdownLabel}>
							{t('transcript.footer.breakdown')}
						</span>
						<Stack gap={4}>
							{metric.details.map((detail) => (
								<Group key={detail.name} justify='space-between' gap='xs'>
									<Text size='10px' className={styles.footerMetricName}>
										{detail.name}
									</Text>
									<Text size='10px' className={styles.monoText}>
										{detail.cost}
									</Text>
								</Group>
							))}
						</Stack>
					</Box>
				)}
			</HoverCard.Dropdown>
		</HoverCard>
	);
}

interface WorkflowChangeBannerProps {
	timeInCallSecs: number | undefined;
	transition: WorkflowTransition;
	nodeLabels?: Record<string, string>;
	nodeMissions?: Record<string, string>;
}

function WorkflowChangeBanner({
	timeInCallSecs,
	transition,
	nodeLabels,
	nodeMissions,
}: WorkflowChangeBannerProps) {
	const { t } = useTranslation(['conversations', 'common']);

	return (
		<Box className={`${styles.messageRow} ${styles.workflowChangeRow}`}>
			<Paper radius='sm' p='xs' className={styles.workflowChangeBanner}>
				<Stack gap={6}>
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

					<Group gap='xs' align='stretch' wrap='nowrap'>
						<WorkflowContextCard
							title={t('transcript.workflow.from')}
							metadata={transition.from}
							nodeLabels={nodeLabels}
							nodeMissions={nodeMissions}
						/>
						<Box className={styles.workflowArrow}>
							<IconArrowRight size={14} />
						</Box>
						<WorkflowContextCard
							title={t('transcript.workflow.to')}
							metadata={transition.to}
							nodeLabels={nodeLabels}
							nodeMissions={nodeMissions}
						/>
					</Group>
				</Stack>
			</Paper>
		</Box>
	);
}

interface WorkflowContextCardProps {
	title: string;
	metadata: AgentMetadata;
	nodeLabels?: Record<string, string>;
	nodeMissions?: Record<string, string>;
}

function WorkflowContextCard({
	title,
	metadata,
	nodeLabels,
	nodeMissions,
}: WorkflowContextCardProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const nodeId = metadata.workflow_node_id;
	const nodeName =
		(nodeId && nodeLabels?.[nodeId]) ?? formatWorkflowNodeName(nodeId);
	const mission = nodeId ? nodeMissions?.[nodeId] : undefined;

	return (
		<Box className={styles.workflowContextCard}>
			<Text size='xs' c='dimmed' fw={500} className={styles.workflowCardTitle}>
				{title}
			</Text>
			<Tooltip
				label={
					<Stack gap={4}>
						{mission && (
							<Text size='xs' className={styles.tooltipMission}>
								{t('transcript.technical.mission')}: {mission}
							</Text>
						)}
						{metadata.workflow_node_id && (
							<Text size='xs' className={styles.tooltipMonoText}>
								{t('transcript.technical.workflowNode')}:{' '}
								{metadata.workflow_node_id}
							</Text>
						)}
						<Text size='xs' className={styles.tooltipMonoText}>
							{t('transcript.technical.agentId')}: {metadata.agent_id}
						</Text>
					</Stack>
				}
				position='top'
				withArrow
				multiline
				w={320}
				openDelay={200}
			>
				<Text
					size='xs'
					fw={600}
					c='gray.8'
					className={styles.workflowNodeName}
					span
				>
					{nodeName}
				</Text>
			</Tooltip>
		</Box>
	);
}

function formatWorkflowNodeName(nodeId: string | null): string {
	if (!nodeId) return '—';
	// Remove common prefixes like 'node_', keep the readable suffix
	const cleaned =
		nodeId.replace(/^node_[0-9a-f]+/i, '').replace(/^_/, '') || nodeId;
	// Truncate long IDs to keep display compact
	const display = cleaned.length > 24 ? `${cleaned.slice(0, 22)}…` : cleaned;
	return display || nodeId.slice(0, 24);
}

/**
 * Extracts the first meaningful sentence from an additionalPrompt string.
 * Strips markdown headers (#), horizontal rules (---), and sub-agent header prefixes
 * like "SUB-AGENTE: C1.3.2 — ..." to return a clean, descriptive mission sentence.
 */
export function extractMissionSummary(
	prompt: string | null | undefined
): string | null {
	if (!prompt?.trim()) return null;

	const validLines = prompt
		.split('\n')
		.map((line) => line.trim())
		.filter(
			(line) =>
				line.length > 0 &&
				!line.startsWith('#') &&
				!line.startsWith('---') &&
				!line.startsWith('<')
		);

	if (validLines.length === 0) return null;

	let cleanStr = validLines.join(' ');

	// Skip sub-agent header prefixes like "SUB-AGENTE: C1.3.2 — SECTOR DE..."
	const dashMatch = cleanStr.match(/ — | - /);
	if (dashMatch && dashMatch.index !== undefined && dashMatch.index < 50) {
		cleanStr = cleanStr.substring(dashMatch.index + dashMatch[0].length).trim();
	}

	// Skip known section headers like "Mision", "Misión", "Contexto de entrada"
	const sectionHeaderMatch = cleanStr.match(
		/^(Misi[oó]n|Contexto de entrada|Comportamiento base|Restricciones?)\s*/i
	);
	if (sectionHeaderMatch) {
		cleanStr = cleanStr.substring(sectionHeaderMatch[0].length).trim();
	}

	// Find the first period followed by a space or end of string (ignoring periods in codes like C1.3.2)
	const firstDotMatch = cleanStr.match(/\.(?=\s|$)/);
	const result = firstDotMatch
		? cleanStr.substring(0, firstDotMatch.index! + 1)
		: cleanStr;

	// Don't return very short or very long results
	if (result.length < 5) return null;
	if (result.length > 200) return result.slice(0, 197) + '...';

	return result;
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
	const formattedParams = formatJsonDisplay(tool.params_as_json);

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

interface DetailRowProps {
	label: string;
	value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
	return (
		<Box className={styles.detailRow}>
			<span className={styles.detailLabel}>{label}</span>
			<Box className={styles.detailValue}>{value}</Box>
		</Box>
	);
}

function findPreviousAgentMetadata(
	entries: TranscriptEntry[],
	currentIndex: number
): AgentMetadata | null {
	for (let index = currentIndex - 1; index >= 0; index -= 1) {
		const metadata = sanitizeAgentMetadata(entries[index].agent_metadata);
		if (metadata) {
			return metadata;
		}
	}

	return null;
}

function sanitizeAgentMetadata(metadata?: AgentMetadata): AgentMetadata | null {
	if (!metadata) {
		return null;
	}

	const normalized: AgentMetadata = {
		agent_id: metadata.agent_id ?? '',
		branch_id: metadata.branch_id ?? null,
		workflow_node_id: metadata.workflow_node_id ?? null,
	};

	return normalized.agent_id ||
		normalized.branch_id ||
		normalized.workflow_node_id
		? normalized
		: null;
}

function hasAgentContextChanged(
	previous: AgentMetadata,
	current: AgentMetadata
): boolean {
	return (
		previous.agent_id !== current.agent_id ||
		(previous.branch_id ?? null) !== (current.branch_id ?? null) ||
		(previous.workflow_node_id ?? null) !== (current.workflow_node_id ?? null)
	);
}

function buildFooterMetrics(
	entry: TranscriptEntry,
	isAgent: boolean,
	t: TFunction
): FooterMetricItem[] {
	const items: FooterMetricItem[] = [];

	if (isAgent) {
		const llmMetric = buildLlmFooterMetric(entry, t);
		if (llmMetric) {
			items.push(llmMetric);
		}

		const ttsMetric = buildSpeechFooterMetric(
			'tts',
			entry.conversation_turn_metrics,
			t
		);
		if (ttsMetric) {
			items.push(ttsMetric);
		}

		return items;
	}

	const asrMetric = buildSpeechFooterMetric(
		'asr',
		entry.conversation_turn_metrics,
		t
	);
	if (asrMetric) {
		items.push(asrMetric);
	}

	return items;
}

function buildLlmFooterMetric(
	entry: TranscriptEntry,
	t: TFunction
): FooterMetricItem | null {
	const llmUsage = entry.llm_usage;
	const latencySeconds = getMetricLatency(
		entry.conversation_turn_metrics,
		'convai_llm_service_ttfb',
		'convai_llm_'
	);

	if (!llmUsage || latencySeconds === null) {
		return null;
	}

	const modelEntries = Object.entries(llmUsage.model_usage || {});
	const primaryModelName =
		entry.llm_override ??
		entry.conversation_turn_metrics?.convai_llm_model ??
		modelEntries[0]?.[0] ??
		t('transcript.footer.unknownModel');

	return {
		kind: 'llm',
		label: entry.llm_override
			? t('transcript.footer.override')
			: t('transcript.footer.llm'),
		latencySeconds,
		modelLabel: primaryModelName,
		costLabel: formatCurrency(getTotalLlmCost(llmUsage), t),
		details: modelEntries.map(([name, usage]) => ({
			name,
			cost: formatCurrency(calculateModelCost(usage), t),
		})),
	};
}

function buildSpeechFooterMetric(
	kind: 'tts' | 'asr',
	metrics: ConversationTurnMetrics | null,
	t: TFunction
): FooterMetricItem | null {
	const config =
		kind === 'tts'
			? {
					metricKey: 'convai_tts_service_ttfb',
					prefix: 'convai_tts_',
					label: t('transcript.footer.tts'),
					modelLabel:
						metrics?.convai_tts_model ?? t('transcript.footer.unknownModel'),
				}
			: {
					metricKey: 'convai_asr_trailing_service_latency',
					prefix: 'convai_asr_',
					label: t('transcript.footer.asr'),
					modelLabel:
						metrics?.convai_asr_provider ??
						t('transcript.footer.unknownProvider'),
				};

	const latencySeconds = getMetricLatency(
		metrics,
		config.metricKey,
		config.prefix
	);

	if (latencySeconds === null) {
		return null;
	}

	return {
		kind,
		label: config.label,
		latencySeconds,
		modelLabel: config.modelLabel,
		costLabel: t('transcript.footer.notAvailable'),
	};
}

function getMetricLatency(
	metrics: ConversationTurnMetrics | null,
	preferredKey: string,
	fallbackPrefix: string
): number | null {
	const metricMap = metrics?.metrics;

	if (!metricMap) {
		return null;
	}

	const preferredMetric = metricMap[preferredKey];
	if (typeof preferredMetric?.elapsed_time === 'number') {
		return preferredMetric.elapsed_time;
	}

	for (const [key, value] of Object.entries(metricMap)) {
		if (
			key.startsWith(fallbackPrefix) &&
			typeof value?.elapsed_time === 'number'
		) {
			return value.elapsed_time;
		}
	}

	return null;
}

function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatFooterLatency(seconds: number): string {
	if (seconds < 1) {
		return `${Math.round(seconds * 1000)}ms`;
	}

	const rounded = Number(seconds.toFixed(1));
	return `${rounded}s`;
}

function formatJsonDisplay(value: unknown): string | null {
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return value;
		}
	}

	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
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

function getTotalLlmCost(llmUsage: LlmUsage): number {
	return Object.values(llmUsage.model_usage || {}).reduce(
		(sum, usage) => sum + calculateModelCost(usage),
		0
	);
}

function formatCurrency(value: number, t: TFunction): string {
	return `${t('currency', { ns: 'common' })}${value.toFixed(6)}`;
}

function getFooterMetricColor(kind: FooterMetricKind): string {
	switch (kind) {
		case 'llm':
			return 'cyan';
		case 'tts':
			return 'grape';
		case 'asr':
			return 'teal';
	}
}

export default TranscriptViewer;
