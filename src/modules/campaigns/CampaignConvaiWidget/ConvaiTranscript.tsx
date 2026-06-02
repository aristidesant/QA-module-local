import { useMemo } from 'react';
import { Button, CopyButton, ScrollArea, Text, Tooltip } from '@mantine/core';
import {
	IconCheck,
	IconCopy,
	IconMessageCircle,
	IconVolume,
} from '@tabler/icons-react';
import { type TranscriptItem } from './CampaignConvaiWidget.types';
import styles from './CampaignConvaiWidget.module.css';

export interface ConvaiTranscriptLabels {
	title: string;
	empty: string;
	agent: string;
	user: string;
	copyTranscript: string;
	copiedTranscript: string;
}

export interface ConvaiTranscriptProps {
	transcript: TranscriptItem[];
	labels: ConvaiTranscriptLabels;
	canCopyTranscript: boolean;
}

const formatTime = (timestamp: number) => {
	const date = new Date(timestamp);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ConvaiTranscript = ({
	transcript,
	labels,
	canCopyTranscript,
}: ConvaiTranscriptProps) => {
	const transcriptClipboardText = useMemo(() => {
		return transcript
			.map((item) => {
				const roleLabel = item.role === 'agent' ? labels.agent : labels.user;
				return `${roleLabel}: ${item.message.trim()}`;
			})
			.join('\n\n');
	}, [labels.agent, labels.user, transcript]);

	const groupedMessages = useMemo(() => {
		const groups: Array<{
			role: 'agent' | 'user';
			messages: TranscriptItem[];
			timestamp: number;
			showTimestamp: boolean;
		}> = [];

		transcript.forEach((item) => {
			const lastGroup = groups[groups.length - 1];
			const timeDiff = lastGroup ? item.timestamp - lastGroup.timestamp : 0;
			const shouldShowTimestamp = !lastGroup || timeDiff > 60000;

			if (lastGroup && lastGroup.role === item.role && !shouldShowTimestamp) {
				lastGroup.messages.push(item);
			} else {
				groups.push({
					role: item.role,
					messages: [item],
					timestamp: item.timestamp,
					showTimestamp: shouldShowTimestamp,
				});
			}
		});

		return groups;
	}, [transcript]);

	return (
		<div className={styles.transcriptShell}>
			{transcript.length > 0 && (
				<div className={styles.transcriptHeader}>
					<Text className={styles.transcriptTitle}>{labels.title}</Text>
					{canCopyTranscript && (
						<CopyButton value={transcriptClipboardText} timeout={1200}>
							{({ copied, copy }) => (
								<Tooltip
									label={
										copied ? labels.copiedTranscript : labels.copyTranscript
									}
									withArrow
									position='top'
									openDelay={100}
									withinPortal
								>
									<Button
										size='xs'
										variant='subtle'
										color='gray'
										leftSection={
											copied ? <IconCheck size={14} /> : <IconCopy size={14} />
										}
										onClick={copy}
										aria-label={labels.copyTranscript}
									>
										{copied ? labels.copiedTranscript : labels.copyTranscript}
									</Button>
								</Tooltip>
							)}
						</CopyButton>
					)}
				</div>
			)}

			<ScrollArea className={styles.transcriptScroll} offsetScrollbars>
				{transcript.length > 0 ? (
					<div className={styles.transcriptList}>
						{groupedMessages.map((group, groupIndex) => (
							<div key={groupIndex}>
								{group.showTimestamp && (
									<div className={styles.timestampDivider}>
										<Text className={styles.timestampText}>
											{formatTime(group.timestamp)}
										</Text>
									</div>
								)}

								<div
									className={`${styles.messageGroup} ${
										group.role === 'agent'
											? styles.messageGroupAgent
											: styles.messageGroupUser
									}`}
								>
									{group.role === 'agent' && (
										<span className={styles.messageGroupAvatar}>
											<IconVolume size={12} />
										</span>
									)}

									<Text className={styles.messageRole}>
										{group.role === 'agent' ? labels.agent : labels.user}
									</Text>

									{group.messages.map((item) => (
										<div
											key={item.id}
											className={`${styles.messageBody} ${
												group.role === 'agent'
													? styles.messageBodyAgent
													: styles.messageBodyUser
											}`}
										>
											<p className={styles.messageText}>{item.message}</p>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className={styles.transcriptEmpty}>
						<IconMessageCircle
							size={48}
							className={styles.transcriptEmptyIcon}
						/>
						<Text size='sm' c='dimmed'>
							{labels.empty}
						</Text>
					</div>
				)}
			</ScrollArea>
		</div>
	);
};

export default ConvaiTranscript;
