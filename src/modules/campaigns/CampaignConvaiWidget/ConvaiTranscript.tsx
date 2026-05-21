import { useMemo } from 'react';
import { Button, CopyButton, ScrollArea, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy, IconUser, IconVolume } from '@tabler/icons-react';
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

	return (
		<div className={styles.transcriptShell}>
			<div className={styles.transcriptHeader}>
				<Title order={6} className={styles.transcriptTitle}>
					{labels.title}
				</Title>
				{canCopyTranscript && transcript.length > 0 && (
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
									variant='light'
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

			<ScrollArea className={styles.transcriptScroll} offsetScrollbars>
				{transcript.length > 0 ? (
					<Stack gap={0} className={styles.transcriptList}>
						{transcript.map((item) => {
							const isAgent = item.role === 'agent';
							return (
								<div
									key={item.id}
									className={`${styles.message} ${isAgent ? '' : styles.messageUser}`}
								>
									<span
										className={`${styles.messageAvatar} ${
											isAgent ? styles.messageAvatarAgent : styles.messageAvatarUser
										}`}
									>
										{isAgent ? <IconVolume size={13} /> : <IconUser size={13} />}
									</span>
									<div
										className={`${styles.messageBody} ${
											isAgent ? styles.messageBodyAgent : styles.messageBodyUser
										}`}
									>
										<span className={styles.messageRole}>
											{isAgent ? labels.agent : labels.user}
										</span>
										<p className={styles.messageText}>{item.message}</p>
									</div>
								</div>
							);
						})}
					</Stack>
				) : (
					<Text size='sm' c='dimmed' className={styles.transcriptEmpty}>
						{labels.empty}
					</Text>
				)}
			</ScrollArea>
		</div>
	);
};

export default ConvaiTranscript;
