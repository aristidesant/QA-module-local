import { useEffect, useMemo, useRef } from 'react';
import { Button, CopyButton, Group, Stack, Tooltip } from '@mantine/core';
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
						sourceIndex: index,
					};
				})
				.filter((item): item is VisibleTranscriptEntry => item !== null),
		[canViewTechnicalDetails, transcript]
	);

	const globalToolResultsMap = useMemo(() => {
		const map = new Map<string, ToolResult>();
		for (const entry of transcript) {
			if (entry.tool_results?.length) {
				for (const result of entry.tool_results) {
					if (result.request_id) {
						map.set(result.request_id, result);
					}
				}
			}
		}
		return map;
	}, [transcript]);

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
			<Group justify='flex-end' className={styles.toolbar}>
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
					const visibleToolCalls = isAgent
						? (entry.tool_calls || []).filter(
								(tool) => tool.type !== 'workflow'
							)
						: [];
					const footerMetrics =
						canViewTechnicalDetails && showMetrics
							? buildFooterMetrics(entry, isAgent, t)
							: [];
					const hasMessage = Boolean(entry.message?.trim().length);
					const shouldRenderMessageBubble =
						isSystem ||
						hasMessage ||
						(canViewTechnicalDetails && visibleToolCalls.length > 0);

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
