import { memo } from 'react';
import { ActionIcon, Avatar, Box, Group, Text, Tooltip } from '@mantine/core';
import {
	IconAlertCircle,
	IconPlayerPlayFilled,
	IconRobot,
	IconSettings,
	IconUser,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { FooterMetricItem } from '../../helpers/types';
import type { ToolCall, ToolResult } from '~/models/ConversationsModels';
import {
	buildToolDisplayRows,
	buildToolFooterMetric,
	formatTime,
} from '../../helpers/formatUtils';
import { SystemBanner } from '../SystemBanner';
import { MessageFooterMetrics } from '../FooterMetrics';
import { ToolCallsSection } from '../ToolCallsSection';
import styles from './MessageRow.module.css';

interface MessageRowProps {
	isAgent: boolean;
	isSystem: boolean;
	message: string | null;
	timeInCallSecs: number | undefined;
	interrupted: boolean;
	visibleToolCalls: ToolCall[];
	toolResultsMap: Map<string, ToolResult[]>;
	footerMetrics: FooterMetricItem[];
	canViewTechnicalDetails: boolean;
	isActive: boolean;
	isSeekable: boolean;
	onSeekToTime?: (time: number) => void;
	activeEntryRef?: React.Ref<HTMLDivElement>;
}

export const MessageRow = memo(function MessageRow({
	isAgent,
	isSystem,
	message,
	timeInCallSecs,
	interrupted,
	visibleToolCalls,
	toolResultsMap,
	footerMetrics,
	canViewTechnicalDetails,
	isActive,
	isSeekable,
	onSeekToTime,
	activeEntryRef,
}: MessageRowProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const hasMessage = Boolean(message?.trim().length);
	const toolRows = canViewTechnicalDetails
		? buildToolDisplayRows(visibleToolCalls, toolResultsMap)
		: [];
	const hasVisibleToolCalls = toolRows.length > 0;
	const toolFooterMetric = hasVisibleToolCalls
		? buildToolFooterMetric(toolRows, t)
		: null;
	const combinedFooterMetrics = toolFooterMetric
		? [...footerMetrics, toolFooterMetric]
		: footerMetrics;
	const hasTechnicalContent =
		hasVisibleToolCalls || combinedFooterMetrics.length > 0;
	const canPlayFromHere =
		isSeekable && Boolean(onSeekToTime) && timeInCallSecs !== undefined;

	if (isSystem && hasMessage && !hasTechnicalContent) {
		return (
			<Box
				ref={activeEntryRef}
				className={`${styles.messageRow} ${styles.centerAligned}${isActive ? ` ${styles.activeEntry}` : ''}`}
			>
				<SystemBanner message={message ?? ''} timeInCallSecs={timeInCallSecs} />
			</Box>
		);
	}

	const isToolOnlyEntry = !hasMessage && hasVisibleToolCalls;
	const alignmentClass = isToolOnlyEntry
		? styles.centerAligned
		: isAgent || isSystem
			? styles.leftAligned
			: styles.rightAligned;
	const groupClass = isToolOnlyEntry ? styles.toolGroup : styles.messageGroup;
	const bubbleClass = isToolOnlyEntry
		? `${styles.toolBubble} ${styles.toolBubblePadding}`
		: isAgent
			? styles.agentBubble
			: isSystem
				? styles.systemBubble
				: styles.userBubble;
	const roleLabel = isAgent
		? t('transcript.roles.agent')
		: isSystem
			? t('transcript.roles.system')
			: t('transcript.roles.user');
	const roleColor = isAgent ? 'blue.7' : isSystem ? 'gray.7' : 'green.7';
	const roleIcon = isAgent ? (
		<IconRobot size={12} stroke={2} />
	) : isSystem ? (
		<IconSettings size={12} stroke={2} />
	) : (
		<IconUser size={12} stroke={2} />
	);

	return (
		<Box
			ref={activeEntryRef}
			className={`${styles.messageRow} ${alignmentClass}${isActive ? ` ${styles.activeEntry}` : ''}`}
		>
			<Box className={groupClass}>
				<Box className={`${styles.messageBubble} ${bubbleClass}`}>
					{!isToolOnlyEntry && (
						<Group justify='space-between' className={styles.meta}>
							<Group gap={6} align='center'>
								<Avatar
									size={20}
									radius='xl'
									color={isAgent ? 'blue' : isSystem ? 'gray' : 'green'}
									variant='light'
									className={styles.avatar}
								>
									{roleIcon}
								</Avatar>
								<Text size='xs' fw={600} c={roleColor}>
									{roleLabel}
								</Text>
							</Group>
							<Group gap={6} align='center' wrap='nowrap'>
								{timeInCallSecs !== undefined && (
									<Text
										size='xs'
										c='dimmed'
										fw={500}
										className={styles.timestamp}
									>
										{formatTime(timeInCallSecs)}
									</Text>
								)}
								{canPlayFromHere && (
									<Tooltip
										label={t('transcript.playFromHere')}
										withArrow
										position='top'
										openDelay={200}
									>
										<ActionIcon
											size='xs'
											variant='subtle'
											color='gray'
											radius='xl'
											className={styles.playButton}
											aria-label={t('transcript.playFromHere')}
											onClick={() => onSeekToTime?.(timeInCallSecs as number)}
										>
											<IconPlayerPlayFilled size={11} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						</Group>
					)}
					{hasMessage ? (
						<Text size='sm' className={styles.message}>
							{message}
						</Text>
					) : hasTechnicalContent && !hasVisibleToolCalls ? (
						<Text size='xs' c='dimmed' className={styles.technicalEventLabel}>
							{t('transcript.technical.event')}
						</Text>
					) : null}
					{interrupted && (
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
						<ToolCallsSection rows={toolRows} compact={isToolOnlyEntry} />
					)}
					{canViewTechnicalDetails && combinedFooterMetrics.length > 0 && (
						<MessageFooterMetrics metrics={combinedFooterMetrics} />
					)}
				</Box>
			</Box>
		</Box>
	);
});
