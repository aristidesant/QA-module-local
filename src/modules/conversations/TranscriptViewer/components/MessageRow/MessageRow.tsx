import { memo } from 'react';
import { Avatar, Box, Group, Text } from '@mantine/core';
import { IconAlertCircle, IconRobot, IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { FooterMetricItem } from '../../helpers/types';
import type { ToolCall, ToolResult } from '~/models/ConversationsModels';
import { formatTime } from '../../helpers/formatUtils';
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
	toolResultsMap: Map<string, ToolResult>;
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

	if (isSystem) {
		return (
			<Box
				ref={activeEntryRef}
				className={`${styles.messageRow} ${styles.centerAligned}${isActive ? ` ${styles.activeEntry}` : ''}`}
			>
				<SystemBanner message={message!} timeInCallSecs={timeInCallSecs} />
			</Box>
		);
	}

	const hasMessage = Boolean(message?.trim().length);
	const hasVisibleToolCalls =
		canViewTechnicalDetails && visibleToolCalls.length > 0;

	const alignmentClass = isAgent ? styles.leftAligned : styles.rightAligned;
	const bubbleClass = isAgent ? styles.agentBubble : styles.userBubble;

	const handleClick =
		isSeekable && onSeekToTime && timeInCallSecs !== undefined
			? () => onSeekToTime(timeInCallSecs)
			: undefined;

	return (
		<Box
			ref={activeEntryRef}
			className={`${styles.messageRow} ${alignmentClass}${isActive ? ` ${styles.activeEntry}` : ''}${isSeekable ? ` ${styles.seekableEntry}` : ''}`}
			onClick={handleClick}
		>
			<Box className={styles.messageGroup}>
				<Box className={`${styles.messageBubble} ${bubbleClass}`}>
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
							<Text size='xs' fw={600} c={isAgent ? 'blue.7' : 'green.7'}>
								{isAgent
									? t('transcript.roles.agent')
									: t('transcript.roles.user')}
							</Text>
						</Group>
						{timeInCallSecs !== undefined && (
							<Text size='xs' c='dimmed' fw={500} className={styles.timestamp}>
								{formatTime(timeInCallSecs)}
							</Text>
						)}
					</Group>
					{hasMessage && (
						<Text size='sm' className={styles.message}>
							{message}
						</Text>
					)}
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
						<ToolCallsSection
							toolCalls={visibleToolCalls}
							toolResultsMap={toolResultsMap}
						/>
					)}
					{canViewTechnicalDetails && footerMetrics.length > 0 && (
						<MessageFooterMetrics metrics={footerMetrics} />
					)}
				</Box>
			</Box>
		</Box>
	);
});
