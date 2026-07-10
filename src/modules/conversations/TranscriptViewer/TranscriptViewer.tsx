import { useEffect, useMemo, useRef } from 'react';
import {
	Badge,
	Button,
	CopyButton,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { usePermissions } from '~/hooks/usePermissions';
import type { ToolResult, TranscriptEntry } from '~/models/ConversationsModels';
import type {
	VisibleTranscriptEntry,
	WorkflowNodeLabels,
	WorkflowNodeLabelsByAgent,
} from './helpers/types';
import {
	buildTranscriptClipboardText,
	isAgentRole,
	isUserRole,
	findPreviousAgentMetadata,
	sanitizeAgentMetadata,
	hasAgentContextChanged,
	findActiveEntryIndex,
	buildFooterMetrics,
} from './helpers/transcriptHelpers';
import { buildToolDisplayRows } from './helpers/formatUtils';
import { hasMeaningfulValue } from './helpers/technicalEntryHelpers';
import { EmptyTranscript } from './components/EmptyTranscript/EmptyTranscript';
import { MessageRow } from './components/MessageRow/MessageRow';
import { WorkflowChangeBanner } from './components/WorkflowChangeBanner/WorkflowChangeBanner';
import styles from './TranscriptViewer.module.css';

export { extractMissionSummary } from './helpers/formatUtils';

interface TranscriptViewerProps {
	transcript: TranscriptEntry[];
	audioCurrentTime?: number;
	isAudioPlaying?: boolean;
	onSeekToTime?: (time: number) => void;
	nodeLabels?: WorkflowNodeLabels;
	nodeLabelsByAgent?: WorkflowNodeLabelsByAgent;
	showMetrics?: boolean;
}

export function TranscriptViewer({
	transcript,
	audioCurrentTime,
	isAudioPlaying,
	onSeekToTime,
	nodeLabels,
	nodeLabelsByAgent,
	showMetrics = true,
}: TranscriptViewerProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const { canPerformAction } = usePermissions();
	const canViewTechnicalDetails = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.MANAGE
	);

	const globalToolResultsMap = useMemo(() => {
		const map = new Map<string, ToolResult[]>();
		for (const entry of transcript) {
			if (entry.tool_results?.length) {
				for (const result of entry.tool_results) {
					if (result.request_id) {
						const existingResults = map.get(result.request_id) ?? [];
						existingResults.push(result);
						map.set(result.request_id, existingResults);
					}
				}
			}
		}
		return map;
	}, [transcript]);

	const visibleEntries = useMemo(
		() =>
			transcript
				.map<VisibleTranscriptEntry | null>((entry, index, allEntries) => {
					const hasMessage = Boolean(entry.message?.trim().length);
					const hasToolCalls = canViewTechnicalDetails
						? buildToolDisplayRows(entry.tool_calls || [], globalToolResultsMap)
								.length > 0
						: false;
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
					const hasTechnicalContent = canViewTechnicalDetails && hasToolCalls;

					if (!hasMessage && !hasTechnicalContent && !workflowTransition) {
						return null;
					}

					return {
						entry,
						workflowTransition,
						sourceIndex: index,
					};
				})
				.filter((item): item is VisibleTranscriptEntry => item !== null),
		[canViewTechnicalDetails, globalToolResultsMap, transcript]
	);

	const technicalSummary = useMemo(() => {
		let toolCalls = 0;
		let workflowCalls = 0;
		let toolResults = 0;
		let errors = 0;
		let updates = 0;

		for (const entry of transcript) {
			for (const tool of entry.tool_calls ?? []) {
				toolCalls += 1;
				if (tool.type === 'workflow') {
					workflowCalls += 1;
				}
			}

			for (const result of entry.tool_results ?? []) {
				toolResults += 1;
				if (result.is_error || result.raw_error_message) {
					errors += 1;
				}
				if (hasMeaningfulValue(result.dynamic_variable_updates)) {
					updates += 1;
				}
			}

			if (hasMeaningfulValue(entry.contextual_update_info)) {
				updates += 1;
			}
		}

		return { errors, toolCalls, toolResults, updates, workflowCalls };
	}, [transcript]);

	const hasTechnicalEvents =
		technicalSummary.toolCalls > 0 ||
		technicalSummary.toolResults > 0 ||
		technicalSummary.updates > 0;

	const transcriptClipboardText = useMemo(
		() =>
			buildTranscriptClipboardText(transcript, nodeLabels, nodeLabelsByAgent),
		[transcript, nodeLabels, nodeLabelsByAgent]
	);

	const activeEntryIndex = useMemo(() => {
		if (audioCurrentTime === undefined || audioCurrentTime < 0) return -1;
		return findActiveEntryIndex(visibleEntries, audioCurrentTime);
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
		return <EmptyTranscript />;
	}

	return (
		<Stack gap='xs' className={styles.transcriptContainer}>
			<Group
				justify='space-between'
				align='center'
				wrap='wrap'
				className={styles.toolbar}
			>
				{canViewTechnicalDetails && hasTechnicalEvents ? (
					<Group gap={4} wrap='wrap' className={styles.technicalSummary}>
						<Text size='xs' fw={600} c='dimmed'>
							{t('transcript.technical.executionSummary')}
						</Text>
						<Badge size='xs' variant='light' color='violet'>
							{t('transcript.technical.toolCallsCount', {
								count: technicalSummary.toolCalls,
							})}
						</Badge>
						<Badge size='xs' variant='light' color='cyan'>
							{t('transcript.technical.workflowCallsCount', {
								count: technicalSummary.workflowCalls,
							})}
						</Badge>
						<Badge size='xs' variant='light' color='grape'>
							{t('transcript.technical.toolResultsCount', {
								count: technicalSummary.toolResults,
							})}
						</Badge>
						{technicalSummary.updates > 0 && (
							<Badge size='xs' variant='light' color='blue'>
								{t('transcript.technical.updatesCount', {
									count: technicalSummary.updates,
								})}
							</Badge>
						)}
						{technicalSummary.errors > 0 && (
							<Badge size='xs' variant='light' color='red'>
								{t('transcript.technical.toolErrorsCount', {
									count: technicalSummary.errors,
								})}
							</Badge>
						)}
					</Group>
				) : (
					<span />
				)}
				<CopyButton value={transcriptClipboardText} timeout={1200}>
					{({ copied, copy }) => (
						<Tooltip
							label={
								copied
									? t('transcript.copiedTranscript')
									: t('transcript.copyTranscript')
							}
							withArrow
							position='top'
							openDelay={100}
							withinPortal
						>
							<Button
								size='xs'
								variant='light'
								leftSection={
									copied ? <IconCheck size={14} /> : <IconCopy size={14} />
								}
								onClick={copy}
								aria-label={t('transcript.copyTranscript')}
							>
								{copied
									? t('transcript.copiedTranscript')
									: t('transcript.copyTranscript')}
							</Button>
						</Tooltip>
					)}
				</CopyButton>
			</Group>
			{visibleEntries.map(
				({ entry, workflowTransition, sourceIndex }, index) => {
					const isAgent = isAgentRole(entry.role);
					const isUser = isUserRole(entry.role);
					const isSystem = !isAgent && !isUser;
					const visibleToolCalls = canViewTechnicalDetails
						? entry.tool_calls || []
						: [];
					const footerMetrics =
						canViewTechnicalDetails && showMetrics
							? buildFooterMetrics(entry, isAgent, t)
							: [];
					const hasMessage = Boolean(entry.message?.trim().length);
					const hasVisibleToolCalls = canViewTechnicalDetails
						? buildToolDisplayRows(visibleToolCalls, globalToolResultsMap)
								.length > 0
						: false;
					const hasTechnicalContent =
						hasVisibleToolCalls || footerMetrics.length > 0;
					const shouldRenderMessageBubble = hasMessage || hasTechnicalContent;

					if (!workflowTransition && !shouldRenderMessageBubble) {
						return null;
					}

					const isActive = index === activeEntryIndex;
					const isSeekable = !isSystem && Boolean(onSeekToTime);

					return (
						<Stack key={`transcript-${sourceIndex}`} gap='xs'>
							{workflowTransition && (
								<WorkflowChangeBanner
									timeInCallSecs={entry.time_in_call_secs}
									transition={workflowTransition}
									nodeLabels={nodeLabels}
									nodeLabelsByAgent={nodeLabelsByAgent}
								/>
							)}
							{shouldRenderMessageBubble && (
								<MessageRow
									isAgent={isAgent}
									isSystem={isSystem}
									message={entry.message}
									timeInCallSecs={entry.time_in_call_secs}
									interrupted={entry.interrupted}
									visibleToolCalls={visibleToolCalls}
									toolResultsMap={globalToolResultsMap}
									footerMetrics={footerMetrics}
									canViewTechnicalDetails={canViewTechnicalDetails}
									isActive={isActive}
									isSeekable={isSeekable}
									onSeekToTime={onSeekToTime}
									activeEntryRef={isActive ? activeEntryRef : undefined}
								/>
							)}
						</Stack>
					);
				}
			)}
		</Stack>
	);
}

export default TranscriptViewer;
